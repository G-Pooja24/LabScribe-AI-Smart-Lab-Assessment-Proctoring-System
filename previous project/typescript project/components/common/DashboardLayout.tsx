import React from 'react';
import { Role, User } from '../../types';

interface NavItem {
    label: string;
    icon: React.ReactNode;
    view: string;
}

interface DashboardLayoutProps {
    user: User;
    onLogout: () => void;
    navItems: NavItem[];
    activeView: string;
    setActiveView: (view: string) => void;
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ user, onLogout, navItems, activeView, setActiveView, children }) => {
    return (
        <div className={`flex h-screen font-sans`}>
            {/* Sidebar */}
            <aside className={`w-64 bg-brand-card/70 backdrop-blur-2xl flex flex-col border-white/10`}>
                <div className={`h-20 flex items-center justify-center border-b border-white/10 px-2`}>
                    <h1 className={`text-xl font-display font-bold text-brand-text text-center`}>{user.role === Role.Teacher ? 'Faculty Station' : 'Student Station'}</h1>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2">
                    {navItems.map((item) => (
                        <a
                            key={item.label}
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                if (item.view === 'logout') {
                                    onLogout();
                                } else {
                                    setActiveView(item.view);
                                }
                            }}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-brand-text/80 ${activeView === item.view
                                ? 'bg-brand-primary/80 text-white shadow-lg shadow-brand-primary/20'
                                : 'hover:bg-brand-primary/20'
                                }`}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </a>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className={`h-20 bg-brand-card/70 backdrop-blur-xl flex items-center justify-between px-8 border-b border-white/10`}>
                    <h2 className={`text-2xl font-semibold text-brand-text capitalize font-display`}>
                        {activeView.replace(/([A-Z])/g, ' $1').trim()}
                    </h2>
                    <div className="flex items-center space-x-4">
                        <span className={`text-brand-text/80`}>Welcome, {user.name}!</span>
                        <div className={`rounded-full ring-brand-secondary animate-pulse-glow`}>
                            <img
                                className="w-10 h-10 rounded-full object-cover"
                                src={
                                    !user.profilePicture
                                        ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`
                                        : (user.profilePicture.startsWith('http') || user.profilePicture.startsWith('data:'))
                                            ? user.profilePicture
                                            : `http://localhost:8087/uploads/${user.profilePicture}`
                                }
                                alt="Profile"
                            />
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;