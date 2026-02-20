import React, { useState, useContext, useEffect } from 'react';
import { generateQuestions } from '../../services/geminiService';
import { Question, Difficulty, QuestionType, Paper, CodeLanguage } from '../../types';
import { LoadingSpinner, JavaIcon, PythonIcon } from '../common/Icons';
import { AppContext } from '../../contexts/AppContext';

interface GeneratePaperProps {
    onViewDetails: (paper: Paper) => void;
    onMonitorPaper: (paper: Paper) => void;
    onViewProctoringReport: (paper: Paper) => void;
}


const GeneratePaper: React.FC<GeneratePaperProps> = ({ onViewDetails, onMonitorPaper, onViewProctoringReport }) => {

    const { addPaper, papers, currentUser } = useContext(AppContext);
    const [topics, setTopics] = useState('');
    const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.Medium);
    const [count, setCount] = useState(5);
    const [questionType, setQuestionType] = useState<QuestionType>(QuestionType.MCQ);
    const [generatedQuestions, setGeneratedQuestions] = useState<Omit<Question, 'id'>[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState<CodeLanguage>(CodeLanguage.Java);
    const [examTitle, setExamTitle] = useState('');
    const [warningLimit, setWarningLimit] = useState(3);
    const [startTime, setStartTime] = useState(new Date().toISOString().slice(0, 16));
    const [endTime, setEndTime] = useState(new Date(Date.now() + 3600000).toISOString().slice(0, 16)); // 1 hour later

    const generateAccessCode = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid ambiguous chars
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    const [isFallbackUsed, setIsFallbackUsed] = useState(false);

    // Load state from localStorage on mount
    useEffect(() => {
        const savedState = localStorage.getItem('generatePaperState');
        if (savedState) {
            const parsed = JSON.parse(savedState);
            setTopics(parsed.topics || '');
            setDifficulty(parsed.difficulty || Difficulty.Medium);
            setCount(parsed.count || 5);
            setQuestionType(parsed.questionType || QuestionType.MCQ);
            setGeneratedQuestions(parsed.generatedQuestions || []);
            setExamTitle(parsed.examTitle || '');
            setSelectedLanguage((parsed.selectedLanguage as CodeLanguage) || CodeLanguage.Java);
            setWarningLimit(parsed.warningLimit || 3);
            setStartTime(parsed.startTime || new Date().toISOString().slice(0, 16));
            setEndTime(parsed.endTime || new Date(Date.now() + 3600000).toISOString().slice(0, 16));
        }
    }, []);

    // Save state to localStorage on change
    useEffect(() => {
        const state = {
            topics,
            difficulty,
            count,
            questionType,
            generatedQuestions,
            examTitle,
            selectedLanguage,
            warningLimit,
            startTime,
            endTime
        };
        localStorage.setItem('generatePaperState', JSON.stringify(state));
    }, [topics, difficulty, count, questionType, generatedQuestions, examTitle, selectedLanguage, warningLimit, startTime, endTime]);

    const handleGenerate = async () => {
        if (!topics.trim()) {
            setError('Please enter at least one topic.');
            return;
        }
        setError('');
        setIsLoading(true);
        setGeneratedQuestions([]);
        setIsFallbackUsed(false);
        try {
            const topicArray = topics.split(',').map(t => t.trim());
            const result = await generateQuestions(count, topicArray, difficulty, questionType);

            // Add the language to each coding question
            const questionsWithLanguage = result.questions.map(q => ({
                ...q,
                language: q.type === QuestionType.Coding ? selectedLanguage : undefined
            }));

            console.log("Setting generated questions:", questionsWithLanguage);
            setGeneratedQuestions(questionsWithLanguage);
            setIsFallbackUsed(result.isFallback);
        } catch (err: any) {
            console.error("Error in handleGenerate:", err);
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const [isSaving, setIsSaving] = useState(false);

    const handleSavePaper = async () => {
        if (generatedQuestions.length > 0 && currentUser) {
            setIsSaving(true);
            const accessCode = generateAccessCode();
            const paperQuestions = generatedQuestions.map((q, i) => ({ ...q, id: `q-${Date.now()}-${i}` }));
            const newPaper: Paper = {
                id: Date.now().toString(),
                title: examTitle || `Paper on ${topics}`,
                examTitle: examTitle || `Paper on ${topics}`,
                topic: topics,
                difficulty,
                questions: paperQuestions,
                teacherId: currentUser.id,
                accessCode,
                warningLimit,
                startTime,
                endTime
            };
            try {
                const success = await addPaper(newPaper);
                if (success) {
                    alert(`Paper saved successfully!\n\nAccess Code: ${accessCode}\n\nShare this code with your students.`);
                    setGeneratedQuestions([]);
                    setTopics('');
                    setExamTitle('');
                    localStorage.removeItem('generatePaperState');
                } else {
                    alert('Failed to save paper to backend. Please check the server logs.');
                }
            } catch (err) {
                alert('An unexpected error occurred while saving the paper.');
            } finally {
                setIsSaving(false);
            }
        }
    };



    const handleDownloadPaper = () => {
        if (generatedQuestions.length === 0) return;

        const paperTitle = `Question Paper - ${topics || 'Untitled'}`;
        let fileContent = `${paperTitle}\n`;
        fileContent += `Difficulty: ${difficulty}\n`;
        fileContent += `Type: ${questionType}\n`;
        fileContent += "====================================\n\n";

        generatedQuestions.forEach((q, index) => {
            fileContent += `Q${index + 1}: ${q.text}\n`;
            if (q.type === QuestionType.MCQ && q.options) {
                q.options.forEach((opt, i) => {
                    fileContent += `  ${String.fromCharCode(97 + i)}) ${opt}\n`;
                });
                fileContent += `Correct Answer: ${String.fromCharCode(97 + (q.correctAnswerIndex ?? 0))}\n\n`;
            } else {
                if (q.answerKey) fileContent += `Answer Key / Logic:\n${q.answerKey}\n\n`;
            }
        });


        const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${paperTitle.replace(/[\s,]+/g, '_')}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const inputClasses = "mt-1 block w-full max-w-[85%] border border-brand-primary/30 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-primary bg-brand-card text-brand-text";

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-2xl font-bold mb-6 text-brand-text font-display">AI Paper Generator</h3>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-brand-text/80">Exam Title (Visible to Students)</label>
                    <input
                        type="text"
                        value={examTitle}
                        onChange={(e) => setExamTitle(e.target.value)}
                        placeholder="e.g., Python Basics Lab Test / UNIT-IV Assessment"
                        className={inputClasses}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                    <div>
                        <label className="block text-sm font-medium text-brand-text/80">Topics (comma-separated)</label>
                        <input
                            type="text"
                            value={topics}
                            onChange={(e) => setTopics(e.target.value)}
                            placeholder="e.g., Photosynthesis, Cell Division"
                            className={inputClasses}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-brand-text/80">Question Type</label>
                        <div className="mt-2 flex gap-x-4 rounded-lg p-1 bg-brand-bg/50 max-w-[85%]">
                            {(Object.values(QuestionType)).map((type) => (
                                <button key={type} onClick={() => setQuestionType(type)} className={`w-full rounded-md py-1.5 text-sm font-medium transition-colors ${questionType === type ? 'bg-brand-primary text-brand-bg shadow-sm' : 'text-brand-text/80 hover:bg-brand-primary/20'}`}>
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-brand-text/80">Difficulty</label>
                        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)} className={inputClasses}>
                            {Object.values(Difficulty).map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-brand-text/80">Number of Questions</label>
                        <input type="number" value={count} onChange={(e) => setCount(Math.max(1, parseInt(e.target.value, 10)))} min="1" max="20" className={inputClasses} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-brand-text/80">Violation Warning Limit</label>
                        <input type="number" value={warningLimit} onChange={(e) => setWarningLimit(Math.max(1, parseInt(e.target.value, 10)))} min="1" max="10" className={inputClasses} />
                        <p className="mt-1 text-xs text-brand-text/50 italic">Exam auto-submits after this many violations.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-brand-text/80">Start Date & Time</label>
                        <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputClasses} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-brand-text/80">End Date & Time</label>
                        <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={inputClasses} />
                    </div>
                </div>

                {questionType === QuestionType.Coding && (
                    <div className="mt-6 animate-fade-in max-w-2xl mx-auto">
                        <label className="block text-xs font-semibold text-brand-text/70 uppercase tracking-widest mb-3 text-center">Target Programming Language</label>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { lang: CodeLanguage.Java, icon: <JavaIcon className="w-6 h-6" />, desc: 'Standard for Enterprise' },
                                { lang: CodeLanguage.Python, icon: <PythonIcon className="w-6 h-6" />, desc: 'Powerhouse for Data & AI' }
                            ].map(({ lang, icon, desc }) => (
                                <button
                                    key={lang}
                                    onClick={() => setSelectedLanguage(lang)}
                                    className={`relative flex flex-col items-center p-4 rounded-xl transition-all duration-500 group border-2 ${selectedLanguage === lang
                                        ? 'bg-brand-primary/10 border-brand-primary shadow-[0_0_15px_rgba(34,211,238,0.15)]'
                                        : 'bg-brand-bg/30 border-white/5 hover:border-white/20'
                                        }`}
                                >
                                    <div className={`p-3 rounded-lg mb-3 transition-all duration-500 ${selectedLanguage === lang
                                        ? 'bg-brand-primary text-brand-bg rotate-[360deg]'
                                        : 'bg-white/5 text-brand-text/40 group-hover:text-brand-primary'
                                        }`}>
                                        {icon}
                                    </div>
                                    <h4 className={`text-base font-bold tracking-tight mb-1 transition-colors ${selectedLanguage === lang ? 'text-brand-primary' : 'text-brand-text/60'
                                        }`}>
                                        {lang.toUpperCase()}
                                    </h4>
                                    <p className="text-[9px] text-brand-text/40 uppercase tracking-tighter text-center">
                                        {desc}
                                    </p>

                                    {selectedLanguage === lang && (
                                        <div className="absolute top-2 right-2">
                                            <div className="w-4 h-4 bg-brand-primary rounded-full flex items-center justify-center animate-scale-in">
                                                <svg className="w-2.5 h-2.5 text-brand-bg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="5" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                        <div className="mt-4 flex items-center justify-center space-x-2 text-brand-text/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary/50 animate-pulse"></span>
                            <span className="text-xs italic">IDE environment will be pre-configured for {selectedLanguage.toUpperCase()}</span>
                        </div>
                    </div>
                )}

                {error && <p className="text-red-400 text-sm mt-4">{error}</p>}

                {isFallbackUsed && (
                    <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg animate-pulse">
                        <p className="text-amber-500 text-sm font-medium flex items-center">
                            <span className="mr-2">⚠️</span> AI Quota reached. Using high-quality questions from the local repository for this paper.
                        </p>
                    </div>
                )}

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="relative group bg-brand-primary text-brand-text font-bold py-2 px-6 rounded-lg overflow-hidden transition-all duration-300 flex items-center disabled:bg-gray-500 shadow-lg shadow-brand-primary/30"
                    >
                        {isLoading && <LoadingSpinner />}
                        <span className={`relative z-10 ${isLoading ? 'ml-2' : ''}`}>Generate Paper</span>
                        <span className="absolute inset-0 bg-brand-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                    </button>
                </div>
            </div>

            {generatedQuestions.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-2xl font-bold mb-6 text-brand-text font-display">Generated Questions</h3>
                    <div className="space-y-6">
                        {generatedQuestions.map((q, index) => (
                            <div key={index} className="border-b border-brand-primary/20 pb-4 last:border-b-0">
                                <p className="font-semibold text-brand-text">{`${index + 1}. ${q.text}`}</p>
                                {q.type === QuestionType.MCQ ? (
                                    <ul className="list-disc list-inside mt-2 space-y-1 pl-4">
                                        {q.options?.map((opt, i) => (
                                            <li key={i} className={i === q.correctAnswerIndex ? 'text-green-400 font-medium' : 'text-brand-text/80'}>
                                                {opt} {i === q.correctAnswerIndex && '(Correct)'}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="mt-4 space-y-4">
                                        {q.title && <p className="text-lg font-bold text-brand-secondary">{q.title}</p>}
                                        {q.description && <p className="text-sm text-brand-text/70 italic">{q.description}</p>}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {q.inputFormat && (
                                                <div className="p-3 bg-brand-bg/50 rounded-lg border border-brand-primary/10">
                                                    <p className="text-xs font-bold text-brand-primary uppercase tracking-wider mb-1">Input Format</p>
                                                    <p className="text-sm text-brand-text/80">{q.inputFormat}</p>
                                                </div>
                                            )}
                                            {q.outputFormat && (
                                                <div className="p-3 bg-brand-bg/50 rounded-lg border border-brand-primary/10">
                                                    <p className="text-xs font-bold text-brand-primary uppercase tracking-wider mb-1">Output Format</p>
                                                    <p className="text-sm text-brand-text/80">{q.outputFormat}</p>
                                                </div>
                                            )}
                                        </div>

                                        {q.constraints && (
                                            <div className="p-3 bg-brand-bg/50 rounded-lg border border-brand-primary/10">
                                                <p className="text-xs font-bold text-brand-primary uppercase tracking-wider mb-1">Constraints</p>
                                                <p className="text-sm text-brand-text/80">{q.constraints}</p>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {q.sampleInput && (
                                                <div className="p-3 bg-black/20 rounded-lg font-mono">
                                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Sample Input</p>
                                                    <pre className="text-xs text-brand-text/80">{q.sampleInput}</pre>
                                                </div>
                                            )}
                                            {q.sampleOutput && (
                                                <div className="p-3 bg-black/20 rounded-lg font-mono">
                                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Sample Output</p>
                                                    <pre className="text-xs text-brand-text/80">{q.sampleOutput}</pre>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-3 bg-brand-bg/50 rounded-md border border-brand-primary/20">
                                            <p className="text-sm font-semibold text-brand-secondary">Answer Key / Logic:</p>
                                            <p className="text-sm text-brand-text/80 mt-1 whitespace-pre-wrap">{q.answerKey}</p>
                                        </div>
                                    </div>
                                )}

                            </div>
                        ))}
                    </div>
                    <div className="mt-8 flex flex-wrap gap-4 justify-end">
                        <button onClick={handleDownloadPaper} className="bg-brand-primary/20 text-brand-text font-bold py-2 px-6 rounded-lg hover:bg-brand-primary/40 transition duration-300">
                            Download Paper
                        </button>
                        <button
                            onClick={handleSavePaper}
                            disabled={isSaving}
                            className={`bg-green-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-600 transition-all duration-300 shadow-lg hover:shadow-green-500/40 flex items-center ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isSaving && <div className="mr-2"><LoadingSpinner /></div>}
                            {isSaving ? 'Saving...' : 'Save Paper'}
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default GeneratePaper;