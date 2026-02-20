import React, { useState } from 'react';
import { Role, User, Test, Paper } from '../../types';
import DashboardLayout from '../common/DashboardLayout';
import { HomeIcon, BookOpenIcon, DocumentAddIcon, ChatIcon, LogoutIcon, MicrophoneIcon, ChartBarIcon, UserIcon, CogIcon } from '../common/Icons';
import TeacherDashboardHome from './TeacherDashboardHome';
import QuestionBank from './QuestionBank';
import GeneratePaper from './GeneratePaper';
import TeacherResults from './TeacherResults';
import Profile from '../common/Profile';
import ResultDetails from '../common/ResultDetails';
import PaperDetails from './PaperDetails';
import LiveMonitor from './LiveMonitor';
import ProctoringReport from './ProctoringReport';
import SavedPapers from './SavedPapers';
import { Home, Book, FilePlus, Users as UsersIcon, User as UserIconLucide, LogOut, FileText } from 'lucide-react';

interface TeacherDashboardProps {
    user: User;
    onLogout: () => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ user, onLogout }) => {
    const [activeView, setActiveView] = useState('home');
    const [viewingResult, setViewingResult] = useState<Test | null>(null);
    const [viewingPaper, setViewingPaper] = useState<Paper | null>(null);
    const [monitoringPaper, setMonitoringPaper] = useState<Paper | null>(null);
    const [proctoringReportPaper, setProctoringReportPaper] = useState<Paper | null>(null);


    const handleSetActiveView = (view: string) => {
        setViewingResult(null);
        setViewingPaper(null);
        setMonitoringPaper(null);
        setProctoringReportPaper(null);
        setActiveView(view);

    };

    const navItems = [
        { label: 'Dashboard', icon: <Home size={18} />, view: 'home' },
        { label: 'Question Bank', icon: <Book size={18} />, view: 'questionBank' },
        { label: 'Generate Paper', icon: <FilePlus size={18} />, view: 'generatePaper' },
        { label: 'My Saved Papers', icon: <FileText size={18} />, view: 'savedPapers' },
        { label: 'Student Tests', icon: <UsersIcon size={18} />, view: 'studentResults' },
        { label: 'Profile', icon: <UserIconLucide size={18} />, view: 'profile' },
        { label: 'Logout', icon: <LogOut size={18} />, view: 'logout' },
    ];

    const renderContent = () => {
        switch (activeView) {
            case 'home':
                return (
                    <TeacherDashboardHome
                        setActiveView={handleSetActiveView}
                        onMonitorPaper={setMonitoringPaper}
                        onViewProctoringReport={(paper) => {
                            setProctoringReportPaper(paper);
                            handleSetActiveView('generatePaper');
                        }}
                    />
                );
            case 'questionBank':
                return <QuestionBank />;
            case 'generatePaper':
                if (proctoringReportPaper) {
                    return <ProctoringReport paper={proctoringReportPaper} onBack={() => setProctoringReportPaper(null)} />;
                }
                return viewingPaper ?
                    <PaperDetails paper={viewingPaper} onBack={() => setViewingPaper(null)} /> :
                    <GeneratePaper
                        onViewDetails={setViewingPaper}
                        onMonitorPaper={setMonitoringPaper}
                        onViewProctoringReport={setProctoringReportPaper}
                    />;
            case 'savedPapers':
                if (proctoringReportPaper) {
                    return <ProctoringReport paper={proctoringReportPaper} onBack={() => setProctoringReportPaper(null)} />;
                }
                return viewingPaper ?
                    <PaperDetails paper={viewingPaper} onBack={() => setViewingPaper(null)} /> :
                    <SavedPapers
                        onViewDetails={setViewingPaper}
                        onMonitorPaper={setMonitoringPaper}
                        onViewProctoringReport={setProctoringReportPaper}
                    />;

            case 'studentResults':
                return viewingResult ?
                    <ResultDetails test={viewingResult} onBack={() => setViewingResult(null)} /> :
                    <TeacherResults onViewDetails={setViewingResult} />;
            case 'profile':
                return <Profile />;
            default:
                return <TeacherDashboardHome setActiveView={handleSetActiveView} onMonitorPaper={setMonitoringPaper} />;
        }
    };

    return (
        <DashboardLayout
            user={user}
            onLogout={onLogout}
            navItems={navItems}
            activeView={activeView}
            setActiveView={handleSetActiveView}
        >
            <div className="bg-brand-card/70 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-6 animate-slide-in">
                {renderContent()}
            </div>
            {monitoringPaper && (
                <LiveMonitor
                    paper={monitoringPaper}
                    onClose={() => setMonitoringPaper(null)}
                />
            )}
        </DashboardLayout>
    );
};

export default TeacherDashboard;