import React, { useContext, useState } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { Test } from '../../types';
import { SearchIcon } from '../common/Icons';

interface TeacherResultsProps {
    onViewDetails: (test: Test) => void;
}

const TeacherResults: React.FC<TeacherResultsProps> = ({ onViewDetails }) => {
    const { tests, papers, currentUser } = useContext(AppContext);
    const [searchTerm, setSearchTerm] = useState('');

    if (!currentUser) return null;

    const teacherPaperIds = new Set(papers.filter(p => p.teacherId === currentUser.id).map(p => p.id));
    const teacherVisibleTests = tests.filter(t => teacherPaperIds.has(t.paper.id) && t.status === 'COMPLETED');

    // Deduplicate: Keep only the latest submission for each student-paper combination
    const latestTestsMap = new Map<string, Test>();
    teacherVisibleTests.forEach(test => {
        const key = `${test.studentId}-${test.paper.id}`;
        const existing = latestTestsMap.get(key);
        if (!existing || new Date(test.submittedAt) > new Date(existing.submittedAt)) {
            latestTestsMap.set(key, test);
        }
    });
    const uniqueTests = Array.from(latestTestsMap.values());

    const filteredTests = uniqueTests.filter(test => {
        const searchLower = searchTerm.toLowerCase();
        const studentMatch = test.studentName.toLowerCase().includes(searchLower);
        const titleMatch = test.paper.title.toLowerCase().includes(searchLower);
        const dateMatch = test.submittedAt.toLocaleDateString().toLowerCase().includes(searchLower);
        return studentMatch || titleMatch || dateMatch;
    });

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h3 className="text-2xl font-bold text-brand-text font-display">Student Tests</h3>
                <div className="relative max-w-sm w-full">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-text/50">
                        <SearchIcon className="w-5 h-5" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by student, title or date..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-brand-primary/30 rounded-lg bg-brand-bg text-brand-text placeholder-brand-text/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all duration-300"
                    />
                </div>
            </div>

            {filteredTests.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-brand-primary/20">
                            <tr>
                                <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-brand-text">Student Name</th>
                                <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-brand-text">Test Title</th>
                                <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-brand-text">Date Taken</th>
                                <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-brand-text">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-brand-text/90">
                            {filteredTests.map(result => (
                                <tr key={result.id} className="border-b border-brand-primary/10 hover:bg-brand-primary/10">
                                    <td className="text-left py-3 px-4 font-semibold">{result.studentName}</td>
                                    <td className="text-left py-3 px-4">{result.paper.title}</td>
                                    <td className="text-left py-3 px-4">{result.submittedAt.toLocaleDateString()}</td>
                                    <td className="text-left py-3 px-4">
                                        <button onClick={() => onViewDetails(result)} className="text-brand-secondary hover:underline font-semibold">View Details</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="p-8 text-center bg-brand-primary/5 rounded-xl border border-brand-primary/10">
                    <p className="text-brand-text/80">{searchTerm ? "No results match your search." : "No students have completed any of your tests yet."}</p>
                </div>
            )}
        </div>
    );
};

export default TeacherResults;