import React, { useState, useEffect } from 'react';
import { Violation, Paper } from '../../types';
import { Shield, AlertTriangle, User, Clock, ChevronLeft, Download, FileText, BarChart2 } from 'lucide-react';

interface ProctoringReportProps {
    paper: Paper;
    onBack: () => void;
}

const ProctoringReport: React.FC<ProctoringReportProps> = ({ paper, onBack }) => {
    const [violations, setViolations] = useState<Violation[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchViolations = async () => {
            try {
                const response = await fetch(`http://localhost:8087/api/violations/paper/${paper.id}`);
                const data = await response.json();
                setViolations(data);
            } catch (err) {
                console.error("Error fetching violations:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchViolations();
    }, [paper.id]);

    const getViolationStyle = (type: string) => {
        switch (type) {
            case 'TAB_SWITCH': return 'bg-rose-500/10 border-rose-500/30 text-rose-500';
            case 'FULLSCREEN_EXIT': return 'bg-amber-500/10 border-amber-500/30 text-amber-500';
            default: return 'bg-blue-500/10 border-blue-500/30 text-blue-500';
        }
    };

    const studentStats = Array.from(new Set(violations.map(v => v.studentId))).map(id => {
        const studentViolations = violations.filter(v => v.studentId === id);
        return {
            id,
            name: studentViolations[0]?.studentName || 'Unknown',
            count: studentViolations.length,
            latest: studentViolations[0]?.timestamp
        };
    }).sort((a, b) => b.count - a.count);

    const handleDownload = () => {
        const title = `Proctoring_Report_${paper.title.replace(/\s+/g, '_')}`;
        let content = `PROCTORING REPORT - ${paper.title}\n`;
        content += `Generated on: ${new Date().toLocaleString()}\n`;
        content += `Total Violations: ${violations.length}\n`;
        content += `Students Flagged: ${studentStats.length}\n`;
        content += `==========================================\n\n`;

        content += `SUMMARY BY STUDENT:\n`;
        studentStats.forEach(s => {
            content += `- ${s.name}: ${s.count} violations\n`;
        });

        content += `\nDETAILED LOG:\n`;
        violations.forEach(v => {
            content += `[${new Date(v.timestamp!).toLocaleString()}] ${v.studentName}: ${v.violationType} - ${v.details}\n`;
        });

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-brand-text/50 font-bold tracking-widest uppercase text-xs">Loading Violation Data...</p>
            </div>
        );
    }

    return (
        <div className="animate-reveal">
            {/* Header Actions */}
            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={onBack}
                    className="flex items-center space-x-2 text-brand-text/60 hover:text-brand-primary transition-colors font-bold"
                >
                    <ChevronLeft size={20} />
                    <span>Back to Papers</span>
                </button>
                <div className="flex space-x-4">
                    <button
                        onClick={handleDownload}
                        className="flex items-center space-x-2 bg-brand-primary/10 text-brand-primary border border-brand-primary/20 px-4 py-2 rounded-xl hover:bg-brand-primary hover:text-white transition-all font-bold shadow-lg"
                    >
                        <Download size={18} />
                        <span>Export Report</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Statistics Cards */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-brand-card border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Shield size={64} className="text-brand-primary" />
                        </div>
                        <h3 className="text-xs font-bold text-brand-primary uppercase tracking-[0.2em] mb-4">Integrity Summary</h3>
                        <div className="space-y-6">
                            <div>
                                <p className="text-3xl font-bold text-brand-text">{violations.length}</p>
                                <p className="text-xs text-brand-text/40 font-medium">Total Violations Detected</p>
                            </div>
                            <div className="pt-6 border-t border-white/5">
                                <p className="text-3xl font-bold text-brand-text">{studentStats.length}</p>
                                <p className="text-xs text-brand-text/40 font-medium">Students Flagged</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-brand-card border border-white/5 rounded-2xl p-6 shadow-xl">
                        <h3 className="text-xs font-bold text-brand-text/40 uppercase tracking-[0.2em] mb-6 flex items-center">
                            <BarChart2 size={14} className="mr-2" />
                            By Type
                        </h3>
                        <div className="space-y-4">
                            {['TAB_SWITCH', 'FOCUS_LOSS', 'FULLSCREEN_EXIT', 'COPY_PASTE'].map(type => {
                                const count = violations.filter(v => v.violationType === type).length;
                                const percentage = violations.length > 0 ? (count / violations.length) * 100 : 0;
                                if (count === 0) return null;
                                return (
                                    <div key={type} className="space-y-2">
                                        <div className="flex justify-between items-center text-[10px] font-bold">
                                            <span className="text-brand-text/60">{type.replace('_', ' ')}</span>
                                            <span className="text-brand-text">{count}</span>
                                        </div>
                                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-brand-primary" style={{ width: `${percentage}%` }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Detailed Records */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-brand-card border border-white/5 rounded-2xl shadow-xl overflow-hidden">
                        <div className="bg-white/5 px-6 py-4 flex items-center justify-between border-b border-white/5">
                            <h3 className="text-sm font-bold text-brand-text flex items-center">
                                <FileText size={16} className="mr-2 text-brand-primary" />
                                Audit Log
                            </h3>
                        </div>
                        <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                            {violations.length === 0 ? (
                                <div className="p-20 text-center">
                                    <Shield className="mx-auto mb-4 text-brand-text/10" size={48} />
                                    <p className="text-brand-text/30 font-bold uppercase tracking-widest text-xs">No Violations Found</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-white/5">
                                    {violations.map((v, i) => (
                                        <div key={v.id || i} className="p-5 hover:bg-white/5 transition-colors">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center space-x-3">
                                                    <div className="bg-brand-primary/10 w-8 h-8 rounded-full flex items-center justify-center text-brand-primary font-bold text-xs">
                                                        {v.studentName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-bold text-brand-text">{v.studentName}</h4>
                                                        <p className="text-xs text-brand-text/40 font-mono">ID: {v.studentId}</p>
                                                    </div>
                                                </div>
                                                <span className="text-xs text-brand-text/50 font-bold">
                                                    {v.timestamp ? new Date(v.timestamp).toLocaleString() : 'N/A'}
                                                </span>
                                            </div>
                                            <div className="ml-11">
                                                <p className="text-sm text-brand-text/70 mb-3">{v.details}</p>
                                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getViolationStyle(v.violationType)}`}>
                                                    {v.violationType.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProctoringReport;
