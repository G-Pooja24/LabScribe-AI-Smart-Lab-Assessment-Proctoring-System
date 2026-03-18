import { GoogleGenAI, Type } from "@google/genai";
import { Difficulty, Question, QuestionType } from "../types";

// Helper to safely get API key defined in vite.config.ts
const getApiKey = () => {
    try {
        return process.env.API_KEY || process.env.GEMINI_API_KEY || '';
    } catch (e) {
        return '';
    }
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

const mcqQuestionSchema = {
    type: Type.OBJECT,
    properties: {
        text: { type: Type.STRING, description: 'The question text.' },
        options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'An array of 4 possible answers.'
        },
        correctAnswerIndex: { type: Type.INTEGER, description: 'The 0-based index of the correct answer in the options array.' },
        difficulty: { type: Type.STRING, enum: Object.values(Difficulty), description: 'The difficulty of the question.' },
        topic: { type: Type.STRING, description: 'The topic of the question.' },
        type: { type: Type.STRING, enum: [QuestionType.MCQ], description: `The type of question. Must be "${QuestionType.MCQ}".` }
    },
    required: ['text', 'options', 'correctAnswerIndex', 'difficulty', 'topic', 'type'],
};


const codingQuestionSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING },
        title: { type: Type.STRING },
        questionText: { type: Type.STRING, description: 'The actual coding question (2-3 lines).' },
        description: { type: Type.STRING, description: 'Short contextual explanation (4-5 lines).' },
        inputFormat: { type: Type.STRING },
        outputFormat: { type: Type.STRING },
        constraints: { type: Type.STRING },
        sampleInput: { type: Type.STRING },
        sampleOutput: { type: Type.STRING },
        explanation: { type: Type.STRING },
        answerKey: { type: Type.STRING, description: 'Sample solution or key strategy.' },
        markingScheme: { type: Type.STRING },
        difficulty: { type: Type.STRING, enum: Object.values(Difficulty) },
        topic: { type: Type.STRING },
        type: { type: Type.STRING, enum: [QuestionType.Coding] },
        marks: { type: Type.INTEGER, description: 'Set to 20.' }
    },
    required: ['title', 'questionText', 'description', 'inputFormat', 'outputFormat', 'constraints', 'sampleInput', 'sampleOutput', 'explanation', 'answerKey', 'markingScheme', 'difficulty', 'topic', 'type', 'marks'],
};



