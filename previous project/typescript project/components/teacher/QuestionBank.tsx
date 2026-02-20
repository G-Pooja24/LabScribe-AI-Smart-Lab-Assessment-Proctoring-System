import React, { useState, useEffect } from 'react';
import { Question, Difficulty, QuestionType } from '../../types';
import { Edit3, Trash2, Plus, Search, Filter, Book, Globe, Zap, ChevronRight, X } from 'lucide-react';

const QuestionBank: React.FC = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch questions on mount
    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {
            const res = await fetch('http://localhost:8087/api/bank-questions');
            if (res.ok) {
                const data = await res.json();
                setQuestions(data);
            }
        } catch (error) {
            console.error("Failed to fetch questions:", error);
        }
    };

    const filteredQuestions = questions.filter(q =>
        q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.topic.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openModal = (question: Question | null = null) => {
        setEditingQuestion(question);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingQuestion(null);
    };

    const handleSave = async (question: Question) => {
        try {
            if (editingQuestion) {
                // Update
                const res = await fetch(`http://localhost:8087/api/bank-questions/${question.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(question)
                });
                if (res.ok) {
                    const updated = await res.json();
                    setQuestions(questions.map(q => q.id === updated.id ? updated : q));
                }
            } else {
                // Create
                // Ensure ID is null so backend generates it, or let backend handle it
                const { id, ...newQuestion } = question;
                const res = await fetch('http://localhost:8087/api/bank-questions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newQuestion)
                });
                if (res.ok) {
                    const created = await res.json();
                    setQuestions([...questions, created]);
                }
            }
            closeModal();
        } catch (error) {
            console.error("Failed to save question:", error);
            alert("Failed to save question. Please try again.");
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Moving this question to the archive. Proceed?')) {
            try {
                const res = await fetch(`http://localhost:8087/api/bank-questions/${id}`, {
                    method: 'DELETE'
                });
                if (res.ok) {
                    setQuestions(questions.filter(q => q.id !== id));
                }
            } catch (error) {
                console.error("Failed to delete question:", error);
                alert("Failed to delete question.");
            }
        }
    };

    return (
        <div className="relative min-h-full -m-6 p-6 overflow-hidden bg-[#0C1B2A]/50 font-sans">
            {/* Ambient Glow */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-secondary/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" style={{ animationDelay: '3s' }} />

            <div className="relative z-10 space-y-6 animate-fade-in">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-primary/70">Secure Repository</p>
                        </div>
                        <h2 className="text-4xl font-black text-brand-text font-display tracking-tightest">
                            Question <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">Vault</span>
                        </h2>
                        <p className="text-sm text-brand-text/50 font-medium italic">
                            Curate and manage your high-fidelity assessment assets.
                        </p>
                    </div>

                    <button
                        onClick={() => openModal()}
                        className="group flex items-center gap-2.5 bg-gradient-to-r from-brand-primary/80 to-brand-secondary/80 hover:from-brand-primary hover:to-brand-secondary text-[#0C1B2A] font-black py-3 px-6 rounded-xl shadow-lg shadow-brand-primary/20 transition-all hover:scale-105 active:scale-95 text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        New Question
                    </button>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text/30 group-focus-within:text-brand-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by text or topic..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-brand-card/30 backdrop-blur-xl border border-white/10 rounded-xl py-3 pl-11 pr-5 text-sm text-brand-text placeholder:text-brand-text/20 focus:outline-none focus:border-brand-primary/50 transition-all shadow-inner"
                        />
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-5 py-3 bg-brand-card/30 border border-white/10 rounded-xl text-xs text-brand-text/60 font-bold hover:bg-brand-card/50 transition-all">
                            <Filter className="w-3.5 h-3.5 text-brand-secondary" />
                            Filter
                        </button>
                    </div>
                </div>

                {/* Question Feed */}
                <div className="grid grid-cols-1 gap-5">
                    {filteredQuestions.length > 0 ? filteredQuestions.map(q => (
                        <div key={q.id} className="group relative bg-brand-card/20 backdrop-blur-3xl border border-white/5 rounded-[1.5rem] p-6 transition-all duration-500 hover:bg-brand-card/40 hover:border-brand-primary/30 shadow-xl overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                                <Book className="w-24 h-24 text-brand-primary" />
                            </div>

                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="space-y-3 flex-1">
                                    <div className="flex flex-wrap items-center gap-2.5">
                                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${q.difficulty === Difficulty.Easy ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                            q.difficulty === Difficulty.Medium ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                                'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                            }`}>
                                            {q.difficulty}
                                        </span>
                                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                                            {q.topic}
                                        </span>
                                        <div className="w-1 h-1 rounded-full bg-white/10" />
                                        <span className="text-[9px] font-bold text-brand-text/30 uppercase tracking-widest">ID: {q.id}</span>
                                    </div>
                                    <h4 className="text-lg font-bold text-brand-text leading-relaxed tracking-tight group-hover:text-white transition-colors">
                                        {q.text}
                                    </h4>
                                </div>

                                <div className="flex items-center gap-2.5 border-l border-white/5 md:pl-6">
                                    <button
                                        onClick={() => openModal(q)}
                                        className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-brand-secondary transition-all hover:scale-110 active:scale-95 shadow-lg"
                                        title="Edit Assets"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(q.id)}
                                        className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg text-rose-400 transition-all hover:scale-110 active:scale-95 shadow-lg"
                                        title="Archive Question"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <div className="w-6 h-6 flex items-center justify-center text-brand-text/20 group-hover:text-brand-primary group-hover:translate-x-1 transition-all">
                                        <ChevronRight className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="py-16 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[2rem] bg-brand-card/10 space-y-5">
                            <div className="w-16 h-16 bg-brand-card/30 rounded-full flex items-center justify-center text-brand-text/10">
                                <Zap className="w-8 h-8" />
                            </div>
                            <div className="text-center space-y-1.5">
                                <p className="text-lg font-bold text-brand-text/40">The Vault is Silent</p>
                                <p className="text-xs text-brand-text/20">No matching questions identified in current search parameters.</p>
                            </div>
                            <button onClick={() => openModal()} className="text-brand-primary font-black uppercase tracking-widest text-[10px] hover:underline underline-offset-8 transition-all">
                                + Initialize New Resource
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && <QuestionModal question={editingQuestion} onSave={handleSave} onClose={closeModal} />}
        </div>
    );
};

const QuestionModal: React.FC<{ question: Question | null; onSave: (question: Question) => void; onClose: () => void; }> = ({ question, onSave, onClose }) => {
    const [formData, setFormData] = useState<Omit<Question, 'id' | 'type' | 'answerKey'>>({
        text: question?.text || '',
        options: question?.options || ['', '', '', ''],
        correctAnswerIndex: question?.correctAnswerIndex || 0,
        difficulty: question?.difficulty || Difficulty.Easy,
        topic: question?.topic || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...(formData.options || [])];
        newOptions[index] = value;
        setFormData(prev => ({ ...prev, options: newOptions }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, id: question?.id || '', type: QuestionType.MCQ });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xl flex justify-center items-center z-[100] p-4 animate-reveal">
            <div className="bg-[#0C1B2A] border border-white/10 p-8 rounded-[2rem] shadow-[0_0_80px_rgba(0,0,0,0.5)] w-full max-w-xl max-h-[90vh] overflow-y-auto relative group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary to-brand-secondary" />

                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black text-brand-text font-display tracking-tightest">
                        {question ? 'Sync' : 'Create'} <span className="text-brand-primary">Resource</span>
                    </h2>
                    <button onClick={onClose} className="p-1.5 hover:bg-white/5 rounded-full text-brand-text/20 hover:text-brand-text transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-primary/60 ml-1">Question Content</label>
                        <textarea
                            name="text"
                            rows={3}
                            value={formData.text}
                            onChange={(e: any) => handleChange(e)}
                            className="w-full bg-brand-card/50 border border-white/10 rounded-xl py-3 px-5 text-sm text-brand-text focus:outline-none focus:border-brand-primary/50 transition-all resize-none"
                            placeholder="Enter the core question text..."
                            required
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-primary/60 ml-1">Option Distribution</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {(formData.options || []).map((opt, i) => (
                                <div key={i} className="relative group/opt">
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-primary/30 font-black text-[10px]">{i + 1}</div>
                                    <input
                                        type="text"
                                        value={opt}
                                        onChange={(e) => handleOptionChange(i, e.target.value)}
                                        className="w-full bg-brand-card/30 border border-white/5 rounded-lg py-2.5 pl-9 pr-3 text-xs text-brand-text focus:outline-none focus:border-brand-primary/30 transition-all"
                                        placeholder={`Option ${i + 1}`}
                                        required
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/5">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-brand-text/30 ml-1">Key Option</label>
                            <select name="correctAnswerIndex" value={formData.correctAnswerIndex} onChange={handleChange} className="w-full bg-brand-card/50 border border-white/10 rounded-lg py-2.5 px-3 text-xs text-brand-text focus:outline-none">
                                {(formData.options || []).map((opt, i) => (
                                    <option key={i} value={i}>Slot {i + 1}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-brand-text/30 ml-1">Complexity</label>
                            <select name="difficulty" value={formData.difficulty} onChange={handleChange} className="w-full bg-brand-card/50 border border-white/10 rounded-lg py-2.5 px-3 text-xs text-brand-text focus:outline-none">
                                {Object.values(Difficulty).map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-brand-text/30 ml-1">Domain</label>
                            <input type="text" name="topic" value={formData.topic} onChange={handleChange} className="w-full bg-brand-card/50 border border-white/10 rounded-lg py-2.5 px-3 text-xs text-brand-text focus:outline-none" required placeholder="Topic..." />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-6 py-3 text-xs text-brand-text/40 font-bold hover:text-brand-text transition-colors">Discard</button>
                        <button type="submit" className="bg-gradient-to-r from-brand-primary to-brand-secondary text-[#0C1B2A] font-black py-3 px-8 rounded-xl shadow-lg shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all text-xs">
                            Save Resource
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export default QuestionBank;