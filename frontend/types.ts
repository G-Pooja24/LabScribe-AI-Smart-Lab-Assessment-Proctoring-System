export enum Page {
    Home = 'home',
    About = 'about',
    TeacherLogin = 'teacher-login',
    StudentLogin = 'student-login',
    TeacherRegister = 'teacher-register',
    StudentRegister = 'student-register',
    TeacherDashboard = 'teacher-dashboard',
    StudentDashboard = 'student-dashboard',
}

export enum Role {
    Teacher = 'Teacher',
    Student = 'Student',
}

export enum CodeLanguage {
    Java = 'java',
    Python = 'python',
    C = 'c',
    Cpp = 'cpp',
}

export interface User {
    id: string;
    name: string;
    email: string;
    password?: string; // For mock auth
    role: Role;
    profilePicture: string;
    createdAt?: string;
}

export enum Difficulty {
    Easy = 'Easy',
    Medium = 'Medium',
    Hard = 'Hard',
}

export enum QuestionType {
    MCQ = 'MCQ',
    Coding = 'Coding',
}

export interface Question {
    id: string;
    text: string;
    title?: string;
    description?: string;
    options?: string[];
    correctAnswerIndex?: number;
    answerKey?: string;
    difficulty: Difficulty;
    topic: string;
    type: QuestionType;
    language?: CodeLanguage;
    marks?: number;
    inputFormat?: string;
    outputFormat?: string;
    constraints?: string;
    sampleInput?: string;
    sampleOutput?: string;
    explanation?: string;
    markingScheme?: string;
}

export enum ViolationType {
    TabSwitch = 'TAB_SWITCH',
    FocusLoss = 'FOCUS_LOSS',
    FullscreenExit = 'FULLSCREEN_EXIT',
    CopyPaste = 'COPY_PASTE',
    RightClick = 'RIGHT_CLICK'
}

export interface Violation {
    id?: number;
    studentId: string;
    studentName: string;
    paperId: string;
    violationType: ViolationType;
    details: string;
    timestamp?: string;
}

export interface Paper {
    id: string;
    title: string;
    examTitle: string;
    topic: string;
    difficulty: Difficulty;
    questions: Question[];
    teacherId: string;
    accessCode?: string;
    warningLimit?: number;
    startTime?: string;
    endTime?: string;
}

export interface Test {
    id: string;
    paper: Paper;
    studentName: string;
    studentId: string;
    answers: (number | null | string)[]; // For MCQ (indices) or Coding/Descriptive (text)
    score: number;
    submittedAt: Date;
    aiEvaluations?: any; // Changed to any for easier transition between string (backend) and object (frontend)
    status?: 'IN_PROGRESS' | 'COMPLETED';
}

export interface ChatMessage {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    isLoading?: boolean;
}
