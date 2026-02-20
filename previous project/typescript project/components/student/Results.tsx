import React, { useContext, useState } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { User, Test } from '../../types';
import { SearchIcon, ChartBarIcon } from '../common/Icons';
import { Calendar, CheckCircle2, ChevronRight } from 'lucide-react';

interface ResultsProps {
    onViewDetails: (test: Test) => void;
}

const Results: React.FC<ResultsProps> = ({ onViewDetails }) => {
    const { tests, currentUser } = useContext(AppContext);
    const [searchTerm, setSearchTerm] = useState('');

    if (!currentUser) return null;

    const studentResults = tests.filter(test => test.studentId === currentUser.id);

    // Deduplicate: Keep only the latest submission for each paper
    const latestTestsMap = new Map<string, Test>();
    studentResults.forEach(test => {
        const key = test.paper.id;
        const existing = latestTestsMap.get(key);
        if (!existing || new Date(test.submittedAt) > new Date(existing.submittedAt)) {
            latestTestsMap.set(key, test);
        }
    });
    const uniqueStudentResults = Array.from(latestTestsMap.values());

    const filteredResults = uniqueStudentResults.filter(result => {
        const searchLower = searchTerm.toLowerCase();
        const titleMatch = result.paper.title.toLowerCase().includes(searchLower);
        const dateMatch = new Date(result.submittedAt).toLocaleDateString().toLowerCase().includes(searchLower);
        return titleMatch || dateMatch;
    });

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h3 className="text-2xl font-bold text-brand-text font-display">My Tests</h3>
                <div className="relative max-w-sm w-full">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-text/50">
                        <SearchIcon className="w-5 h-5" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by title or date..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-brand-primary/30 rounded-lg bg-brand-bg text-brand-text placeholder-brand-text/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all duration-300"
                    />
                </div>
            </div>

            {filteredResults.length > 0 ? (
                <div className="space-y-4">
                    {filteredResults.map(result => (
                        <div
                            key={result.id}
                            className="group bg-brand-card/30 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 hover:bg-brand-card/50 hover:border-brand-primary/40 shadow-lg"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform">
                                    <ChartBarIcon className="w-6 h-6" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-lg font-bold text-brand-text group-hover:text-brand-primary transition-colors">{result.paper.title}</h4>
                                    <div className="flex items-center gap-3 text-xs text-brand-text/50">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {new Date(result.submittedAt).toLocaleDateString()}
                                        </span>
                                        <span className="w-1 h-1 rounded-full bg-white/10" />
                                        <span className="flex items-center gap-1 font-medium text-emerald-400">
                                            <CheckCircle2 size={14} />
                                            Completed
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => onViewDetails(result)}
                                className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-brand-text/80 text-sm font-bold hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all flex items-center justify-center gap-2 group/btn"
                            >
                                View Detailed Report
                                <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-8 text-center bg-brand-primary/5 rounded-xl border border-brand-primary/10">
                    <p className="text-brand-text/80">{searchTerm ? "No results match your search." : "You have not completed any tests yet."}</p>
                </div>
            )}
        </div>
    );
};

export default Results;