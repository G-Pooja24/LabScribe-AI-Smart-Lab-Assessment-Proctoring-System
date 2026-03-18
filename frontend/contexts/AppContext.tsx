// Fix: Create the AppContext and AppProvider to manage global state with persistence.
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, Role, Paper, Test, ChatMessage, QuestionType, Difficulty } from '../types';

// Initial mock data
const TEACHER_DEFAULT_AVATAR = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzAwQjREOCI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTIiIGZpbGw9IiMwQzFCMkEiLz48cGF0aCBkPSJNMTIgMTJjMi4yMSAwIDQtMS43OSA0LTRzLTEuNzktNC00LTQtNCAxLjc5LTQgNCAxLjc5IDQgNCA0em0wIDJjLTIuNjcgMC04IDEuMzQtOCA0djJoMTZ2LTJjMC0yLjY2LTUuMzMtNC04LTR6IiBmaWxsPSIjMDBCNEQ4Ii8+PC9zdmc+";
const STUDENT_DEFAULT_AVATAR = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzVDRTFFNiI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTIiIGZpbGw9IiMwQzFCMkEiLz48cGF0aCBkPSJNMTIgMTJjMi4yMSAwIDQtMS43OSA0LTRzLTEuNzktNC00LTQtNCAxLjc5LTQgNCAxLjc5IDQgNCA0em0wIDJjLTIuNjcgMC04IDEuMzQtOCA0djJoMTZ2LTJjMC0yLjY2LTUuMzMtNC04LTR6IiBmaWxsPSIjNUNFMUU2Ii8+PC9zdmc+";

const initialUsers: User[] = [
    { id: 't1', name: 'Dr. Evelyn Reed', email: 'teacher@example.com', password: 'password', role: Role.Teacher, profilePicture: TEACHER_DEFAULT_AVATAR, createdAt: '2025-11-12T10:00:00' },
    { id: 's1', name: 'Alex Johnson', email: 'student@example.com', password: 'password', role: Role.Student, profilePicture: STUDENT_DEFAULT_AVATAR, createdAt: '2025-11-15T14:30:00' },
];

