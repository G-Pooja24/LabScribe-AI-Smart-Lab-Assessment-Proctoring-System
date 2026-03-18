import React, { useState, useEffect, useContext, useRef } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { Paper, QuestionType, Test, Difficulty } from '../../types';
import CodeEditor from './CodeEditor';
import Terminal from '../Terminal';
import Stomp from 'stompjs';
import { getAssignedQuestions, seededRandom } from '../../utils/questionUtils';
import { Play, Square, Trash2, CheckCircle2, ChevronRight, ChevronLeft, Layout, Terminal as TerminalIcon, AlertCircle, ShieldCheck, Sun, Moon, Maximize2, BookOpen, Clock, Monitor, Lock, Check } from 'lucide-react';

// Safe way to access environment variables defined in vite.config.ts
const getApiKey = () => {
    try {
        // Vite replaces these literals at build time
        return process.env.API_KEY || process.env.GEMINI_API_KEY || '';
    } catch (e) {
        return '';
    }
};

// --- Child Components --- //

interface TestRunnerProps {
    paper: Paper;
    originalPaper: Paper;
    onTestComplete: () => void;
}

const getQuestionLanguage = (q: any, paperTitle: string): string => {
    if (q.language) return q.language.toLowerCase();
    const fullContent = (q.text + ' ' + paperTitle).toLowerCase();
    if (fullContent.includes('python')) return 'python';
    return 'java';
};

const getInitialCode = (lang: string | undefined) => {
    const normalized = lang?.toLowerCase();
    switch (normalized) {
        case 'python': return "class Student:\n    def __init__(self, name, marks1, marks2):\n        self.name = name\n        self.m1 = marks1\n        self.m2 = marks2\n\n    def show_result(self):\n        total = self.m1 + self.m2\n        print(f\"{self.name}'s Total: {total}\")\n\nname = input(\"Enter Name: \")\nm1 = int(input(\"Enter Mark 1: \"))\nm2 = int(input(\"Enter Mark 2: \"))\n\ns = Student(name, m1, m2)\ns.show_result()";
        case 'java':
        default: return "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        System.out.println(\"enter 1st num\");\n        int a = sc.nextInt();\n        System.out.println(\"enter 2nd num\");\n        int b = sc.nextInt();\n        int sum = a + b;\n        System.out.println(\"sum is \" + sum);\n    }\n}";

    }
};

