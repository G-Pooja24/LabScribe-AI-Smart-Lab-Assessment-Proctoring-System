import React, { useState } from 'react';
import { Role, User, Test, Paper } from '../../types';
import DashboardLayout from '../common/DashboardLayout';
import { HomeIcon, PencilAltIcon, ChartBarIcon, ChatIcon, LogoutIcon, MicrophoneIcon, UserIcon, CogIcon } from '../common/Icons';
import StudentDashboardHome from './StudentDashboardHome';
import TakeTest from './TakeTest';
import Results from './Results';
import Profile from '../common/Profile';
import ResultDetails from '../common/ResultDetails';

interface StudentDashboardProps {
    user: User;
    onLogout: () => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, onLogout }) => {
    const [activeView, setActiveView] = useState('home');
    const [viewingResult, setViewingResult] = useState<Test | null>(null);
    const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
    const [fullOriginalPaper, setFullOriginalPaper] = useState<Paper | null>(null);
    const [testSubmitted, setTestSubmitted] = useState(false);

    const navItems = [
        { label: 'Dashboard', icon: <HomeIcon />, view: 'home' },
        { label: 'Take Test', icon: <PencilAltIcon />, view: 'takeTest' },
        { label: 'My Tests', icon: <ChartBarIcon />, view: 'myResults' },
        { label: 'Profile', icon: <UserIcon />, view: 'profile' },
        { label: 'Logout', icon: <LogoutIcon />, view: 'logout' },
    ];

    const handleViewDetails = (test: Test) => {
        setViewingResult(test);
        setActiveView('myResults');
    };

    const renderContent = () => {
        let content;
        switch (activeView) {
            case 'home':
                return <StudentDashboardHome setActiveView={setActiveView} onViewDetails={handleViewDetails} />;
            case 'takeTest':
                content = <TakeTest
                    onViewDetails={handleViewDetails}
                    selectedPaper={selectedPaper}
                    setSelectedPaper={setSelectedPaper}
                    fullOriginalPaper={fullOriginalPaper}
                    setFullOriginalPaper={setFullOriginalPaper}
                    testSubmitted={testSubmitted}
                    setTestSubmitted={setTestSubmitted}
                />;
                break;
            case 'myResults':
                content = viewingResult ?
                    <ResultDetails test={viewingResult} onBack={() => setViewingResult(null)} /> :
                    <Results onViewDetails={setViewingResult} />;
                break;
            case 'profile':
                content = <Profile />;
                break;
            default:
                return <StudentDashboardHome setActiveView={setActiveView} onViewDetails={handleViewDetails} />;
        }
        return content;
    };

    const content = renderContent();

    if (activeView === 'takeTest' && selectedPaper) {
        return content;
    }

    return (
        <DashboardLayout
            user={user}
            onLogout={onLogout}
            navItems={navItems}
            activeView={activeView}
            setActiveView={setActiveView}
        >
            <div className="bg-brand-card/70 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-6 animate-slide-in">
                {content}
            </div>
        </DashboardLayout>
    );
};

export default StudentDashboard;