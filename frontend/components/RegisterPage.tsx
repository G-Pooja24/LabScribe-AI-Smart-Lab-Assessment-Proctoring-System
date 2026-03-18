import React, { useState } from 'react';
import { Page, Role } from '../types';

interface RegisterPageProps {
    role: Role;
    onRegister: (name: string, email: string, password: string, role: Role) => Promise<{ success: boolean, error?: string }>;
    navigate: (page: Page) => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ role, onRegister, navigate }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !password || !confirmPassword) {
            setError('Please fill in all fields.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        setError('');
        const result = await onRegister(name, email, password, role);
        setLoading(false);

        if (!result.success) {
            setError(result.error || 'Registration failed. This email might already be in use.');
        }
    };

    const loginPage = role === Role.Teacher ? Page.TeacherLogin : Page.StudentLogin;

    return (
        <div className="flex items-center justify-center min-h-screen py-12 bg-transparent p-4">
            <div className={`w-full max-w-md p-8 space-y-8 bg-brand-card/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl`}>
                <div className="text-center">
                    <h2 className={`text-3xl font-bold text-brand-text font-display`}>
                        Create {role} Account
                    </h2>
                    <p className={`mt-2 text-brand-text/80`}>Join the future of education today.</p>
                </div>
                <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                    <input
                        name="name" type="text" required
                        className={`appearance-none rounded-md relative block w-full px-3 py-3 border border-brand-primary/30 placeholder-gray-500/80 bg-brand-bg/50 text-brand-text focus:outline-none focus:ring-brand-primary focus:border-transparent sm:text-sm`}
                        placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)}
                    />
                    <input
                        name="email" type="email" autoComplete="email" required
                        className={`appearance-none rounded-md relative block w-full px-3 py-3 border border-brand-primary/30 placeholder-gray-500/80 bg-brand-bg/50 text-brand-text focus:outline-none focus:ring-brand-primary focus:border-transparent sm:text-sm`}
                        placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        name="password" type="password" required
                        className={`appearance-none rounded-md relative block w-full px-3 py-3 border border-brand-primary/30 placeholder-gray-500/80 bg-brand-bg/50 text-brand-text focus:outline-none focus:ring-brand-primary focus:border-transparent sm:text-sm`}
                        placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
                    />
                    <input
                        name="confirm-password" type="password" required
                        className={`appearance-none rounded-md relative block w-full px-3 py-3 border border-brand-primary/30 placeholder-gray-500/80 bg-brand-bg/50 text-brand-text focus:outline-none focus:ring-brand-primary focus:border-transparent sm:text-sm`}
                        placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    />

                    {error && <p className="text-red-400 text-sm text-center pt-2">{error}</p>}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-all duration-300 shadow-lg shadow-brand-primary/30 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Creating Account...' : 'Sign up'}
                        </button>
                    </div>
                </form>
                <div className="text-sm text-center">
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate(loginPage); }} className={`font-medium text-brand-secondary hover:text-brand-primary`}>
                        Already have an account? Sign in
                    </a>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;