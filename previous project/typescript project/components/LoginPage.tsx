import React, { useState } from 'react';
import { Page, Role } from '../types';

interface LoginPageProps {
    role: Role;
    onLogin: (email: string, password: string) => Promise<boolean>;
    navigate: (page: Page) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ role, onLogin, navigate }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Please fill in all fields.');
            return;
        }

        setLoading(true);
        setError('');
        const success = await onLogin(email, password);
        setLoading(false);

        if (!success) {
            setError('Invalid email or password. Please try again.');
        }
    };

    const registrationPage = role === Role.Teacher ? Page.TeacherRegister : Page.StudentRegister;
    const homePage = Page.Home;

    return (
        <div className="flex items-center justify-center min-h-screen bg-transparent p-4">
            <div className={`w-full max-w-md p-8 space-y-8 bg-brand-card/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl`}>
                <div className="text-center">
                    <h2 className={`text-3xl font-bold text-brand-text font-display`}>
                        {role === Role.Teacher ? 'Faculty Station' : 'Student Station'}
                    </h2>
                    <p className={`mt-2 text-brand-text/80`}>Welcome back! Please enter your details.</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <input
                                id="email-address" name="email" type="email" autoComplete="email" required
                                className={`appearance-none rounded-lg relative block w-full px-4 py-3 border border-brand-primary/30 placeholder-gray-500/80 bg-brand-bg/50 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent focus:z-10 sm:text-sm transition-all`}
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <input
                                id="password" name="password" type="password" autoComplete="current-password" required
                                className={`appearance-none rounded-lg relative block w-full px-4 py-3 border border-brand-primary/30 placeholder-gray-500/80 bg-brand-bg/50 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent focus:z-10 sm:text-sm transition-all`}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>
                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-all duration-300 shadow-lg shadow-brand-primary/30 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>
                </form>
                <div className="text-sm text-center">
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate(registrationPage); }} className={`font-medium text-brand-secondary hover:text-brand-primary`}>
                        Don't have an account? Sign up
                    </a>
                </div>
                <div className="text-sm text-center">
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate(homePage); }} className={`font-medium text-brand-text/80 hover:text-white`}>
                        &larr; Back to Home
                    </a>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;