const initialPapers: Paper[] = [
    {
        id: 'paper-1',
        title: 'Biology Basics Test (Easy)',
        examTitle: 'Biology Basics',
        topic: 'Biology',
        difficulty: Difficulty.Easy,
        teacherId: 't1',
        questions: [
            { id: 'q1', text: 'What is the powerhouse of the cell?', options: ['Nucleus', 'Mitochondrion', 'Ribosome', 'Chloroplast'], correctAnswerIndex: 1, difficulty: Difficulty.Easy, topic: 'Biology', type: QuestionType.MCQ },
            { id: 'q2', text: 'Which gas do plants absorb from the atmosphere?', options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'], correctAnswerIndex: 2, difficulty: Difficulty.Easy, topic: 'Biology', type: QuestionType.MCQ },
        ]
    }
];

const initialTests: Test[] = [
    {
        id: 'test-1',
        paper: initialPapers[0],
        studentName: 'Alex Johnson',
        studentId: 's1',
        answers: [1, 1],
        score: 1,
        submittedAt: new Date(Date.now() - 86400000), // 1 day ago
    }
];

// Define the shape of the context data
interface AppContextType {
    currentUser: User | null;
    users: User[];
    papers: Paper[];
    tests: Test[];
    chatHistories: { [userId: string]: ChatMessage[] };
    chatArchives: { [userId: string]: ChatMessage[][] };
    initialChatMessage: ChatMessage;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    register: (name: string, email: string, password: string, role: Role) => Promise<void>;
    addPaper: (paper: Paper) => Promise<boolean>;
    addTest: (test: Test) => Promise<void>;
    updateUser: (user: User) => void;
    setChatHistory: (userId: string, messages: ChatMessage[]) => void;
    clearChatHistory: (userId: string) => void;
    loadArchivedChat: (userId: string, archiveIndex: number) => void;
}

// Create the context
export const AppContext = createContext<AppContextType>({} as AppContextType);

// Create the provider component
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Helper to load data from localStorage
    const getStoredData = <T,>(key: string, defaultValue: T): T => {
        const stored = localStorage.getItem(key);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error(`Error parsing localStorage key "${key}":`, e);
            }
        }
        return defaultValue;
    };

    const [users, setUsers] = useState<User[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        const stored = sessionStorage.getItem('labqms_currentUser');
        return stored ? JSON.parse(stored) : null;
    });
    const [papers, setPapers] = useState<Paper[]>([]);
    const [tests, setTests] = useState<Test[]>([]);

    const API_URL = "http://localhost:8087/api";

    // Persistence effects (using sessionStorage for current user to support multi-tab sessions)
    useEffect(() => {
        sessionStorage.setItem('labqms_currentUser', JSON.stringify(currentUser));
    }, [currentUser]);

    // Fetch initial data from Backend
    useEffect(() => {
        const fetchData = async () => {
            try {
                const papersRes = await fetch(`${API_URL}/papers`);
                if (papersRes.ok) {
                    const papersData = await papersRes.json();
                    setPapers(papersData);
                }

                const testsRes = await fetch(`${API_URL}/tests`);
                if (testsRes.ok) {
                    const testsData = await testsRes.json();
                    const parsedTests = testsData.map((test: any) => ({
                        ...test,
                        submittedAt: new Date(test.submittedAt)
                    }));
                    setTests(parsedTests);
                }
            } catch (error) {
                console.error("Failed to fetch data from backend:", error);
                // Fallback to local storage if needed or show error
            }
        };
        fetchData();
    }, []);

    const initialChatMessage: ChatMessage = {
        id: 'initial',
        text: "Hello! How can I help you today?",
        sender: 'ai'
    };

    const [chatHistories, setChatHistories] = useState<{ [userId: string]: ChatMessage[] }>({});
    const [chatArchives, setChatArchives] = useState<{ [userId: string]: ChatMessage[][] }>({});

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const user = await response.json();
                setCurrentUser(user);
                return true;
            }
        } catch (error) {
            console.error("Login Error:", error);
        }
        return false;
    };

    const logout = () => {
        setCurrentUser(null);
    };

    const register = async (name: string, email: string, password: string, role: Role): Promise<void> => {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Registration failed.');
        }

        const newUser = await response.json();
        setCurrentUser(newUser); // Auto-login after registration
    };

    const addPaper = async (paper: Paper): Promise<boolean> => {
        try {
            const response = await fetch(`${API_URL}/papers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(paper)
            });
            if (response.ok) {
                const savedPaper = await response.json();
                setPapers(prev => [...prev, savedPaper]);
                return true;
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error("Failed to add paper:", response.status, errorData);
                return false;
            }
        } catch (error) {
            console.error("Failed to add paper:", error);
            return false;
        }
    };

    const addTest = async (test: Test) => {
        try {
            const response = await fetch(`${API_URL}/tests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(test)
            });
            if (response.ok) {
                const savedTest = await response.json();
                const parsedTest = {
                    ...savedTest,
                    submittedAt: new Date(savedTest.submittedAt)
                };

                setTests(prev => {
                    const exists = prev.some(t => t.id === parsedTest.id);
                    if (exists) {
                        return prev.map(t => t.id === parsedTest.id ? parsedTest : t);
                    }
                    // Also check by student+paper to be safe if ID changed or wasn't present before
                    const duplicateIndex = prev.findIndex(t => t.studentId === parsedTest.studentId && t.paper.id === parsedTest.paper.id);
                    if (duplicateIndex !== -1) {
                        const newTests = [...prev];
                        newTests[duplicateIndex] = parsedTest;
                        return newTests;
                    }
                    return [...prev, parsedTest];
                });
            }
        } catch (error) {
            console.error("Failed to add test:", error);
        }
    };

    const updateUser = async (updatedUser: User) => {
        if (currentUser && currentUser.id === updatedUser.id) {
            try {
                const response = await fetch(`${API_URL}/users/${updatedUser.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedUser)
                });

                if (response.ok) {
                    const savedUser = await response.json();
                    setCurrentUser(savedUser);
                    setUsers(prev => prev.map(u => u.id === savedUser.id ? savedUser : u));
                } else {
                    console.error("Failed to persist user update");
                    // Update locally even if persistence fails for responsiveness, 
                    // though it won't survive a logout
                    setCurrentUser(updatedUser);
                    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
                }
            } catch (error) {
                console.error("Error updating user:", error);
                setCurrentUser(updatedUser);
                setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
            }
        } else {
            setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
        }
    };

    const setChatHistory = (userId: string, messages: ChatMessage[]) => {
        setChatHistories(prev => ({ ...prev, [userId]: messages }));
    };

    const clearChatHistory = (userId: string) => {
        const currentHistory = chatHistories[userId];
        if (currentHistory && currentHistory.length > 1) { // Don't archive initial message only
            const newArchives = [...(chatArchives[userId] || []), currentHistory];
            setChatArchives(prev => ({ ...prev, [userId]: newArchives }));
        }
        setChatHistories(prev => ({ ...prev, [userId]: [initialChatMessage] }));
    };

    const loadArchivedChat = (userId: string, archiveIndex: number) => {
        const userArchives = chatArchives[userId];
        if (userArchives && userArchives[archiveIndex]) {
            setChatHistory(userId, userArchives[archiveIndex]);
        }
    };


    const contextValue: AppContextType = {
        currentUser,
        users,
        papers,
        tests,
        login,
        logout,
        register,
        addPaper,
        addTest,
        updateUser,
        chatHistories,
        chatArchives,
        initialChatMessage,
        setChatHistory,
        clearChatHistory,
        loadArchivedChat,
    };

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};
