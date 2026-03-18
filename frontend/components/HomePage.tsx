import React from 'react';
import { Page } from '../types';

interface HomePageProps {
    navigate: (page: Page) => void;
}

const HomePage: React.FC<HomePageProps> = ({ navigate }) => {
    return (
        <div className="flex flex-col min-h-screen bg-brand-bg text-brand-text font-sans selection:bg-brand-primary selection:text-brand-bg">
            <header className="fixed top-0 left-0 right-0 p-6 flex justify-between items-center z-50 bg-brand-bg/80 backdrop-blur-md border-b border-brand-primary/10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center">
                        <svg className="w-5 h-5 text-brand-bg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-display font-bold tracking-tight">LabScribe AI</h1>
                </div>
                <nav className="flex gap-6 items-center">
                    <button onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })} className="text-sm font-medium text-brand-text/70 hover:text-brand-primary transition-colors">About</button>
                    <button onClick={() => navigate(Page.TeacherLogin)} className="px-4 py-2 rounded-lg bg-brand-primary/10 text-brand-primary font-medium hover:bg-brand-primary/20 transition-all text-sm border border-brand-primary/20">Faculty Portal</button>
                </nav>
            </header>

            <main className="flex-grow pt-32 pb-20 px-6 max-w-7xl mx-auto w-full flex flex-col gap-24">
                {/* Hero Section */}
                <section className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
                    <div className="flex-1 space-y-8 animate-fade-in text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-secondary/10 border border-brand-secondary/20 text-brand-secondary text-xs font-semibold tracking-wider uppercase">
                            <span className="w-2 h-2 rounded-full bg-brand-secondary animate-pulse"></span>
                            Next-Gen Lab Management
                        </div>
                        <h2 className="text-5xl md:text-7xl font-display font-bold leading-tight">
                            Elevate Laboratory <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">Excellence with AI</span>
                        </h2>
                        <p className="text-lg text-brand-text/60 max-w-xl leading-relaxed">
                            The intelligent platform for automated question generation, seamless code execution, and insightful assessment. Experience the future of practical exams today.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <button
                                onClick={() => navigate(Page.StudentLogin)}
                                className="group relative px-8 py-4 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-xl text-brand-bg font-bold shadow-lg shadow-brand-primary/25 hover:shadow-brand-primary/40 transition-all hover:-translate-y-1 overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    Student Portal
                                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </span>
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            </button>
                            <button
                                onClick={() => navigate(Page.TeacherLogin)}
                                className="px-8 py-4 rounded-xl border border-brand-primary/30 bg-brand-card/30 backdrop-blur-sm text-brand-text font-semibold hover:bg-brand-card/50 transition-all hover:-translate-y-1"
                            >
                                Faculty Portal
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 relative animate-feed-in [animation-delay:200ms]">
                        <div className="relative z-10 w-full aspect-square max-w-lg mx-auto bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-2xl p-1 backdrop-blur-3xl animate-pulse-slow">
                            <img
                                src="https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=2070&auto=format&fit=crop"
                                alt="Advanced Coding Environment"
                                className="w-full h-full object-cover rounded-xl shadow-2xl border border-brand-primary/20"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://placehold.co/600x600/0f172a/00B4D8?text=Tech+Lab';
                                }}
                            />
                        </div>
                        {/* Decorative elements */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-secondary/30 rounded-full blur-3xl animate-pulse-glow"></div>
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-brand-primary/30 rounded-full blur-3xl animate-pulse-glow [animation-message:1s]"></div>
                    </div>
                </section>

                {/* Features Section Removed and Merged into About Section below */}

                {/* About Section */}
                <section id="about" className="relative py-12">
                    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
                        <div className="absolute top-[20%] -left-[10%] w-[50%] h-[50%] bg-brand-primary/5 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-[20%] -right-[10%] w-[40%] h-[40%] bg-brand-secondary/5 rounded-full blur-3xl"></div>
                    </div>

                    <div className="bg-brand-card/50 backdrop-blur-xl border border-brand-primary/20 rounded-2xl p-8 md:p-12 text-center">
                        <h2 className="text-4xl md:text-5xl font-display font-bold mb-8">
                            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">LabScribe AI</span>
                        </h2>

                        <p className="text-lg text-brand-text/80 mb-6 leading-relaxed max-w-3xl mx-auto">
                            <strong className="text-brand-primary">LabScribe AI</strong> is a next-generation Laboratory Question Paper Management System designed to revolutionize technical assessments. By bridging the gap between theoretical knowledge and practical application, we empower institutions to conduct seamless, intelligent, and secure examinations.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                            {[
                                {
                                    title: "AI-Powered Generation",
                                    desc: "Instantly generate balanced question papers using advanced LLMs.",
                                    icon: (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    )
                                },
                                {
                                    title: "Live Code Lab",
                                    desc: "Integrated IDE with real-time compilation and test cases.",
                                    icon: (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                    )
                                },
                                {
                                    title: "Smart Proctoring",
                                    desc: "Secure environment with automated violation detection.",
                                    icon: (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    )
                                }
                            ].map((feature, idx) => (
                                <div key={idx} className="group p-8 rounded-2xl bg-brand-bg/60 border border-brand-primary/10 hover:border-brand-primary/40 transition-all hover:bg-brand-bg/80 hover:-translate-y-2 shadow-lg backdrop-blur-sm">
                                    <div className="w-12 h-12 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            {feature.icon}
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold mb-3 text-brand-text/90">{feature.title}</h3>
                                    <p className="text-brand-text/60 leading-relaxed text-sm">
                                        {feature.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <footer className="py-8 border-t border-brand-primary/10 bg-brand-bg/50 backdrop-blur-sm text-center">
                <p className="text-brand-text/40 text-sm">
                    &copy; 2025 LabScribe AI. All rights reserved.
                </p>
            </footer>
        </div>
    );
};

export default HomePage;