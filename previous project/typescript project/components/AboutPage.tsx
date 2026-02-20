import React from 'react';
import { Page } from '../types';

interface AboutPageProps {
    navigate: (page: Page) => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ navigate }) => {
    return (
        <div className="flex flex-col min-h-screen bg-brand-bg text-brand-text font-sans p-6 items-center justify-center">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-brand-primary/10 rounded-full blur-3xl animate-pulse-slow"></div>
                <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-brand-secondary/10 rounded-full blur-3xl animate-pulse-slow [animation-delay:1s]"></div>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto w-full">
                <div className="bg-brand-card/80 backdrop-blur-xl border border-brand-primary/20 rounded-2xl shadow-2xl p-8 md:p-12 text-center animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-display font-bold mb-8">
                        About <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">LabScribe AI</span>
                    </h1>

                    <p className="text-lg text-brand-text/80 mb-6 leading-relaxed">
                        <strong className="text-brand-primary">LabScribe AI</strong> is a next-generation Laboratory Question Paper Management System designed to revolutionize technical assessments. By bridging the gap between theoretical knowledge and practical application, we empower institutions to conduct seamless, intelligent, and secure examinations.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 text-left">
                        <div className="p-4 rounded-xl bg-brand-bg/50 border border-brand-primary/10 hover:border-brand-primary/30 transition-colors">
                            <h3 className="font-bold text-brand-secondary mb-2 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                                AI-Driven Generation
                            </h3>
                            <p className="text-sm text-brand-text/60">Algorithmically balanced question papers tailored to curriculum standards using advanced LLMs.</p>
                        </div>
                        <div className="p-4 rounded-xl bg-brand-bg/50 border border-brand-primary/10 hover:border-brand-primary/30 transition-colors">
                            <h3 className="font-bold text-brand-secondary mb-2 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                                Integrated Code Lab
                            </h3>
                            <p className="text-sm text-brand-text/60">A full-featured IDE for real-time code compilation, execution, and test case validation.</p>
                        </div>
                        <div className="p-4 rounded-xl bg-brand-bg/50 border border-brand-primary/10 hover:border-brand-primary/30 transition-colors">
                            <h3 className="font-bold text-brand-secondary mb-2 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                Smart Proctoring
                            </h3>
                            <p className="text-sm text-brand-text/60">Secure exam environment with automated tab-switch detection and violation logging.</p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate(Page.Home)}
                        className="group relative inline-flex items-center gap-2 px-8 py-3 bg-brand-primary/10 text-brand-primary font-bold rounded-xl overflow-hidden transition-all duration-300 hover:bg-brand-primary hover:text-brand-bg hover:shadow-lg hover:shadow-brand-primary/25"
                    >
                        <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Home
                    </button>

                    <div className="mt-8 pt-6 border-t border-brand-text/5 text-brand-text/30 text-xs">
                        © 2025 LabScribe AI. All rights reserved. Built with React, TypeScript, and Java Spring Boot.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;
