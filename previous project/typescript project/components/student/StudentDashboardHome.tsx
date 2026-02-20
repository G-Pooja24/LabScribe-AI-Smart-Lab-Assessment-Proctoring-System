import React, { useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { User, Test, QuestionType } from '../../types';
import { getAssignedQuestions } from '../../utils/questionUtils';
import {
    PencilAltIcon,
    ShieldCheckIcon,
    ChartBarIcon,
    DocumentAddIcon,
    HistoryIcon,
    BookOpenIcon
} from '../common/Icons';

interface StudentDashboardHomeProps {
    setActiveView: (view: string) => void;
    onViewDetails: (test: Test) => void;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string; gradient: string }> = ({ title, value, icon, color, gradient }) => (
    <div className="relative group overflow-hidden bg-brand-card/30 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 transition-all duration-500 hover:translate-y-[-4px] hover:bg-brand-card/50 shadow-lg hover:shadow-2xl hover:shadow-brand-primary/10">
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-[0.03] group-hover:opacity-[0.08] transition-opacity rounded-bl-[100px]`} />

        <div className="flex flex-col space-y-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${gradient} text-white shadow-lg shadow-black/20`}>
                {icon}
            </div>
            <div>
                <p className="text-xs font-bold text-brand-text/40 uppercase tracking-[0.2em] mb-1">{title}</p>
                <div className="flex items-baseline space-x-2">
                    <p className="text-3xl font-black text-brand-text tracking-tight">{value}</p>
                </div>
            </div>
        </div>

        {/* Subtle Bottom Glow */}
        <div className={`absolute bottom-0 left-6 right-6 h-[2px] bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-100 transition-opacity blur-[1px]`} />
    </div>
);

