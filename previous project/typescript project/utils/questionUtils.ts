import { Paper, Question, QuestionType } from '../types';

/**
 * Robust seeded random number generator
 * Uses FNV-1a for hashing and Mulberry32 for PRNG
 */
export const seededRandom = (studentId: string, paperId: string) => {
    const seedStr = `${studentId}::${paperId}`;

    // 32-bit FNV-1a hash
    let hash = 0x811c9dc5;
    for (let i = 0; i < seedStr.length; i++) {
        hash ^= seedStr.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193);
    }

    // Mulberry32 PRNG
    let s = hash >>> 0;
    return () => {
        s |= 0; s = s + 0x6D2B79F5 | 0;
        let t = Math.imul(s ^ s >>> 15, 1 | s);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
};


/**
 * Shuffles an array using a provided random function
 */
export const shuffle = <T,>(array: T[], randomFunc: () => number): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(randomFunc() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

/**
 * Determines which questions are assigned to a specific student for a given paper.
 * Always returns up to 2 questions deterministically.
 */
export const getAssignedQuestions = (paper: Paper, studentId: string): Question[] => {
    if (!paper.questions || paper.questions.length === 0) {
        return [];
    }

    const random = seededRandom(studentId, paper.id);

    // Separate coding and MCQ questions
    const coding = paper.questions.filter(q => q.type === QuestionType.Coding);
    const mcqs = paper.questions.filter(q => q.type === QuestionType.MCQ);

    if (coding.length > 0) {
        // If there are coding questions, prioritize them and limit to 2
        const shuffledCoding = shuffle(coding, random);
        return shuffledCoding.slice(0, 2);
    } else {
        // If it's an MCQ-only test, randomize all questions but don't limit count
        return shuffle(mcqs, random);
    }
};