const TestRunner: React.FC<TestRunnerProps> = ({ paper, originalPaper, onTestComplete }) => {
    const { addTest, currentUser, tests } = useContext(AppContext);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<(number | null | string)[]>(() => {
        if (paper.questions.length === 0) {
            return [];
        }
        return paper.questions.map(q => {
            if (q.type === QuestionType.Coding) {
                const lang = q.language || (paper.title.toLowerCase().includes('python') ? 'python' : 'java');
                return getInitialCode(lang);
            }
            return null;
        });
    });

    const hasCodingQuestions = paper.questions.some(q => q.type === QuestionType.Coding);
    const [timeLeft, setTimeLeft] = useState(hasCodingQuestions ? 1800 : paper.questions.length * 60);
    // Theme State
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    // Resizer State
    const [leftWidth, setLeftWidth] = useState(40); // 40% initial
    const [consoleHeight, setConsoleHeight] = useState(30); // 30% initial
    const [isDragging, setIsDragging] = useState(false);
    const [isVerticalDragging, setIsVerticalDragging] = useState(false);

    // Terminal & Execution state
    const [isRunning, setIsRunning] = useState(false);
    const [terminalKey, setTerminalKey] = useState(0);
    const terminalStompClient = useRef<Stomp.Client | null>(null);
    const studentId = currentUser?.id || 'anonymous';

    // Proctoring State
    const [warningCount, setWarningCount] = useState(0);
    const lastViolationType = useRef<string | null>(null);
    const lastViolationTime = useRef<number>(0); // Global debounce timestamp
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [gradingStatus, setGradingStatus] = useState<string>('');
    const [isViolationVisualActive, setIsViolationVisualActive] = useState(false);
    const [isShowLockout, setIsShowLockout] = useState(false);
    const [transientWarning, setTransientWarning] = useState<string | null>(null);

    // FIX: State initialization flag to prevent overwriting local state on context updates
    const [isInitialized, setIsInitialized] = useState(false);

    // Refs for safe access during submission/async events
    const answersRef = useRef<(number | null | string)[]>(answers);
    const isSubmittingRef = useRef(false);
    const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Update answersRef whenever answers change
    useEffect(() => {
        answersRef.current = answers;
    }, [answers]);

    // Resume Logic - UPDATED: Only run ONCE
    useEffect(() => {
        if (!currentUser || isInitialized) return;

        // Check if there's an existing test for this paper and student
        const existingTest = tests.find(t => t.studentId === currentUser.id && t.paper.id === originalPaper.id);

        if (existingTest) {
            if (existingTest.status === 'COMPLETED') {
                // If somehow they got here but it's completed (TestRunner shouldn't mount if checked earlier but double check)
                // Actually parent handles this, but good safety.
            } else if (existingTest.status === 'IN_PROGRESS') {
                // Resume
                // Construct a map of QuestionID -> Answer from existingTest
                const answerMap = new Map<string, string | number | null>();
                originalPaper.questions.forEach((q, idx) => {
                    if (existingTest.answers[idx] !== undefined) {
                        answerMap.set(q.id, existingTest.answers[idx]);
                    }
                });

                const resumedAnswers = paper.questions.map(q => {
                    const val = answerMap.get(q.id);
                    if (val !== undefined && val !== null && val !== -1) return val;

                    // Fallback to template if no answer or -1
                    if (q.type === QuestionType.Coding) {
                        const lang = q.language || (paper.title.toLowerCase().includes('python') ? 'python' : 'java');
                        return getInitialCode(lang);
                    }
                    return null;
                });
                setAnswers(resumedAnswers);
            }
        }
        setIsInitialized(true); // Mark as initialized so subsequent context updates don't overwrite
    }, [currentUser, originalPaper.id, tests, paper, isInitialized]);


    // Violation Logging helper
    // Violation Logging helper
    const logViolation = async (type: string, details: string) => {
        // Prevent violations during submission or if already submitting
        const now = Date.now();
        // Global debounce: Ignore all violations within 3 seconds of the last one
        if (isSubmittingRef.current || isSubmitting || lastViolationType.current === type || (now - lastViolationTime.current < 3000)) return;

        lastViolationType.current = type;
        lastViolationTime.current = now;
        setTimeout(() => { lastViolationType.current = null; }, 2000);

        setWarningCount(prev => {
            const next = prev + 1;
            const limit = paper.warningLimit || 10;

            if (next >= limit) {
                // Strict Auto-Submit
                handleSubmit(true, 'COMPLETED'); // Force complete
            }
            return next;
        });

        // Trigger Visual Warning
        setTransientWarning(details);
        setIsViolationVisualActive(true);

        // Auto-hide after 5 seconds
        if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
        warningTimeoutRef.current = setTimeout(() => {
            setTransientWarning(null);
            setIsViolationVisualActive(false);
        }, 5000);

        // ... existing fetch logic
        const violationData = {
            studentId: currentUser?.id,
            studentName: currentUser?.name,
            paperId: paper.id,
            violationType: type,
            details: details,
            timestamp: new Date().toISOString()
        };

        try {
            await fetch('http://localhost:8087/api/violations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(violationData)
            });
        } catch (err) {
            console.error("Failed to log violation:", err);
        }
    };

    // Proctoring Effects
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (isSubmittingRef.current) return;
            if (document.visibilityState === 'hidden') {
                logViolation('TAB_SWITCH', 'Student switched tabs or minimized the browser.');
            }
        };

        const handleBlur = () => {
            if (isSubmittingRef.current) return;
            logViolation('FOCUS_LOSS', 'Student clicked outside the exam window.');
        };

        // ... context menu, copy paste ...

        const handleFullscreenChange = () => {
            if (isSubmittingRef.current) return;
            if (!document.fullscreenElement) {
                logViolation('FULLSCREEN_EXIT', 'Student exited fullscreen mode.');
                setIsShowLockout(true);
            } else {
                setIsShowLockout(false);
            }
        };

        // ... event listeners ...
        // (Keep existing listeners add/remove)
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            if (isSubmittingRef.current) return;
            logViolation('RIGHT_CLICK', 'Student attempted to right-click.');
        };

        const handleCopyPaste = (e: ClipboardEvent) => {
            e.preventDefault();
            if (isSubmittingRef.current) return;
            logViolation('COPY_PASTE', `Student attempted to ${e.type}.`);
        };

        const blockEvent = (e: Event) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
        };


        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                setTransientWarning("PROCTORING ALERT: Fullscreen is required! Do not press Esc.");
                setIsViolationVisualActive(true);

                if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
                warningTimeoutRef.current = setTimeout(() => {
                    setTransientWarning(null);
                    setIsViolationVisualActive(false);
                }, 5000);
            }
        };

        // Lock Escape key if supported
        if ('keyboard' in navigator && 'lock' in (navigator as any).keyboard) {
            (navigator as any).keyboard.lock(['Escape']).catch((err: any) => {
                console.error('Keyboard lock failed:', err);
            });
        }

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('copy', handleCopyPaste);
        document.addEventListener('paste', handleCopyPaste);
        document.addEventListener('cut', handleCopyPaste);
        document.addEventListener('selectstart', blockEvent);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            // ... cleanup
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('copy', handleCopyPaste);
            document.removeEventListener('paste', handleCopyPaste);
            document.removeEventListener('cut', handleCopyPaste);
            document.removeEventListener('selectstart', blockEvent);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            // Unlock keyboard if supported
            if ('keyboard' in navigator && 'unlock' in (navigator as any).keyboard) {
                (navigator as any).keyboard.unlock();
            }
            document.removeEventListener('keydown', handleKeyDown);

            if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
        };
    }, []);

    useEffect(() => {
        // Fixed Timer Logic based on Server End Time
        const interval = setInterval(() => {
            if (paper.endTime) {
                const now = new Date();
                const end = new Date(paper.endTime);
                const diff = Math.floor((end.getTime() - now.getTime()) / 1000);

                if (diff <= 0) {
                    setTimeLeft(0);
                    handleSubmit(true, 'COMPLETED');
                } else {
                    setTimeLeft(diff);
                }
            } else {
                // Fallback for manual duration if no specific end time
                if (timeLeft > 0) {
                    setTimeLeft(prev => prev - 1);
                } else {
                    handleSubmit(true, 'COMPLETED');
                }
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [paper.endTime, timeLeft]);

    // Reset terminal when changing questions
    useEffect(() => {
        setIsRunning(false);
        setTerminalKey(prev => prev + 1);
        terminalStompClient.current = null;
    }, [currentQuestionIndex]);

    const handleAnswerSelect = (optionIndex: number) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestionIndex] = optionIndex;
        setAnswers(newAnswers);
        answersRef.current = newAnswers; // Sync Ref immediately
    };

    const handleCodeChange = (value: string | undefined) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestionIndex] = value || "";
        setAnswers(newAnswers);
        answersRef.current = newAnswers; // Sync Ref immediately
    };

    // Resizer Logic
    const startResizing = (e: React.MouseEvent) => {
        setIsDragging(true);
        e.preventDefault();
    };

    const startVerticalResizing = (e: React.MouseEvent) => {
        setIsVerticalDragging(true);
        e.preventDefault();
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                const newWidth = (e.clientX / window.innerWidth) * 100;
                if (newWidth > 20 && newWidth < 80) {
                    setLeftWidth(newWidth);
                }
            } else if (isVerticalDragging) {
                const mainElement = document.querySelector('main');
                if (mainElement) {
                    const rect = mainElement.getBoundingClientRect();
                    const newHeight = ((rect.bottom - e.clientY) / rect.height) * 100;
                    if (newHeight > 10 && newHeight < 80) {
                        setConsoleHeight(newHeight);
                    }
                }
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            setIsVerticalDragging(false);
        };

        if (isDragging || isVerticalDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isVerticalDragging]);

    // Initialize answer for coding questions if empty
    useEffect(() => {
        const currentQ = paper.questions[currentQuestionIndex];

        if (currentQ && currentQ.type === QuestionType.Coding && (answers[currentQuestionIndex] === null || answers[currentQuestionIndex] === undefined)) {
            const lang = getQuestionLanguage(currentQ, paper.title);
            const template = getInitialCode(lang);
            const newAnswers = [...answers];
            newAnswers[currentQuestionIndex] = template;
            setAnswers(newAnswers);
            answersRef.current = newAnswers; // Sync Ref immediately
        }
    }, [currentQuestionIndex, paper.questions, paper.title, answers]);

    const handleRunCode = () => {
        if (isRunning) return;

        if (!terminalStompClient.current || !terminalStompClient.current.connected) {
            alert('Terminal is still connecting. Please wait a moment.');
            return;
        }

        const code = answersRef.current[currentQuestionIndex] as string;
        if (!code) {
            alert('Please write some code first.');
            return;
        }

        const currentQ = paper.questions[currentQuestionIndex];
        const lang = getQuestionLanguage(currentQ, paper.title).toUpperCase();

        setIsRunning(true);

        terminalStompClient.current.send(`/app/start/${(currentUser?.id)}`, {}, JSON.stringify({
            code: code,
            language: lang
        }));
    };

    const handleStopCode = () => {
        if (!isRunning) return;

        if (terminalStompClient.current && terminalStompClient.current.connected) {
            terminalStompClient.current.send(`/app/stop/${(currentUser?.id)}`, {}, {});
        }
        setIsRunning(false);
    };

    const handleTerminalReady = (client: Stomp.Client) => {
        terminalStompClient.current = client;
    };

    const handleProcessExit = () => {
        setIsRunning(false);
    };

    const handleClearTerminal = () => {
        setTerminalKey(prev => prev + 1);
        terminalStompClient.current = null;
        setIsRunning(false);
    };

    const handleSaveAndNext = () => {
        // Save progress (Status: IN_PROGRESS)
        handleSubmit(true, 'IN_PROGRESS');

        if (currentQuestionIndex < paper.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            // Last question
        }
    };

    const handleNextQuestion = () => {
        handleSubmit(true, 'IN_PROGRESS'); // Auto-save on next
        setCurrentQuestionIndex(prev => Math.min(paper.questions.length - 1, prev + 1));
    };

    const handlePrevQuestion = () => {
        handleSubmit(true, 'IN_PROGRESS'); // Auto-save on prev
        setCurrentQuestionIndex(prev => Math.max(0, prev - 1));
    };

    const handleSubmit = async (isAuto: boolean = false, status: 'IN_PROGRESS' | 'COMPLETED' = 'COMPLETED') => {
        if (!currentUser || (isSubmitting && status === 'COMPLETED')) return;
        if (isSubmitting) return;

        if (status === 'COMPLETED' && !isAuto) {
            if (!window.confirm("Are you sure you want to finish the test? All saved progress will be submitted.")) {
                return;
            }
        }

        setIsSubmitting(true);
        isSubmittingRef.current = true; // Update Ref to block violations

        // Index Mapping Fix: Map randomized answers back to full paper indices
        // Ensure strictly deterministic order by sorting original questions by ID
        const sortedOriginalQuestions = [...originalPaper.questions].sort((a, b) =>
            (a.id || "").toString().localeCompare((b.id || "").toString())
        );

        // Use answersRef.current to get the absolute latest state
        const currentAnswers = answersRef.current;

        const fullAnswers = sortedOriginalQuestions.map(oq => {
            const randomizedIndex = paper.questions.findIndex(pq => pq.id === oq.id);
            if (randomizedIndex !== -1) {
                const answer = currentAnswers[randomizedIndex];
                if (answer === null) return -1;
                return answer;
            }
            return -1; // Not assigned to this student
        });

        const newTestResult: Test = {
            id: `test-${Date.now()}`,
            paper: originalPaper,
            studentName: currentUser.name,
            studentId: currentUser.id,
            answers: fullAnswers,
            score: 0,
            submittedAt: new Date(),
            aiEvaluations: JSON.stringify({}),
            status: status
        };

        try {
            await addTest(newTestResult);
            if (status === 'COMPLETED') {
                onTestComplete();
            }
        } catch (err) {
            alert('Failed to save test.');
            setIsSubmitting(false);
            isSubmittingRef.current = false;
        } finally {
            if (status !== 'COMPLETED') {
                setIsSubmitting(false);
                isSubmittingRef.current = false;
            }
            setGradingStatus('');
        }
    };

    const currentQuestion = paper.questions[currentQuestionIndex];

    if (!currentQuestion) {
        return (
            <div className={`fixed inset-0 flex flex-col items-center justify-center p-12 text-center animate-fade-in ${theme === 'light' ? 'bg-white' : 'bg-[#0C1B2A]'}`}>
                <AlertCircle size={48} className="text-brand-primary mb-4" />
                <h2 className={`text-2xl font-bold mb-2 ${theme === 'light' ? 'text-gray-800' : 'text-brand-text'}`}>No Questions Assigned</h2>
                <p className={`mb-6 ${theme === 'light' ? 'text-gray-500' : 'text-brand-text/60'}`}>This test doesn't contain any questions assigned to you.</p>
                <button onClick={onTestComplete} className="bg-brand-primary text-white py-2 px-6 rounded-lg font-bold shadow-lg">Go Back</button>
            </div>
        );
    }

    return (
        <div className={`fixed inset-0 flex flex-col overflow-hidden z-[100] animate-fade-in ${theme === 'light' ? 'bg-white' : 'bg-[#0C1B2A]'} ${isDragging || isVerticalDragging ? 'select-none' : ''} ${isViolationVisualActive ? 'border-[8px] border-rose-600' : ''}`}>
            {/* Header */}
            <header className={`h-14 border-b flex items-center justify-between px-6 shrink-0 shadow-sm transition-colors duration-300 ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#0a1520] border-white/5'} `}>
                <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${theme === 'light' ? 'bg-brand-primary/5' : 'bg-brand-primary/10'} `}>
                        <BookOpen size={20} className="text-brand-primary" />
                    </div>
                    <div>
                        <h3 className={`text-base font-bold tracking-tight transition-colors duration-300 ${theme === 'light' ? 'text-gray-900' : 'text-brand-text'} `}>{paper.examTitle || paper.title}</h3>
                        <div className="flex items-center space-x-2">
                            <span className={`text-xs uppercase tracking-widest font-bold transition-colors duration-300 ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'} `}>
                                Question {currentQuestionIndex + 1} of {paper.questions.length}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-6">
                    <button
                        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                        className={`p-2 rounded-lg transition-all active:scale-95 ${theme === 'light' ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-white/5 text-brand-primary hover:bg-white/10'} `}
                    >
                        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                    </button>

                    <div className={`flex items-center space-x-3 px-4 py-1.5 rounded-full border transition-all duration-500 ${timeLeft < 300
                        ? (theme === 'light' ? 'bg-rose-50 border-rose-200' : 'bg-rose-500/10 border-rose-500/30') + ' animate-pulse'
                        : (theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-white/5 border-white/10')
                        } `}>
                        <Clock size={16} className={timeLeft < 300 ? 'text-rose-500' : (theme === 'light' ? 'text-gray-400' : 'text-brand-primary')} />
                        <span className={`text-sm font-mono font-bold ${timeLeft < 300 ? 'text-rose-500' : (theme === 'light' ? 'text-gray-700' : 'text-brand-text')} `}>
                            {Math.floor(timeLeft / 60)}:{('0' + (timeLeft % 60)).slice(-2)}
                        </span>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded border transition-colors duration-500 ${isViolationVisualActive ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'} `}>
                        <AlertCircle size={14} className={isViolationVisualActive ? 'animate-pulse' : ''} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                            {isViolationVisualActive ? `Warnings: ${warningCount}/${paper.warningLimit || 10}` : 'Proctoring Active'}
                        </span>
                    </div>

                    <button
                        onClick={() => handleSubmit(false, 'COMPLETED')}
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Submitting...' : 'Finish Test'}
                    </button>
                </div >
            </header>
            {!document.fullscreenElement && (
                <div className="bg-rose-600 text-white text-[10px] font-bold py-1 px-4 text-center animate-bounce z-[200]">
                    ⚠️ PROCTORING VIOLATION: FULLSCREEN REQUIRED. Re-enter fullscreen to continue.
                </div>
            )}

            {transientWarning && (
                <div className="bg-orange-600 text-white text-[10px] font-bold py-1 px-4 text-center animate-pulse z-[200]">
                    ⚠️ {transientWarning}
                </div>
            )}

            <main className={`flex-1 flex overflow-hidden ${isDragging ? 'cursor-col-resize' : ''} ${isVerticalDragging ? 'cursor-row-resize' : ''}`}>
                <div
                    style={{ width: `${leftWidth}%` }}
                    className={`flex flex-col border-r transition-colors duration-300 overflow-y-auto custom-scrollbar ${theme === 'light' ? 'bg-[#fafafa] border-gray-200' : 'bg-[#122338] border-white/5'}`}
                >
                    <div className="p-8">
                        <div className="max-w-3xl mx-auto">
                            <div className="flex items-center justify-between mb-8">
                                <span className={`text-xs font-bold px-3 py-1 rounded-md border ${theme === 'light' ? 'bg-gray-100 text-gray-600 border-gray-200' : 'bg-brand-primary/10 text-brand-primary border-brand-primary/20'}`}>
                                    Question {currentQuestionIndex + 1}
                                </span>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={handlePrevQuestion}
                                        disabled={currentQuestionIndex === 0}
                                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all font-bold disabled:opacity-30 ${theme === 'light' ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}
                                    >
                                        <ChevronLeft size={18} />
                                        <span className="text-xs uppercase tracking-wider font-bold">Prev</span>
                                    </button>
                                    <button
                                        onClick={handleNextQuestion}
                                        disabled={currentQuestionIndex === paper.questions.length - 1}
                                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all font-bold disabled:opacity-30 ${theme === 'light' ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}
                                    >
                                        <span className="text-xs uppercase tracking-wider font-bold">Next</span>
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>

                            <h1 className={`text-xl font-bold mb-6 ${theme === 'light' ? 'text-gray-900' : 'text-brand-text'}`}>
                                {currentQuestion.title || 'Question Description'}
                            </h1>

                            <div className={`prose max-w-none ${theme === 'dark' ? 'prose-invert' : ''}`}>
                                <div className={`p-4 rounded-xl mb-6 ${theme === 'light' ? 'bg-white border border-gray-100' : 'bg-white/5 border border-white/5'}`}>
                                    <p className={`leading-relaxed text-base whitespace-pre-wrap font-medium ${theme === 'light' ? 'text-gray-700' : 'text-brand-text/90'}`}>
                                        {currentQuestion.text}
                                    </p>
                                </div>
                                {currentQuestion.type === QuestionType.Coding && (
                                    <div className="space-y-4">
                                        {/* Format & Constraints */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {currentQuestion.inputFormat && (
                                                <div className={`p-4 rounded-lg border ${theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-brand-primary/5 border-brand-primary/10'}`}>
                                                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary mb-2">Input Format</h4>
                                                    <p className={`text-sm leading-relaxed ${theme === 'light' ? 'text-gray-800' : 'text-brand-text/80'}`}>{currentQuestion.inputFormat}</p>
                                                </div>
                                            )}
                                            {currentQuestion.outputFormat && (
                                                <div className={`p-4 rounded-lg border ${theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-brand-primary/5 border-brand-primary/10'}`}>
                                                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary mb-2">Output Format</h4>
                                                    <p className={`text-sm leading-relaxed ${theme === 'light' ? 'text-gray-800' : 'text-brand-text/80'}`}>{currentQuestion.outputFormat}</p>
                                                </div>
                                            )}
                                        </div>
                                        {currentQuestion.sampleInput && (
                                            <div className={`p-4 rounded-lg font-mono text-xs ${theme === 'light' ? 'bg-gray-100 text-gray-900 border border-gray-200' : 'bg-black/40 text-brand-text/80'}`}>
                                                <div className={`text-[9px] uppercase tracking-widest mb-2 ${theme === 'light' ? 'text-gray-600 font-bold' : 'text-gray-500'}`}>Sample Input</div>
                                                <pre className="whitespace-pre-wrap">{currentQuestion.sampleInput}</pre>
                                            </div>
                                        )}
                                        {currentQuestion.sampleOutput && (
                                            <div className={`p-4 rounded-lg font-mono text-xs ${theme === 'light' ? 'bg-gray-100 text-gray-900 border border-gray-200' : 'bg-black/40 text-brand-text/80'}`}>
                                                <div className={`text-[9px] uppercase tracking-widest mb-2 ${theme === 'light' ? 'text-gray-600 font-bold' : 'text-gray-500'}`}>Sample Output</div>
                                                <pre className="whitespace-pre-wrap">{currentQuestion.sampleOutput}</pre>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    onMouseDown={startResizing}
                    className={`w-1 h-full cursor-col-resize hover:bg-brand-primary/50 transition-colors z-50 ${isDragging ? 'bg-brand-primary' : (theme === 'light' ? 'bg-gray-200' : 'bg-white/5')}`}
                ></div>

                <div
                    style={{ width: `${100 - leftWidth}%` }}
                    className={`flex flex-col overflow-hidden relative z-10 transition-colors duration-300 ${theme === 'light' ? 'bg-white' : 'bg-[#0C1B2A]'}`}
                >
                    {currentQuestion.type === QuestionType.Coding ? (
                        <>
                            <div className={`h-10 border-b flex items-center justify-between px-4 transition-colors duration-300 ${theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-[#122338] border-white/5'}`}>
                                <div className="flex items-center space-x-2">
                                    <Monitor size={14} className={theme === 'light' ? 'text-blue-600' : 'text-brand-primary'} />
                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                                        {getQuestionLanguage(currentQuestion, paper.title).toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    {!isRunning ? (
                                        <button
                                            onClick={handleRunCode}
                                            disabled={!terminalStompClient.current}
                                            className={`flex items-center space-x-2 px-4 py-1.5 border rounded text-xs font-bold transition-all disabled:opacity-30 ${theme === 'light'
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                                                : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20'
                                                }`}
                                        >
                                            <Play size={14} fill="currentColor" />
                                            <span>RUN CODE</span>
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleStopCode}
                                            className={`flex items-center space-x-2 px-4 py-1.5 border rounded text-xs font-bold transition-all ${theme === 'light'
                                                ? 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100'
                                                : 'bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20'
                                                }`}
                                        >
                                            <Square size={14} fill="currentColor" />
                                            <span>STOP</span>
                                        </button>
                                    )}
                                    <button
                                        onClick={handleSaveAndNext}
                                        className={`flex items-center space-x-2 px-4 py-1.5 border rounded text-xs font-bold transition-all shadow-sm active:scale-95 ${theme === 'light'
                                            ? 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700'
                                            : 'bg-brand-primary text-[#0C1B2A] border-brand-primary/20 hover:bg-brand-secondary'
                                            }`}
                                    >
                                        <CheckCircle2 size={14} />
                                        <span>{currentQuestionIndex === paper.questions.length - 1 ? 'SAVE' : 'SAVE & NEXT'}</span>
                                    </button>
                                </div>
                            </div>
                            <div style={{ height: `${100 - consoleHeight}%` }} className={`relative overflow-hidden border-b ${theme === 'light' ? 'border-gray-100' : 'border-white/5'}`}>
                                <CodeEditor
                                    key={currentQuestionIndex}
                                    language={getQuestionLanguage(currentQuestion, paper.title) as any}
                                    value={(answers[currentQuestionIndex] as string) || ""}
                                    onChange={handleCodeChange}
                                    theme={theme}
                                />
                            </div>
                            <div
                                onMouseDown={startVerticalResizing}
                                className={`h-1 cursor-row-resize hover:bg-brand-primary/50 transition-colors z-50 ${isVerticalDragging ? 'bg-brand-primary' : (theme === 'light' ? 'bg-gray-100' : 'bg-white/5')}`}
                            ></div>
                            <div style={{ height: `${consoleHeight}%` }} className={`flex flex-col transition-colors duration-300 ${theme === 'light' ? 'bg-white' : 'bg-[#0a1520]'}`}>
                                <div className={`h-9 border-b flex items-center justify-between px-4 shrink-0 ${theme === 'light' ? 'bg-gray-50 border-gray-100' : 'bg-black/20 border-white/5'}`}>
                                    <div className={`flex items-center space-x-2 ${theme === 'light' ? 'text-gray-500' : 'text-brand-primary'}`}>
                                        <TerminalIcon size={13} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Console Output</span>
                                    </div>
                                    <button
                                        onClick={handleClearTerminal}
                                        className={`transition-colors ${theme === 'light' ? 'text-gray-400 hover:text-gray-600' : 'text-gray-500 hover:text-white'}`}
                                        title="Clear Console"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-hidden relative">
                                    <Terminal
                                        key={terminalKey}
                                        studentId={studentId}
                                        onReady={handleTerminalReady}
                                        onProcessExit={handleProcessExit}
                                        theme={theme}
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className={`flex-1 flex flex-col p-8 overflow-y-auto transition-colors duration-300 ${theme === 'light' ? 'bg-gray-50/30' : 'bg-[#0a1520]'}`}>
                            <div className="max-w-2xl mx-auto w-full pt-10">
                                <div className={`flex items-center space-x-3 mb-8 pb-4 border-b ${theme === 'light' ? 'border-gray-200' : 'border-white/10'}`}>
                                    <div className={`p-2 rounded-lg ${theme === 'light' ? 'bg-blue-50 text-blue-500' : 'bg-brand-primary/10 text-brand-primary'}`}>
                                        <BookOpen size={24} />
                                    </div>
                                    <h2 className={`text-xl font-bold ${theme === 'light' ? 'text-gray-800' : 'text-brand-text'}`}>
                                        Select the Best Answer
                                    </h2>
                                </div>

                                <div className="space-y-4">
                                    {currentQuestion.options && currentQuestion.options.length > 0 ? (
                                        currentQuestion.options.map((option, index) => {
                                            const isSelected = answers[currentQuestionIndex] === index;
                                            return (
                                                <div
                                                    key={index}
                                                    onClick={() => !isSubmitting && handleAnswerSelect(index)}
                                                    className={`group relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 flex items-center
                                                        ${isSelected
                                                            ? (theme === 'light'
                                                                ? 'bg-blue-50 border-blue-500 shadow-md translate-x-1'
                                                                : 'bg-brand-primary/10 border-brand-primary shadow-[0_0_20px_rgba(0,0,0,0.2)] translate-x-1')
                                                            : (theme === 'light'
                                                                ? 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-sm'
                                                                : 'bg-white/5 border-white/5 hover:border-brand-primary/40 hover:bg-white/10 hover:shadow-sm')
                                                        }
                                                        ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
                                                    `}
                                                >
                                                    <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 mr-5 transition-all duration-300 shrink-0
                                                        ${isSelected
                                                            ? (theme === 'light' ? 'border-blue-500 bg-blue-500 text-white scale-110' : 'border-brand-primary bg-brand-primary text-[#0C1B2A] scale-110')
                                                            : (theme === 'light' ? 'border-gray-300 text-transparent group-hover:border-blue-400' : 'border-white/20 text-transparent group-hover:border-brand-primary/50')
                                                        }
                                                    `}>
                                                        {isSelected && <Check size={16} strokeWidth={4} />}
                                                    </div>

                                                    <div className="flex-1">
                                                        <span className={`text-base font-medium transition-colors duration-300 leading-relaxed block
                                                            ${theme === 'light'
                                                                ? (isSelected ? 'text-blue-900' : 'text-gray-700 group-hover:text-gray-900')
                                                                : (isSelected ? 'text-brand-text' : 'text-gray-300 group-hover:text-white')
                                                            }
                                                        `}>
                                                            {option}
                                                        </span>
                                                    </div>

                                                    {/* Success/Selection Glow Effect */}
                                                    {isSelected && (
                                                        <div className={`absolute inset-0 rounded-xl transition-opacity duration-500 pointer-events-none ${theme === 'light' ? 'bg-blue-500/5' : 'bg-brand-primary/5'}`} />
                                                    )}
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className={`p-8 text-center rounded-xl border border-dashed ${theme === 'light' ? 'bg-gray-50 border-gray-300 text-gray-400' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                                            <p>No options available for this question.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};


// --- WRAPPER COMPONENT --- //
interface TakeTestProps {
    onViewDetails: (test: Test) => void;
    selectedPaper: Paper | null;
    setSelectedPaper: (paper: Paper | null) => void;
    fullOriginalPaper: Paper | null;
    setFullOriginalPaper: (paper: Paper | null) => void;
    testSubmitted: boolean;
    setTestSubmitted: (v: boolean) => void;
}

type TestStatus = 'ACCESS_CODE' | 'INSTRUCTIONS' | 'TEST' | 'THANK_YOU';

const TakeTest: React.FC<TakeTestProps> = ({
    onViewDetails,
    selectedPaper,
    setSelectedPaper,
    fullOriginalPaper,
    setFullOriginalPaper,
    testSubmitted,
    setTestSubmitted
}) => {
    const { papers, currentUser, tests } = useContext(AppContext);
    const [accessCode, setAccessCode] = useState('');
    const [error, setError] = useState('');
    const [status, setStatus] = useState<TestStatus>(selectedPaper ? 'INSTRUCTIONS' : 'ACCESS_CODE');
    const [localPaper, setLocalPaper] = useState<Paper | null>(null);

    const handleStartTestFlow = () => {
        if (!accessCode) {
            setError('Please enter an access code.');
            return;
        }

        const paper = papers.find(p => p.accessCode === accessCode);

        if (paper) {
            if (currentUser) {
                // Check if student has already completed this test
                const existingTest = tests.find(t => t.studentId === currentUser.id && t.paper.id === paper.id && t.status === 'COMPLETED');

                if (existingTest) {
                    setError('You have already appeared for this exam.');
                    return;
                }

                const assignedQuestions = getAssignedQuestions(paper, currentUser.id);
                const randomizedPaper = { ...paper, questions: assignedQuestions };

                setLocalPaper(paper); // Original paper
                setSelectedPaper(randomizedPaper); // Randomized
                setFullOriginalPaper(paper);
                setTestSubmitted(false);
                setError('');
                setStatus('INSTRUCTIONS'); // Move to instructions
            } else {
                setError('You must be logged in to take a test.');
            }
        } else {
            setError('Invalid Access Code. Please try again.');
        }
    };

    const handleProceedToTest = () => {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().then(() => {
                setStatus('TEST');
            }).catch(err => {
                console.error("Error entering fullscreen:", err);
                setStatus('TEST'); // Proceed anyway but might fail violation checks
            });
        } else {
            setStatus('TEST');
        }
    };

    const handleTestComplete = () => {
        setTestSubmitted(true);
        if (document.exitFullscreen) {
            document.exitFullscreen().catch(console.error);
        }
        setStatus('THANK_YOU');
    };

    const handleBackToDashboard = () => {
        setSelectedPaper(null);
        setStatus('ACCESS_CODE'); // Reset
    };

    if (status === 'THANK_YOU') {
        return (
            <div className="min-h-screen flex items-center justify-center animate-fade-in bg-[#0a1520] p-6">
                <div className="bg-brand-card border border-white/10 p-12 rounded-2xl shadow-2xl max-w-lg w-full text-center relative overflow-hidden">
                    {/* Confetti or decorative elements could go here */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary via-blue-500 to-brand-primary"></div>

                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="text-emerald-500 w-10 h-10" />
                    </div>

                    <h2 className="text-3xl font-bold text-white mb-4">Exam Completed!</h2>
                    <p className="text-gray-400 mb-8 text-lg">Thank you for submitting your test. Your responses have been recorded securely.</p>

                    <button
                        onClick={handleBackToDashboard}
                        className="w-full bg-brand-primary hover:bg-brand-secondary text-[#0C1B2A] font-bold py-3 rounded-lg transition-all active:scale-95 shadow-lg shadow-brand-primary/20"
                    >
                        RETURN TO DASHBOARD
                    </button>
                </div>
            </div>
        );
    }

    if (status === 'INSTRUCTIONS' && selectedPaper) {
        return (
            <div className="min-h-screen flex items-center justify-center animate-fade-in bg-[#0a1520] p-6">
                <div className="bg-brand-card border border-white/10 p-8 rounded-2xl shadow-xl max-w-2xl w-full">
                    <div className="flex items-center space-x-3 mb-6 pb-6 border-b border-white/10">
                        <ShieldCheck className="text-brand-primary w-8 h-8" />
                        <h2 className="text-2xl font-bold text-white">Examination Guidelines & Monitor</h2>
                    </div>

                    <div className="space-y-6 mb-8">
                        <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-4">
                            <h4 className="text-rose-400 font-bold mb-2 flex items-center">
                                <AlertCircle size={16} className="mr-2" />
                                Strict Proctoring Active
                            </h4>
                            <ul className="text-gray-300 space-y-2 text-sm list-disc pl-5">
                                <li>Full-screen mode is <strong>mandatory</strong>. Exiting full-screen will trigger a violation.</li>
                                <li>Tab switching/minimized window will be recorded.</li>
                                <li>Copy/Paste functionality is <strong>disabled</strong>.</li>
                                <li>Right-click context menu is <strong>disabled</strong>.</li>
                            </ul>
                        </div>

                        <div className="bg-white/5 border border-white/5 rounded-lg p-4">
                            <h4 className="text-brand-primary font-bold mb-2">Test Details</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500 block">Exam Title</span>
                                    <span className="text-white font-medium">{selectedPaper.examTitle}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 block">Total Questions</span>
                                    <span className="text-white font-medium">{selectedPaper.questions.length}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 block">Duration</span>
                                    <span className="text-white font-medium">Auto-submit on time up</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleProceedToTest}
                        className="w-full bg-brand-primary hover:bg-brand-secondary text-[#0C1B2A] font-bold py-4 rounded-xl transition-all active:scale-95 shadow-xl shadow-brand-primary/20 flex items-center justify-center space-x-2"
                    >
                        <Maximize2 size={20} />
                        <span>ENTER FULLSCREEN & START TEST</span>
                    </button>
                </div>
            </div>
        );
    }

    if (status === 'TEST' && selectedPaper && fullOriginalPaper) {
        return (
            <TestRunner
                paper={selectedPaper}
                originalPaper={fullOriginalPaper}
                onTestComplete={handleTestComplete}
            />
        );
    }

    // Default: ACCESS_CODE
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
            <div className="bg-brand-card/50 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Lock className="text-brand-primary w-8 h-8" />
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">Restricted Access</h2>
                <p className="text-gray-400 mb-8 text-sm">Please enter the unique access code provided by your instructor to begin the examination.</p>

                <div className="space-y-4">
                    <div>
                        <input
                            type="text"
                            placeholder="Enter Access Code (e.g., EXAM-123)"
                            value={accessCode}
                            onChange={(e) => setAccessCode(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all font-mono text-center tracking-widest uppercase"
                        />
                        {error && <p className="text-rose-500 text-xs mt-2 font-medium animate-pulse">{error}</p>}
                    </div>

                    <button
                        onClick={handleStartTestFlow}
                        className="w-full bg-brand-primary hover:bg-brand-secondary text-[#0C1B2A] font-bold py-3 rounded-lg transition-all active:scale-95 shadow-lg shadow-brand-primary/20"
                    >
                        VERIFY & CONTINUE
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TakeTest;