const StudentDashboardHome: React.FC<StudentDashboardHomeProps> = ({ setActiveView, onViewDetails }) => {
    const { papers, tests, currentUser } = useContext(AppContext);

    if (!currentUser) return null;

    // Filter tests for the current student
    const myTests = tests.filter(test => test.studentId === currentUser.id);

    const latestTest = myTests.length > 0
        ? [...myTests].sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime())[0]
        : null;

    const takenPaperIds = new Set(myTests.map(test => test.paper.id));

    // Prioritize papers by startTime
    const sortedPapers = [...papers].sort((a, b) => {
        const timeA = a.startTime ? new Date(a.startTime).getTime() : 0;
        const timeB = b.startTime ? new Date(b.startTime).getTime() : 0;
        return timeB - timeA;
    });

    const nextTest = sortedPapers.find(paper => {
        const isTaken = takenPaperIds.has(paper.id);
        const end = paper.endTime ? new Date(paper.endTime) : null;
        const isExpired = end && new Date() > end;
        return !isTaken && !isExpired;
    });

    const upcomingTestsCount = sortedPapers.filter(paper => {
        const isTaken = takenPaperIds.has(paper.id);
        const end = paper.endTime ? new Date(paper.endTime) : null;
        const isExpired = end && new Date() > end;
        return !isTaken && !isExpired;
    }).length;

    const totalExams = new Set(myTests.map(t => t.paper.id)).size;

    // Calculate Participation Metrics
    let totalQuestions = 0;
    myTests.forEach(t => {
        totalQuestions += getAssignedQuestions(t.paper, t.studentId).length;
    });

    const lastActivity = latestTest ? new Date(latestTest.submittedAt).toLocaleDateString() : 'N/A';

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary font-display">
                        Student Station
                    </h2>
                    <p className="mt-2 text-brand-text/70">
                        Welcome back, {currentUser.name}! Ready to excel?
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Upcoming"
                    value={upcomingTestsCount}
                    color="brand-primary"
                    gradient="from-brand-primary/80 to-brand-primary"
                    icon={<PencilAltIcon className="w-5 h-5" />}
                />
                <StatCard
                    title="Exams Given"
                    value={totalExams}
                    color="brand-secondary"
                    gradient="from-brand-secondary/80 to-brand-secondary"
                    icon={<ShieldCheckIcon className="w-5 h-5" />}
                />
                <StatCard
                    title="Total Questions"
                    value={totalQuestions}
                    color="emerald-400"
                    gradient="from-emerald-500/80 to-emerald-400"
                    icon={<ChartBarIcon className="w-5 h-5" />}
                />
                <StatCard
                    title="Last Activity"
                    value={lastActivity}
                    color="amber-400"
                    gradient="from-amber-500/80 to-amber-400"
                    icon={<DocumentAddIcon className="w-5 h-5" />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upcoming Test Section */}
                <div className="lg:col-span-2 space-y-6 flex flex-col h-full">
                    <div className="flex items-center justify-between h-9 shrink-0">
                        <h3 className="text-2xl font-bold text-brand-text font-display">Active Assessment</h3>
                        <button onClick={() => setActiveView('takeTest')} className="text-brand-primary text-sm hover:underline">View All Papers</button>
                    </div>

                    <div className="flex-1 bg-brand-card/30 backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 transition-opacity group-hover:opacity-20">
                            <PencilAltIcon className="w-32 h-32 text-brand-primary" />
                        </div>

                        {nextTest ? (
                            <div className="relative z-10">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-2">

                                        <h4 className="text-3xl font-bold text-brand-text">{nextTest.examTitle || nextTest.title}</h4>
                                        <div className="flex items-center gap-4 text-brand-text/60 text-sm">
                                            <span className="flex items-center gap-1"><HistoryIcon className="w-4 h-4" /> {
                                                (nextTest.startTime && nextTest.endTime)
                                                    ? Math.round((new Date(nextTest.endTime).getTime() - new Date(nextTest.startTime).getTime()) / 60000)
                                                    : 60
                                            } Mins</span>
                                            <span className="flex items-center gap-1"><BookOpenIcon className="w-4 h-4" /> {getAssignedQuestions(nextTest, currentUser.id).length} Questions</span>
                                        </div>
                                    </div>

                                    <div className="text-right hidden sm:block">
                                        <p className="text-xs text-brand-text/40 uppercase">Difficulty</p>
                                        <p className={`text-lg font-bold ${nextTest.difficulty === 'Hard' ? 'text-red-400' : 'text-green-400'}`}>{nextTest.difficulty}</p>
                                    </div>
                                </div>

                                {(() => {
                                    const now = new Date();
                                    const start = nextTest.startTime ? new Date(nextTest.startTime) : null;
                                    const end = nextTest.endTime ? new Date(nextTest.endTime) : null;
                                    const isActive = start && end && now >= start && now <= end;
                                    const isFuture = start && now < start;

                                    if (isFuture) {
                                        return (
                                            <div className="mt-8">
                                                <p className="text-brand-primary font-bold animate-pulse">Starts in {Math.round((start.getTime() - now.getTime()) / 60000)} minutes</p>
                                            </div>
                                        );
                                    }

                                    const isSubmitted = myTests.some(t => t.paper.id === nextTest.id);

                                    if (isSubmitted) {
                                        return (
                                            <div className="mt-8">
                                                <button disabled className="bg-gray-500/20 text-gray-400 font-bold py-4 px-10 rounded-2xl cursor-not-allowed flex items-center gap-2">
                                                    <ShieldCheckIcon className="w-5 h-5" />
                                                    Assessment Completed
                                                </button>
                                            </div>
                                        );
                                    }

                                    return (
                                        <button
                                            onClick={() => setActiveView('takeTest')}
                                            className="mt-8 bg-brand-primary text-brand-text font-bold py-4 px-10 rounded-2xl hover:bg-brand-secondary transition-all transform hover:scale-105 shadow-xl shadow-brand-primary/30 flex items-center gap-2 group"
                                        >
                                            Start Assessment
                                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </button>
                                    );
                                })()}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-brand-text/50">No active assessments available at the moment.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Performance Section */}
                <div className="space-y-6 flex flex-col h-full">
                    <div className="flex items-center h-9 shrink-0">
                        <h3 className="text-2xl font-bold text-brand-text font-display whitespace-nowrap">Recent History</h3>
                    </div>
                    <div className="flex-1 bg-brand-card/30 backdrop-blur-xl border border-white/10 rounded-3xl p-6 relative overflow-hidden">
                        {latestTest ? (
                            <div className="space-y-5">
                                <div className="space-y-3">
                                    <p className="text-[10px] text-brand-text/40 uppercase tracking-widest font-bold">Latest Attempt</p>
                                    <div className="overflow-hidden">
                                        <h5 className="text-base font-bold text-brand-text truncate" title={latestTest.paper.title}>{latestTest.paper.title}</h5>
                                        <p className="text-xs text-brand-text/60">Completed on {new Date(latestTest.submittedAt).toLocaleDateString()}</p>
                                    </div>

                                    <button
                                        onClick={() => onViewDetails(latestTest)}
                                        className="w-full flex items-center justify-between p-3.5 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all group mt-2"
                                    >
                                        <span className="text-xs font-bold text-brand-text/80">Detailed Report</span>
                                        <div className="p-1.5 bg-brand-primary/20 text-brand-primary rounded-lg group-hover:bg-brand-primary transition-colors group-hover:text-brand-text">
                                            <ChartBarIcon className="w-4 h-4" />
                                        </div>
                                    </button>
                                </div>

                                <div className="pt-4 border-t border-white/5">
                                    <p className="text-[10px] leading-relaxed text-brand-text/50">
                                        Performance analytics are processed automatically after submission.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-brand-text/50 text-center py-10 text-sm">No recent activity detected.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboardHome;