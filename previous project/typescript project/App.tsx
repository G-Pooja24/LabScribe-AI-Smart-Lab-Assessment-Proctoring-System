import React, { useState, useCallback, useContext, useEffect } from 'react';
import { Page, Role } from './types';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import TeacherDashboard from './components/teacher/TeacherDashboard';
import StudentDashboard from './components/student/StudentDashboard';
import AboutPage from './components/AboutPage';
import { AppContext } from './contexts/AppContext';

const App: React.FC = () => {
    // Page state for navigating public pages
    const [page, setPage] = useState<Page>(Page.Home);
    const { currentUser, login, register, logout } = useContext(AppContext);

    const navigate = useCallback((page: Page) => {
        setPage(page);
    }, []);

    const handleLogin = async (email: string, password: string): Promise<boolean> => {
        const success = await login(email, password);
        if (success) {
            // No need to navigate, context change will trigger re-render to the correct dashboard
            return true;
        }
        return false;
    };

    const handleRegister = async (name: string, email: string, password: string, role: Role): Promise<{ success: boolean, error?: string }> => {
        try {
            // The register function in the context now also handles setting the current user (logging in)
            await register(name, email, password, role);
            return { success: true };
        } catch (error) {
            console.error(error);
            return { success: false, error: error instanceof Error ? error.message : "Registration failed." };
        }
    };

    // New handler for logout to also reset the page state to home
    const handleLogout = () => {
        logout(); // From context: sets currentUser to null
        setPage(Page.Home); // Resets the public page to Home
    };

    // Role-based protection: Redirect if user role doesn't match the current page
    useEffect(() => {
        if (!currentUser) return;

        const isTeacherPage = [Page.TeacherLogin, Page.TeacherRegister].includes(page);
        const isStudentPage = [Page.StudentLogin, Page.StudentRegister].includes(page);

        // Redirect away from login/register if already logged in
        if (currentUser.role === Role.Student && isStudentPage) {
            setPage(Page.Home); // Already on StudentDashboard (via renderPage), but keep state consistent
        } else if (currentUser.role === Role.Teacher && isTeacherPage) {
            setPage(Page.Home);
        }

        // If a user with a role tries to access a page forced by state that doesn't match
        // (Though renderPage handles the visual part, this keeps the state clean)
    }, [currentUser, page]);

    const renderPage = () => {
        // If logged in, show the appropriate dashboard immediately
        if (currentUser) {
            if (currentUser.role === Role.Teacher) {
                return <TeacherDashboard user={currentUser} onLogout={handleLogout} />;
            } else if (currentUser.role === Role.Student) {
                return <StudentDashboard user={currentUser} onLogout={handleLogout} />;
            }
        }

        // Public and Auth pages when not logged in
        switch (page) {
            case Page.About:
                return <AboutPage navigate={navigate} />;
            case Page.TeacherLogin:
                return <LoginPage role={Role.Teacher} onLogin={handleLogin} navigate={navigate} />;
            case Page.StudentLogin:
                return <LoginPage role={Role.Student} onLogin={handleLogin} navigate={navigate} />;
            case Page.TeacherRegister:
                return <RegisterPage role={Role.Teacher} onRegister={handleRegister} navigate={navigate} />;
            case Page.StudentRegister:
                return <RegisterPage role={Role.Student} onRegister={handleRegister} navigate={navigate} />;
            case Page.Home:
            default:
                return <HomePage navigate={navigate} />;
        }
    };

    return (
        <div className="min-h-screen text-brand-text font-sans">
            {renderPage()}
        </div>
    );
};

export default App;