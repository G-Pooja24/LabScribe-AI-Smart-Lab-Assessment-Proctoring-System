import React from 'react';
import Editor from '@monaco-editor/react';
import { CodeLanguage } from '../../types';

interface CodeEditorProps {
    language: CodeLanguage;
    value: string;
    onChange: (value: string | undefined) => void;
    theme?: 'light' | 'dark';
}

const CodeEditor: React.FC<CodeEditorProps> = ({ language, value, onChange, theme = 'dark' }) => {
    // Map internal language enum to monaco language strings
    const monacoLanguage = (language?.toLowerCase() === 'c') ? 'c' : (language?.toLowerCase() === 'python') ? 'python' : 'java';

    const handleEditorChange = (value: string | undefined) => {
        onChange(value);
    };

    return (
        <div className={`h-full w-full flex flex-col transition-colors duration-300 ${theme === 'light' ? 'bg-white' : 'bg-[#0a1520]'}`}>
            <Editor
                height="100%"
                language={monacoLanguage}
                theme={theme === 'light' ? 'vs' : 'vs-dark'}
                value={value}
                onChange={handleEditorChange}
                options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    padding: { top: 16, bottom: 16 },
                    fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
                    cursorSmoothCaretAnimation: "on",
                    lineNumbers: "on",
                    glyphMargin: false,
                    folding: true,
                }}
            />
        </div>
    );
};

export default CodeEditor;