// Fallback Questions Repository
const FALLBACK_QUESTIONS: Omit<Question, 'id'>[] = [
    {
        title: "Matrix Multiplication",
        text: "Write a program to multiply two matrices.",
        description: "In this problem, you need to implement matrix multiplication. Given two matrices A (m x n) and B (n x p), the resulting matrix C will be of size (m x p). Each element C[i][j] is the sum of products of corresponding elements from the i-th row of A and the j-th column of B.",
        inputFormat: "Two integers m, n (dimensions of A), then m x n integers. Then two integers n, p (dimensions of B), then n x p integers.",
        outputFormat: "m x p integers representing the product matrix.",
        constraints: "m, n, p <= 100. Elements are integers.",
        sampleInput: "2 2\n1 2\n3 4\n2 2\n5 6\n7 8",
        sampleOutput: "19 22\n43 50",
        explanation: "C[0][0] = 1*5 + 2*7 = 19, C[0][1] = 1*6 + 2*8 = 22, etc.",
        answerKey: "Use nested loops: for i in m, for j in p, for k in n: C[i][j] += A[i][k] * B[k][j].",
        markingScheme: "Algorithm: 5, Nested Loops: 5, Indexing: 5, Edge Cases: 5",
        difficulty: Difficulty.Medium,
        topic: "Arrays",
        type: QuestionType.Coding,
        marks: 20
    },
    {
        title: "String Palindrome",
        text: "Check if a given string is a palindrome.",
        description: "A palindrome is a string that reads the same forwards and backwards. You need to write a function that ignores case and non-alphanumeric characters, determining if the input string is a palindrome.",
        inputFormat: "A single string S.",
        outputFormat: "Boolean (true/false) or 'Yes'/'No'.",
        constraints: "Length of S <= 1000.",
        sampleInput: "RaceCar",
        sampleOutput: "Yes",
        explanation: "Ignoring case, 'racecar' is same backwards.",
        answerKey: "Clean the string, use two-pointer approach or reverse and compare.",
        markingScheme: "Cleaning: 5, Logic: 10, Efficiency: 5",
        difficulty: Difficulty.Easy,
        topic: "Strings",
        type: QuestionType.Coding,
        marks: 20
    },
    {
        title: "Balanced Parentheses",
        text: "Determine if a string of parentheses is balanced.",
        description: "Check if the given string containing brackets '(', ')', '{', '}', '[' and ']' has balanced parentheses. A sequence is balanced if every opening bracket has a corresponding closing bracket of the same type and they are closed in the correct order.",
        inputFormat: "A string containing brackets.",
        outputFormat: "Balanced or Not Balanced.",
        constraints: "Length of string <= 10^4.",
        sampleInput: "{[()]}",
        sampleOutput: "Balanced",
        explanation: "All brackets are closed in the correct order.",
        answerKey: "Use a Stack data structure. Push opening brackets and pop on matching closing brackets.",
        markingScheme: "Stack Implementation: 10, Matching Logic: 5, Efficiency: 5",
        difficulty: Difficulty.Medium,
        topic: "Stacks",
        type: QuestionType.Coding,
        marks: 20
    },
    {
        title: "Linked List Reversal",
        text: "Reverse a singly linked list.",
        description: "Given the head of a singly linked list, reverse the list and return the new head. You should implement this both iteratively and recursively for a deeper understanding of pointer manipulation.",
        inputFormat: "Number of nodes, then N node values.",
        outputFormat: "Reversed list node values.",
        constraints: "Number of nodes <= 5000.",
        sampleInput: "1 2 3 4 5",
        sampleOutput: "5 4 3 2 1",
        explanation: "The pointers are flipped such that 5 points to 4, 4 to 3, etc.",
        answerKey: "Iterative: Use three pointers (prev, current, next) to reverse links.",
        markingScheme: "Pointer Management: 10, Boundary Conditions: 5, Logic: 5",
        difficulty: Difficulty.Medium,
        topic: "Linked Lists",
        type: QuestionType.Coding,
        marks: 20
    },
    {
        title: "Depth First Search (DFS)",
        text: "Implement DFS traversal for a graph.",
        description: "Perform a Depth First Search on a graph starting from a given source node. The graph is represented using an adjacency list. Print the nodes in the order they are visited.",
        inputFormat: "Number of vertices V, number of edges E, then E pairs of integers. Finally, the starting vertex.",
        outputFormat: "Sequence of vertices visited in DFS.",
        constraints: "V <= 1000, E <= 2000.",
        sampleInput: "4 3\n0 1\n0 2\n1 2\n0",
        sampleOutput: "0 1 2",
        explanation: "Starting from 0, visit 1, then explore its neighbor 2.",
        answerKey: "Use recursion or a stack with a visited array.",
        markingScheme: "Graph Representation: 5, Traversal Logic: 10, Recursion/Stack: 5",
        difficulty: Difficulty.Hard,
        topic: "Graphs",
        type: QuestionType.Coding,
        marks: 20
    },
    {
        text: "What is the time complexity of searching in a balanced Binary Search Tree?",
        options: ["O(1)", "O(n)", "O(log n)", "O(n log n)"],
        correctAnswerIndex: 2,
        difficulty: Difficulty.Medium,
        topic: "Data Structures",
        type: QuestionType.MCQ
    },
    {
        text: "Which keyword is used to define a class in Python?",
        options: ["def", "class", "void", "struct"],
        correctAnswerIndex: 1,
        difficulty: Difficulty.Easy,
        topic: "Python",
        type: QuestionType.MCQ
    },
    {
        text: "What does HTML stand for?",
        options: ["Hyper Text Markup Language", "Hyperlinks and Text Markup Language", "Home Tool Markup Language", "Hyper Tool Markup Language"],
        correctAnswerIndex: 0,
        difficulty: Difficulty.Easy,
        topic: "Web Dev",
        type: QuestionType.MCQ
    },
    {
        text: "Which data structure uses LIFO (Last-In-First-Out) principle?",
        options: ["Queue", "Stack", "Linked List", "Array"],
        correctAnswerIndex: 1,
        difficulty: Difficulty.Easy,
        topic: "Data Structures",
        type: QuestionType.MCQ
    },
    {
        text: "What is the worst-case time complexity of QuickSort?",
        options: ["O(n log n)", "O(n)", "O(n^2)", "O(log n)"],
        correctAnswerIndex: 2,
        difficulty: Difficulty.Hard,
        topic: "Algorithms",
        type: QuestionType.MCQ
    }
];

