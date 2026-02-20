import React, { useState, useRef, useContext } from 'react';
import Editor from '@monaco-editor/react';
import Terminal from './Terminal';
import { Play, Square, Trash2, Globe, Cpu } from 'lucide-react';
import { AppContext } from '../contexts/AppContext';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

interface IDEContainerProps {
    initialCode?: string;
    language?: string;
}

const IDEContainer: React.FC<IDEContainerProps> = ({
    initialCode: providedInitialCode,
    language: initialLanguage = 'PYTHON'
}) => {
    const [language, setLanguage] = useState(initialLanguage);

    const getTemplate = (lang: string) => {
        switch (lang.toUpperCase()) {
            case 'JAVA':
                return 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        System.out.println("Enter your name:");\n        String name = sc.next();\n        System.out.println("Hello, " + name + "!");\n    }\n}';
            case 'PYTHON':
            default:
                return 'name = input("Enter your name: ")\nprint(f"Hello, {name}!")';
        }
    };

    const [code, setCode] = useState(providedInitialCode || getTemplate(initialLanguage));
    const [isRunning, setIsRunning] = useState(false);
    const [terminalKey, setTerminalKey] = useState(0);
    const { currentUser } = useContext(AppContext);
    const studentId = currentUser?.id || 'anonymous';
    const terminalStompClient = useRef<Stomp.Client | null>(null);

    const handleRunCode = () => {
        if (isRunning) return;

        if (!terminalStompClient.current || !terminalStompClient.current.connected) {
            alert('Terminal is still connecting. Please wait a moment.');
            return;
        }

        setIsRunning(true);

        terminalStompClient.current.send(`/app/start/${studentId}`, {}, JSON.stringify({
            code: code,
            language: language
        }));
    };

    const handleStopCode = () => {
        if (!isRunning) return;

        if (terminalStompClient.current && terminalStompClient.current.connected) {
            terminalStompClient.current.send(`/app/stop/${studentId}`, {}, {});
        }
        setIsRunning(false);
    };

    const handleClearTerminal = () => {
        setTerminalKey(prev => prev + 1);
        terminalStompClient.current = null; // Will be reset by onReady after remount
        setIsRunning(false);
    };

    const handleTerminalReady = (client: Stomp.Client) => {
        terminalStompClient.current = client;
    };

    const handleProcessExit = () => {
        setIsRunning(false);
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#0a0a0f] overflow-hidden rounded-xl border border-white/10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-6 py-3 bg-[#16161e] border-b border-white/5">
                <div className="flex items-center space-x-3">
                    <div className="p-1.5 bg-blue-500/10 rounded-lg">
                        <Cpu size={18} className="text-blue-400" />
                    </div>
                    <select
                        value={language}
                        onChange={(e) => {
                            const newLang = e.target.value;
                            setLanguage(newLang);
                            if (!providedInitialCode) {
                                setCode(getTemplate(newLang));
                            }
                        }}
                        disabled={isRunning}
                        className="bg-transparent text-sm font-bold text-gray-300 tracking-tight uppercase border-none focus:ring-0 cursor-pointer hover:text-white transition-colors"
                    >
                        <option value="JAVA" className="bg-[#16161e]">JAVA</option>
                        <option value="PYTHON" className="bg-[#16161e]">PYTHON</option>
                    </select>
                </div>
                <div className="flex items-center space-x-3">
                    {!isRunning ? (
                        <button
                            onClick={handleRunCode}
                            disabled={!terminalStompClient.current}
                            className="flex items-center space-x-2 px-6 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white rounded-lg text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                        >
                            <Play size={16} fill="currentColor" />
                            <span>Run Code</span>
                        </button>
                    ) : (
                        <button
                            onClick={handleStopCode}
                            className="flex items-center space-x-2 px-6 py-2 bg-rose-500 hover:bg-rose-400 text-white rounded-lg text-sm font-bold shadow-lg shadow-rose-500/20 transition-all active:scale-95"
                        >
                            <Square size={16} fill="currentColor" />
                            <span>Stop</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Editor Section */}
                <div className="flex-1 relative">
                    <Editor
                        height="100%"
                        defaultLanguage={language.toLowerCase()}
                        theme="vs-dark"
                        value={code}
                        onChange={(value) => setCode(value || '')}
                        options={{
                            fontSize: 14,
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            padding: { top: 20, bottom: 20 },
                            fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
                            lineNumbers: 'on',
                            renderLineHighlight: 'all',
                            cursorSmoothCaretAnimation: 'on',
                            smoothScrolling: true,
                        }}
                    />
                </div>

                {/* Terminal Section */}
                <div className="h-72 flex flex-col bg-[#0d0e14] border-t border-white/5">
                    <div className="flex items-center justify-between px-6 py-2 bg-[#1a1b26]/50 border-b border-white/5">
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-blue-400/50"></div>
                            <span className="text-[11px] font-bold text-gray-400 tracking-widest uppercase">INTERACTIVE TERMINAL</span>
                        </div>
                        <button
                            onClick={handleClearTerminal}
                            className="flex items-center space-x-1.5 text-gray-500 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/5"
                        >
                            <Trash2 size={14} />
                            <span className="text-[10px] font-bold">Clear</span>
                        </button>
                    </div>
                    <div className="flex-1 overflow-hidden p-2">
                        <Terminal
                            key={terminalKey}
                            studentId={studentId}
                            onReady={handleTerminalReady}
                            onProcessExit={handleProcessExit}
                        />
                    </div>
                </div>
            </div>

            {/* Footer / Status Bar */}
            <div className="flex items-center justify-between px-6 py-2 bg-[#16161e] border-t border-white/5 text-[11px] font-medium text-gray-500">
                <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-500 animate-pulse ring-4 ring-emerald-500/20' : 'bg-gray-600'}`}></div>
                        <span className={isRunning ? 'text-emerald-400' : ''}>{isRunning ? 'Running' : 'Connected'}</span>
                    </div>
                    <div className="flex items-center space-x-4 opacity-75">
                        <span>Ln 1, Col 1</span>
                        <span>Spaces: 4</span>
                        <span>UTF-8</span>
                    </div>
                </div>
                <div className="flex items-center">
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold tracking-wider">{language.toUpperCase()}</span>
                </div>
            </div>
        </div>
    );
};

export default IDEContainer;
