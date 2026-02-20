import React from 'react';
import { Test, QuestionType } from '../../types';
import { getAssignedQuestions } from '../../utils/questionUtils';


interface ResultDetailsProps {
    test: Test;
    onBack: () => void;
}

const ResultDetails: React.FC<ResultDetailsProps> = ({ test, onBack }) => {
    const assignedQuestions = getAssignedQuestions(test.paper, test.studentId);

    const handleDownload = () => {
        let content = `Test Submission: ${test.paper.title}\n`;
        content += `Student: ${test.studentName}\n`;
        content += `Date: ${test.submittedAt.toLocaleString()}\n`;
        content += `========================================\n\n`;

        // Sort questions to match submission order
        const sortedQuestions = [...test.paper.questions].sort((a, b) =>
            (a.id || "").toString().localeCompare((b.id || "").toString())
        );

        assignedQuestions.forEach((q, index) => {
            content += `Q${index + 1}: ${q.text}\n`;
            content += `Type: ${q.type}\n`;

            const answerIndex = sortedQuestions.findIndex(sq => sq.id === q.id);
            const rawAnswer = test.answers[answerIndex];

            if (q.type === QuestionType.MCQ) {
                const studentAnswerIndex = typeof rawAnswer === 'string' ? parseInt(rawAnswer) : rawAnswer as number;
                const studentAnswerText = (studentAnswerIndex !== -1 && !isNaN(studentAnswerIndex)) ? q.options?.[studentAnswerIndex] : "Not Answered";

                content += `\nYour Answer: ${studentAnswerText}\n\n`;
            } else {
                const studentResponse = rawAnswer;
                const displayResponse = (typeof studentResponse === 'string') ? studentResponse : 'No response provided.';
                content += `\nStudent's Response:\n${displayResponse}\n\n`;
            }
            content += `----------------------------------------\n`;
        });

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Submission_${test.studentName.replace(/\s/g, '_')}_${test.paper.title.replace(/\s/g, '_')}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="animate-reveal">
            <div className={`flex justify-between items-start mb-6 border-b border-brand-primary/20 pb-4`}>
                <div>
                    <h3 className={`text-2xl font-bold text-brand-text font-display`}>{test.paper.title}</h3>
                    <p className='text-brand-text/80'>Student: {test.studentName}</p>
                    <p className='text-brand-text/80'>Submitted on: {new Date(test.submittedAt).toLocaleString()}</p>
                </div>
            </div>

            <div className="space-y-6">
                {assignedQuestions.map((q, index) => {
                    // Sort questions to match submission order
                    const sortedQuestions = [...test.paper.questions].sort((a, b) =>
                        (a.id || "").toString().localeCompare((b.id || "").toString())
                    );

                    const answerIndex = sortedQuestions.findIndex(sq => sq.id === q.id);
                    const rawAnswer = test.answers[answerIndex];
                    const studentAnswerIndex = typeof rawAnswer === 'string' ? parseInt(rawAnswer) : rawAnswer as number;

                    return (
                        <div key={q.id} className={`border border-brand-primary/20 rounded-lg p-4 bg-brand-bg/30 relative overflow-hidden`}>
                            <p className={`font-semibold text-brand-text mb-4`}>{`${index + 1}. ${q.text}`}</p>

                            {q.type === QuestionType.MCQ && (
                                <ul className="mt-2 space-y-1 pl-2">
                                    {q.options?.map((opt, i) => {
                                        const isStudentAnswer = studentAnswerIndex === i;
                                        let classes = "flex items-center p-2 rounded-md ";

                                        if (isStudentAnswer) classes += "bg-brand-primary/20 text-brand-text font-semibold border border-brand-primary/30";
                                        else classes += 'text-brand-text/60';

                                        return (
                                            <li key={i} className={classes}>
                                                <span className={`w-6 h-6 rounded-full border text-[10px] flex items-center justify-center mr-3 ${isStudentAnswer ? 'bg-brand-primary border-brand-primary text-brand-bg' : 'border-brand-text/20'}`}>
                                                    {String.fromCharCode(65 + i)}
                                                </span>
                                                {opt}
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}

                            {q.type === QuestionType.Coding && (
                                <div className="space-y-4">
                                    <div className="bg-black/20 p-4 rounded-lg border border-white/5">
                                        <p className="text-xs font-bold text-brand-secondary uppercase tracking-wider mb-2">Student's Response:</p>
                                        <pre className="text-sm font-mono text-brand-text/90 whitespace-pre-wrap">
                                            {(typeof rawAnswer === 'string') ? rawAnswer : 'No response provided.'}
                                        </pre>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 flex flex-wrap gap-4 justify-end">
                <button onClick={onBack} className={`font-bold py-2 px-6 rounded-lg transition duration-300 bg-brand-primary/20 text-brand-text hover:bg-brand-primary/40`}>
                    &larr; Back to Results
                </button>
                <button onClick={handleDownload} className={`relative group font-bold py-2 px-6 rounded-lg overflow-hidden transition-all duration-300 shadow-lg bg-brand-primary text-brand-text hover:bg-brand-secondary shadow-brand-primary/30`}>
                    <span className="relative z-10">Download Submission</span>
                </button>
            </div>
        </div>
    );
};

export default ResultDetails;