export const generateQuestions = async (count: number, topics: string[], difficulty: Difficulty, questionType: QuestionType): Promise<{ questions: Omit<Question, 'id'>[], isFallback: boolean }> => {
    let prompt: string;
    let itemsSchema: any;

    if (questionType === QuestionType.MCQ) {
        prompt = `Generate ${count} multiple-choice questions about the following topics: ${topics.join(', ')}. The difficulty level should be ${difficulty}. Each question must have exactly 4 options. The question type must be "${QuestionType.MCQ}". Return the result as a JSON object with a single key "questions" which is an array of question objects.`;
        itemsSchema = mcqQuestionSchema;
    } else {
        prompt = `
You are an experienced MCA university examiner and senior software engineer.

Generate exactly ${count} practical, hands-on CODING problems suitable for 
MCA (Master of Computer Applications – Indian university standard).

Topics / Languages:
${topics.join(', ')}

Question Type:
${QuestionType.Coding}

Difficulty Level:
${difficulty}

Marks:
Each question carries exactly 20 marks.

Question Structure Rules (VERY IMPORTANT):
1. Each question must be split into TWO parts:
   a) "questionText": The actual coding question written in clear exam style.
      - Must be STRICTLY 2–3 lines.
      - Should directly state the task to be implemented.
   b) "description": A short contextual explanation related to the question.
      - Must be STRICTLY 4–5 lines.
      - Should clarify the scenario, constraints, or real-world relevance.
2. The questionText and description must complement each other without repetition.

Question Design Rules:
1. Each problem MUST require the student to write executable code. Give straightforward questions.
2. Strictly avoid theoretical, descriptive, or definition-based questions. 
3. Problems must test algorithmic thinking, data structures, or real-world logic.
4. Difficulty calibration:
   - Easy: Basic logic, loops, conditionals, simple arrays/strings.
   - Medium: Multi-step logic, collections, recursion, hashing.
   - Hard: Optimization, edge cases, advanced data structures or algorithms.
5. The problem must be solvable within 2–3 hours by a prepared MCA student.
6. Avoid competitive-programming tricks or puzzle-style questions.
7. Questions must be language-independent (C / Java / Python).

For EACH question, include:
- id (unique number)
- title
- questionText (2–3 lines only)
- description (4–5 lines only)
- inputFormat
- outputFormat
- constraints
- sampleInput
- sampleOutput
- explanation
- answerKey (Sample solution or key algorithm steps)
- markingScheme (detailed breakdown totaling 20 marks)

Output Rules (STRICT):
- Return ONLY valid JSON.
- Do NOT include markdown, comments, or extra text.
- Return a single JSON object with one key: "questions".
- "questions" must be an array following the defined structure.
`;
        itemsSchema = codingQuestionSchema;
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        questions: {
                            type: Type.ARRAY,
                            items: itemsSchema
                        }
                    },
                    required: ['questions']
                },
            },
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        if (result.questions && Array.isArray(result.questions)) {
            const formattedQuestions = result.questions.map((q: any) => ({
                ...q,
                text: q.questionText || q.text,
                marks: q.type === QuestionType.Coding ? (q.marks || 20) : (q.marks || 1)
            }));
            return { questions: formattedQuestions, isFallback: false };
        } else {
            throw new Error("Invalid response format");
        }
    } catch (error: any) {
        console.warn("AI Generation failed. Error:", error.message);
        console.log("Attempting fallback for:", { count, topics, difficulty, questionType });

        // Return a subset of fallback questions that match the type
        const filteredFallback = FALLBACK_QUESTIONS.filter(q => q.type === questionType);

        console.log("Found matching fallback questions:", filteredFallback.length);

        const source = filteredFallback.length > 0 ? filteredFallback : FALLBACK_QUESTIONS;
        const selected = [];
        for (let i = 0; i < count; i++) {
            const q = source[i % source.length];
            selected.push({
                ...q,
                title: count > source.length ? `${q.title || "Question"} (Set ${Math.floor(i / source.length) + 1})` : q.title
            });
        }

        console.log("Returning selected fallback questions:", selected.length);
        return { questions: selected, isFallback: true };
    }
};

// Define a compatible type for chat history.
type ChatHistory = {
    role: string;
    parts: { text: string }[];
}[];


export const getTeacherChatResponse = async (chatHistory: ChatHistory, userMessage: string): Promise<string> => {
    const systemInstruction = `You are an AI assistant for teachers using the LabQMS platform. Be helpful, concise, and professional. 
    You can help with tasks like creating lesson plans, explaining concepts, suggesting lab activities, or generating quiz questions.
    The current chat history is provided.`;

    // Fix: Use ai.models.generateContent for chat functionality with system instructions.
    const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: [...chatHistory, { role: 'user', parts: [{ text: userMessage }] }],
        config: {
            systemInstruction
        }
    });

    return response.text;
};


export const getStudentChatResponse = async (chatHistory: ChatHistory, userMessage: string): Promise<string> => {
    const systemInstruction = `You are an AI study buddy for students using the LabQMS platform. Be friendly, encouraging, and helpful. 
    You can help students understand difficult topics, prepare for tests, and answer questions about their coursework.
    Do not give away direct answers to test questions, but guide them to the solution. The current chat history is provided.`;

    // Fix: Use ai.models.generateContent for chat functionality with system instructions.
    const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: [...chatHistory, { role: 'user', parts: [{ text: userMessage }] }],
        config: {
            systemInstruction
        }
    });

    return response.text;
};