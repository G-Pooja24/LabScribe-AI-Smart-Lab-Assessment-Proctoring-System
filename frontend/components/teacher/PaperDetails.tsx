import React from 'react';
import { Paper, QuestionType } from '../../types';

interface PaperDetailsProps {
    paper: Paper;
    onBack: () => void;
}

const PaperDetails: React.FC<PaperDetailsProps> = ({ paper, onBack }) => {
    const handleDownload = () => {
        const paperTitle = `Question Paper - ${paper.title}`;
        let fileContent = `${paperTitle}\n`;
        fileContent += `Topic: ${paper.topic}\n`;
        fileContent += `Difficulty: ${paper.difficulty}\n`;
        fileContent += "====================================\n\n";

        paper.questions.forEach((q, index) => {
            fileContent += `Q${index + 1}: ${q.text}\n`;
            if (q.type === QuestionType.MCQ && q.options) {
                q.options.forEach((opt, i) => {
                    fileContent += `  ${String.fromCharCode(97 + i)}) ${opt}\n`;
                });
                fileContent += `Correct Answer: ${String.fromCharCode(97 + (q.correctAnswerIndex ?? 0))}\n\n`;
            } else {
                if (q.answerKey) fileContent += `Answer Key / Logic:\n${q.answerKey}\n\n`;
            }
            fileContent += "------------------------------------\n\n";
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

    return (
        <div className="animate-reveal">
            <div className="flex justify-between items-start mb-6 border-b border-brand-primary/20 pb-4">
                <div>
                    <h3 className="text-2xl font-bold text-brand-text font-display">{paper.title}</h3>
                    <p className='text-brand-text/80'>Topic: {paper.topic}</p>
                    <p className='text-brand-text/80'>Access Code: <span className="text-brand-primary font-bold">{paper.accessCode || 'N/A'}</span></p>
                    <p className='text-brand-text/80'>Difficulty: {paper.difficulty}</p>
                    <p className='text-brand-text/80'>2 Questions Assigned (from {paper.questions.length} total)</p>
                </div>
            </div>

            <div className="space-y-6">
                {paper.questions.map((q, index) => (
                    <div key={q.id} className="border border-brand-primary/20 rounded-lg p-4 bg-brand-bg/30">
                        <p className="font-semibold text-brand-text">{`${index + 1}. ${q.text}`}</p>
                        {q.type === QuestionType.MCQ ? (
                            <ul className="mt-2 space-y-1 pl-2">
                                {q.options?.map((opt, i) => {
                                    const isCorrectAnswer = q.correctAnswerIndex === i;
                                    let classes = "flex items-center p-2 rounded-md ";

                                    if (isCorrectAnswer) {
                                        classes += "bg-green-500/20 text-green-300 font-semibold";
                                    } else {
                                        classes += 'text-brand-text/80';
                                    }

                                    return <li key={i} className={classes}>{opt}</li>;
                                })}
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

            <div className="mt-8 flex justify-end gap-4">
                <button onClick={onBack} className="font-bold py-2 px-6 rounded-lg transition duration-300 bg-brand-primary/20 text-brand-text hover:bg-brand-primary/40">
                    &larr; Back to Papers
                </button>
                <button onClick={handleDownload} className="font-bold py-2 px-6 rounded-lg transition duration-300 bg-brand-primary text-brand-text hover:bg-brand-secondary shadow-lg shadow-brand-primary/30 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    Download Paper
                </button>
            </div>
        </div>
    );
};

export default PaperDetails;
