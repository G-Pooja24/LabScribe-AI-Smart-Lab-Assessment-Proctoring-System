import React, { useContext, useState } from 'react';
import { Paper } from '../../types';
import { AppContext } from '../../contexts/AppContext';
import { SearchIcon, CalendarIcon, ClockIcon, BookOpenIcon, ShieldCheckIcon, ChartBarIcon, ChevronRightIcon } from '../common/Icons';

interface SavedPapersProps {
    onViewDetails: (paper: Paper) => void;
    onMonitorPaper: (paper: Paper) => void;
    onViewProctoringReport: (paper: Paper) => void;
}

const SavedPapers: React.FC<SavedPapersProps> = ({ onViewDetails, onMonitorPaper, onViewProctoringReport }) => {
    const { papers, currentUser } = useContext(AppContext);
    const [searchTerm, setSearchTerm] = useState('');

    const teacherPapers = currentUser
        ? papers.filter(p => p.teacherId === currentUser.id &&
            (p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.topic?.toLowerCase().includes(searchTerm.toLowerCase())))
        : [];

    const formatDate = (dateString?: string) => {
        if (!dateString) return '---';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'numeric',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="space-y-6 px-4 py-8 max-w-7xl mx-auto animate-fade-in">
            {/* Styled Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <h3 className="text-3xl font-black text-white tracking-tight font-display">
                    My Saved Papers
                </h3>

                <div className="relative w-full md:w-96">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <SearchIcon className="w-5 h-5 text-brand-text/30" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by title or date..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#0C1B2A]/50 border border-white/5 rounded-xl py-2.5 pl-12 pr-4 text-sm text-white placeholder:text-brand-text/30 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all backdrop-blur-sm"
                    />
                </div>
            </div>

            {/* List of Cards */}
            <div className="flex flex-col gap-4">
                {teacherPapers.length > 0 ? (
                    teacherPapers.map((paper) => {
                        const now = new Date();
                        const start = paper.startTime ? new Date(paper.startTime) : null;
                        const end = paper.endTime ? new Date(paper.endTime) : null;
                        const isLive = start && end && now >= start && now <= end;
                        const hasEnded = end && now.getTime() > (end.getTime() + 1000);

                        return (
                            <div
                                key={paper.id}
                                className="bg-[#1A2C3E]/40 border border-white/5 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 transition-all hover:bg-[#1A2C3E]/60 group"
                            >
                                <div className="flex items-center gap-6 flex-1 w-full">
                                    {/* Left Icon Box */}
                                    <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20">
                                        <ChartBarIcon className="w-7 h-7 text-brand-primary" />
                                    </div>

                                    {/* Information Area */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-lg font-bold text-white group-hover:text-brand-primary transition-colors truncate">
                                            {paper.title || `Paper on ${paper.topic}`}
                                        </h4>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                                            <div className="flex items-center gap-1.5 text-sm text-brand-text/50 font-medium">
                                                <CalendarIcon className="w-4 h-4" />
                                                {formatDate(paper.startTime)}
                                            </div>
                                            <div className="w-1.5 h-1.5 rounded-full bg-white/10 hidden sm:block"></div>
                                            <div className="flex items-center gap-1.5 text-xs font-bold">
                                                {isLive ? (
                                                    <span className="text-rose-500 uppercase flex items-center gap-1.5 tracking-wider">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                                                        Live Now
                                                    </span>
                                                ) : hasEnded ? (
                                                    <span className="text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                                                        <ShieldCheckIcon className="w-3.5 h-3.5" />
                                                        Completed
                                                    </span>
                                                ) : (
                                                    <span className="text-brand-primary uppercase flex items-center gap-1.5 tracking-wider">
                                                        Scheduled
                                                    </span>
                                                )}
                                            </div>
                                            <div className="w-1.5 h-1.5 rounded-full bg-white/10 hidden sm:block"></div>
                                            <div className="text-base text-brand-text/50 font-display tracking-tight flex items-center gap-2">
                                                <span className="text-[10px] uppercase font-bold text-brand-text/30 tracking-widest">Code</span>
                                                <span className="text-xl font-black text-emerald-400 font-mono tracking-wider tabular-nums">{paper.accessCode}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Area */}
                                <div className="flex-shrink-0 pl-0 sm:pl-6 sm:border-l border-white/5 w-full sm:w-auto">
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        {hasEnded ? (
                                            <>
                                                <button
                                                    onClick={() => onViewDetails(paper)}
                                                    className="w-full sm:w-auto bg-white/5 text-white/80 text-[13px] font-bold px-6 py-2.5 rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2 group/btn border border-white/5"
                                                >
                                                    View Details
                                                    <ChevronRightIcon className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                                </button>
                                                <button
                                                    onClick={() => onViewProctoringReport(paper)}
                                                    className="w-full sm:w-auto bg-emerald-500/10 text-emerald-400 text-[13px] font-bold px-6 py-2.5 rounded-xl hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-2 group/btn border border-emerald-500/20 shadow-lg shadow-emerald-500/10"
                                                >
                                                    Proctoring Report
                                                    <ChevronRightIcon className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => (isLive ? onMonitorPaper(paper) : onViewDetails(paper))}
                                                className={`w-full sm:w-auto text-[13px] font-bold px-6 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 border ${isLive
                                                    ? 'bg-rose-500 text-white border-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/20'
                                                    : 'bg-white/5 text-white/80 border-white/5 hover:bg-brand-primary hover:text-white'
                                                    } group/btn`}
                                            >
                                                {isLive ? 'Monitor Live' : 'View Details'}
                                                <ChevronRightIcon className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="py-24 text-center bg-[#1A2C3E]/20 rounded-3xl border border-dashed border-white/5">
                        <BookOpenIcon className="w-12 h-12 text-white/10 mx-auto mb-4" />
                        <p className="text-brand-text/30 font-medium italic">No matching papers found in your database.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SavedPapers;
