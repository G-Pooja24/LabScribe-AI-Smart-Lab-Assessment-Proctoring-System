import React, { useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { Paper } from '../../types';
import { BookOpenIcon, DocumentAddIcon, PencilAltIcon, ChartBarIcon, ShieldCheckIcon } from '../common/Icons';

interface TeacherDashboardHomeProps {
    setActiveView: (view: string) => void;
    onMonitorPaper: (paper: Paper) => void;
    onViewProctoringReport: (paper: Paper) => void;
}

import { ChevronRight, Users, ClipboardCheck, Layout, Activity, Key } from 'lucide-react';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; gradient: string }> = ({ title, value, icon, gradient }) => (
    <div className="relative group overflow-hidden bg-brand-card/30 backdrop-blur-2xl border border-white/10 rounded-2xl p-7 min-h-[125px] flex items-center transition-all duration-500 hover:translate-y-[-4px] hover:bg-brand-card/40 shadow-xl">
        <div className={`absolute top-0 right-0 w-28 h-28 bg-gradient-to-br ${gradient} opacity-[0.03] group-hover:opacity-[0.08] transition-opacity rounded-bl-[100px]`} />
        <div className="flex items-center space-x-5">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradient} text-white shadow-lg shadow-black/20 group-hover:scale-110 transition-transform duration-500`}>
                {icon}
            </div>
            <div>
                <p className="text-[9px] font-black text-brand-text/30 uppercase tracking-[0.2em] mb-1">{title}</p>
                <p className="text-3xl font-black text-brand-text tracking-tighter">{value}</p>
            </div>
        </div>
    </div>
);

const TeacherDashboardHome: React.FC<TeacherDashboardHomeProps> = ({ setActiveView, onMonitorPaper, onViewProctoringReport }) => {
    const { papers, tests, currentUser } = useContext(AppContext);

    if (!currentUser) return null;

    const teacherPapers = papers.filter(p => p.teacherId === currentUser.id);
    const teacherPaperIds = new Set(teacherPapers.map(p => p.id));
    const teacherTests = tests.filter(t => teacherPaperIds.has(t.paper.id));
    const totalQuestions = teacherPapers.reduce((sum, paper) => sum + paper.questions.length, 0);

    const latestPaper = teacherPapers.length > 0
        ? [...teacherPapers].sort((a, b) => {
            const timeA = a.startTime ? new Date(a.startTime).getTime() : 0;
            const timeB = b.startTime ? new Date(b.startTime).getTime() : 0;
            return timeB - timeA;
        })[0]
        : null;

    const latestTest = teacherTests.length > 0 ? [...teacherTests].sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime())[0] : null;
    const isExpired = latestPaper && latestPaper.endTime && new Date() > new Date(latestPaper.endTime);

    return (
        <div className="space-y-8 animate-fade-in max-w-[1400px] mx-auto">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary font-display tracking-tight">
                        Faculty Dashboard
                    </h2>
                    <p className="mt-1.5 text-sm text-brand-text/50 font-medium">
                        Welcome back, {currentUser.name}. Manage your assessments.
                    </p>
                </div>
            </div>

            {/* Top Stat Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <StatCard
                    title="Total Questions"
                    value={totalQuestions}
                    gradient="from-brand-primary/80 to-brand-primary"
                    icon={<BookOpenIcon className="w-5 h-5" />}
                />
                <StatCard
                    title="Papers Created"
                    value={teacherPapers.length}
                    gradient="from-brand-secondary/80 to-brand-secondary"
                    icon={<DocumentAddIcon className="w-5 h-5" />}
                />
                <StatCard
                    title="Submissions"
                    value={teacherTests.length}
                    gradient="from-emerald-500/80 to-emerald-400"
                    icon={<Users className="w-5 h-5" />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-7 max-w-[1200px]">
                {/* Manage Papers Side */}
                <div className="group relative flex flex-col bg-brand-card/40 backdrop-blur-3xl border border-white/10 rounded-[1.5rem] p-6 hover:bg-brand-card/50 transition-all duration-300 shadow-xl overflow-hidden min-h-[320px]">
                    <div className="absolute top-0 right-0 p-5 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                        <Layout className="w-28 h-28 text-brand-primary" />
                    </div>

                    <div className="relative z-10 space-y-5 h-full flex flex-col">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black text-brand-text font-display tracking-tight">Manage Papers</h3>
                            <button onClick={() => setActiveView('generatePaper')} className="text-brand-primary text-[9px] font-black uppercase tracking-widest hover:underline underline-offset-8">View All</button>
                        </div>

                        <div className="flex-1">
                            {latestPaper ? (
                                <div className="p-5 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/5 space-y-3.5 shadow-2xl relative group/paper">
                                    <div className="absolute inset-0 bg-brand-primary/5 opacity-0 group-hover/paper:opacity-100 transition-opacity rounded-2xl blur-xl" />
                                    <div className="relative z-10">
                                        <h4 className="text-xl font-black text-brand-text mb-3 leading-tight">{latestPaper.title}</h4>
                                        <div className="flex flex-wrap items-center gap-3.5">
                                            <div className="flex items-center gap-1.5 text-brand-primary font-black text-xs">
                                                <Key className="w-3.5 h-3.5" />
                                                CODE: {latestPaper.accessCode || 'N/A'}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-brand-text/50 font-bold text-[10px]">
                                                <Activity className="w-3 h-3 text-emerald-400" />
                                                {latestPaper.difficulty}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-28 flex items-center justify-center border-2 border-dashed border-white/5 rounded-2xl bg-white/5">
                                    <p className="text-brand-text/20 font-bold text-xs italic">Initiate your first paper</p>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-2.5 pt-3">
                            <button
                                onClick={() => setActiveView('generatePaper')}
                                className="group/btn flex items-center gap-2 bg-gradient-to-r from-brand-primary to-brand-secondary text-[#0C1B2A] font-black py-2.5 px-5 rounded-xl text-xs hover:scale-105 active:scale-95 transition-all shadow-lg"
                            >
                                <DocumentAddIcon className="w-3.5 h-3.5" />
                                Engine Paper
                            </button>
                            {latestPaper && (
                                isExpired ? (
                                    <button
                                        onClick={() => onViewProctoringReport(latestPaper)}
                                        className="flex items-center gap-2 bg-white/5 border border-white/10 text-brand-text font-black py-2.5 px-5 rounded-xl text-xs hover:bg-white/10 transition-all group/proctor"
                                    >
                                        <ShieldCheckIcon className="w-3.5 h-3.5 text-brand-secondary" />
                                        Analytics
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => onMonitorPaper(latestPaper)}
                                        className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 font-black py-2.5 px-5 rounded-xl text-xs hover:bg-rose-500/20 transition-all group/monitor"
                                    >
                                        <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                                        Live Monitor
                                    </button>
                                )
                            )}
                        </div>
                    </div>
                </div>

                {/* Submissions Side */}
                <div className="group relative flex flex-col bg-brand-card/40 backdrop-blur-3xl border border-white/10 rounded-[1.5rem] p-6 hover:bg-brand-card/50 transition-all duration-300 shadow-xl overflow-hidden min-h-[320px]">
                    <div className="absolute top-0 right-0 p-5 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                        <ClipboardCheck className="w-28 h-28 text-emerald-400" />
                    </div>

                    <div className="relative z-10 space-y-5 h-full flex flex-col">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black text-brand-text font-display tracking-tight">Recent Submissions</h3>
                            <button onClick={() => setActiveView('studentResults')} className="text-emerald-400 text-[9px] font-black uppercase tracking-widest hover:underline underline-offset-8">History</button>
                        </div>

                        <div className="flex-1">
                            {latestTest ? (
                                <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-transparent border border-white/5 space-y-3.5 shadow-2xl relative group/submission">
                                    <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover/submission:opacity-100 transition-opacity rounded-2xl blur-xl" />
                                    <div className="relative z-10 space-y-3.5">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-9 h-9 rounded-full bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400">
                                                <Users size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-black uppercase tracking-widest text-emerald-400/60 mb-0.5">Latest Submission</p>
                                                <p className="text-base font-black text-brand-text">{latestTest.studentName}</p>
                                            </div>
                                        </div>
                                        <div className="pt-2.5 border-t border-white/10">
                                            <p className="text-[8px] font-black uppercase tracking-widest text-brand-text/30 mb-0.5">Attempted Assessment</p>
                                            <p className="text-lg font-black text-brand-text tracking-tight">{latestTest.paper.title}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-28 flex items-center justify-center border-2 border-dashed border-white/5 rounded-2xl bg-white/5">
                                    <p className="text-brand-text/20 font-bold text-xs italic">Awaiting submissions</p>
                                </div>
                            )}
                        </div>

                        <div className="pt-3">
                            <button
                                onClick={() => setActiveView('studentResults')}
                                className="group/btn flex items-center justify-center gap-2 w-full bg-white/5 border border-white/10 text-brand-text font-black py-3.5 px-6 rounded-xl text-xs hover:bg-white/10 hover:border-emerald-400/40 transition-all hover:scale-[1.02]"
                            >
                                <ChartBarIcon className="w-4 h-4 text-emerald-400" />
                                Analytical Reports
                                <ChevronRight className="w-4 h-4 text-brand-text/20 group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboardHome;