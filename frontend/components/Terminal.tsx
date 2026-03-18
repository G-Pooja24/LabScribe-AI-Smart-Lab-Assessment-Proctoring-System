import React, { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

interface TerminalProps {
    studentId: string;
    onProcessExit?: () => void;
    onReady?: (stompClient: Stomp.Client) => void;
    theme?: 'light' | 'dark';
}

const Terminal: React.FC<TerminalProps> = ({ studentId, onProcessExit, onReady, theme = 'dark' }) => {
    const terminalRef = useRef<HTMLDivElement>(null);
    const xtermRef = useRef<XTerm | null>(null);
    const stompClientRef = useRef<Stomp.Client | null>(null);

    useEffect(() => {
        if (!terminalRef.current) return;

        const isLight = theme === 'light';

        const term = new XTerm({
            cursorBlink: true,
            theme: {
                background: isLight ? '#ffffff' : '#0C1B2A', // Precise Brand Navy Dark
                foreground: isLight ? '#333333' : '#E0FBFC', // Brand Text
                cursor: isLight ? '#333333' : '#00B4D8', // Brand Primary
                selectionBackground: isLight ? '#e5e7eb' : 'rgba(0, 180, 216, 0.4)',
                black: isLight ? '#000000' : '#040b12',
                red: '#f7768e',
                green: '#9ece6a',
                yellow: '#e0af68',
                blue: '#00B4D8', // Brand Primary
                magenta: '#bb9af7',
                cyan: '#5CE1E6', // Brand Secondary
                white: isLight ? '#ffffff' : '#E0FBFC',
            },
            fontFamily: 'JetBrains Mono, Menlo, Monaco, Courier New, monospace',
            fontSize: 14,
            lineHeight: 1.2,
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        term.open(terminalRef.current);

        // Robust sizing with ResizeObserver
        const resizeObserver = new ResizeObserver(() => {
            if (terminalRef.current && terminalRef.current.offsetHeight > 0) {
                try {
                    fitAddon.fit();
                } catch (e) {
                    // Ignore silent fit errors when dimensions are tricky
                }
            }
        });
        resizeObserver.observe(terminalRef.current);

        xtermRef.current = term;

        term.writeln('\u001b[34mSmartProctor Interactive Terminal\u001b[0m');
        term.writeln('Ready to execute. Write code and click "Run Code".');
        term.writeln('');

        // WebSocket Setup
        const socket = new SockJS('http://localhost:8087/ws-terminal');
        const stompClient = Stomp.over(socket);
        stompClient.debug = () => { }; // Disable debug logs

        stompClient.connect({}, () => {
            stompClientRef.current = stompClient;
            if (onReady) onReady(stompClient);

            stompClient.subscribe(`/topic/terminal/${studentId}`, (message) => {

                try {
                    const data = JSON.parse(message.body);
                    if (data.type === 'output') {
                        term.write(data.content);
                    } else if (data.type === 'status') {
                        if (data.content) term.write(data.content);
                        if (onProcessExit) onProcessExit();
                    }
                } catch (e) {
                    term.write(message.body);
                }
            });
        }, (error) => {
            console.error('WebSocket connecting error', error);
            term.writeln('\r\n\u001b[31m[Connection Error: Backend server unreachable]\u001b[0m');
        });

        // Handle Terminal Input
        term.onData((data) => {
            if (stompClientRef.current && stompClientRef.current.connected) {
                stompClientRef.current.send(`/app/input/${studentId}`, {}, data);

            }
        });

        const handleResize = () => {
            if (terminalRef.current && terminalRef.current.offsetHeight > 0) {
                try {
                    fitAddon.fit();
                } catch (e) { }
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            resizeObserver.disconnect();
            if (stompClientRef.current) {
                stompClientRef.current.disconnect(() => { });
            }
            term.dispose();
        };
    }, [studentId, theme]);

    return (
        <div className={`w-full h-full transition-colors duration-300 ${theme === 'light' ? 'bg-white' : 'bg-[#0C1B2A]'} overflow-hidden`}>
            <div ref={terminalRef} className="w-full h-full" />
        </div>
    );
};

export default Terminal;
