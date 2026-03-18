import React, { useState, useEffect, useRef } from 'react';
import { Violation, Paper } from '../../types';
import Stomp from 'stompjs';
import SockJS from 'sockjs-client';
import { Shield, AlertTriangle, User, Clock, Search, X } from 'lucide-react';

interface LiveMonitorProps {
    paper: Paper;
    onClose: () => void;
}

const LiveMonitor: React.FC<LiveMonitorProps> = ({ paper, onClose }) => {
    const [violations, setViolations] = useState<Violation[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const stompClient = useRef<Stomp.Client | null>(null);
    const connectionRef = useRef<boolean>(false);

    useEffect(() => {
        let isMounted = true;
        let socket: WebSocket | any = null;

        // Fetch existing violations first
        fetch(`http://127.0.0.1:8087/api/violations/paper/${paper.id}`)
            .then(res => res.json())
            .then(data => {
                if (isMounted) setViolations(data);
            })
            .catch(err => console.error("Error fetching violations:", err));

        const connect = () => {
            // Using 127.0.0.1 instead of localhost can avoid some IPv6 resolution issues
            socket = new SockJS('http://127.0.0.1:8087/ws-terminal');
            const client = Stomp.over(socket);

            // Enable debugging
            client.debug = (str) => { console.log('STOMP: ' + str); };

            // Disable heartbeats to avoid timeouts on localhost
            client.heartbeat.outgoing = 0;
            client.heartbeat.incoming = 0;

            stompClient.current = client;

            client.connect({},
                (frame) => {
                    console.log('STOMP Connected: ' + frame);
                    if (!isMounted) {
                        try { client.disconnect(() => { }); } catch (e) { }
                        return;
                    }
                    setIsConnected(true);

                    // Subscribe to paper-specific topic
                    client.subscribe(`/topic/proctoring/${paper.id}`, (message) => {
                        if (isMounted) {
                            const newViolation: Violation = JSON.parse(message.body);
                            setViolations(prev => [newViolation, ...prev]);

                            // Visual/Audio Feedback
                            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                            audio.volume = 0.2;
                            audio.play().catch(() => { });
                        }
                    });
                },
                (error) => {
                    console.error("STOMP error:", error);
                    if (isMounted) {
                        setIsConnected(false);
                        // Optional: Retry after delay
                        setTimeout(() => {
                            if (isMounted) connect();
                        }, 5000);
                    }
                }
            );
        };

        connect();

        return () => {
            isMounted = false;
            setIsConnected(false);
            if (stompClient.current) {
                try {
                    // Only try to disconnect if it thinks it's connected
                    if (stompClient.current.connected) {
                        stompClient.current.disconnect(() => { });
                    }
                } catch (e) { }
            }
            // Always try to close the underlying socket to be sure
            if (socket) {
                try { socket.close(); } catch (e) { }
            }
        };
    }, [paper.id]);

    const getViolationStyle = (type: string) => {
        switch (type) {
            case 'TAB_SWITCH': return 'bg-rose-500/20 border-rose-500/50 text-rose-400';
            case 'FULLSCREEN_EXIT': return 'bg-amber-500/20 border-amber-500/50 text-amber-400';
            default: return 'bg-blue-500/20 border-blue-500/50 text-blue-400';
        }
    };

    return (
        <div className="fixed inset-0 z-[110] bg-[#0C1B2A] flex flex-col animate-fade-in">
            {/* Header */}
            <header className="h-16 border-b border-white/5 bg-[#0a1520] px-6 flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-4">
                    <div className="bg-brand-primary/10 p-2 rounded-lg">
                        <Shield className="text-brand-primary" size={24} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-brand-text">Live Monitor: {paper.title}</h2>
                        <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                            <span className="text-[10px] text-brand-text/50 uppercase tracking-widest font-bold">
                                {isConnected ? 'Live Connection Active' : 'Connecting to Proctor Server...'}
                            </span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/5 rounded-full text-brand-text/50 hover:text-brand-text transition-colors"
                >
                    <X size={20} />
                </button>
            </header>

            {/* Content Split */}
            <main className="flex-1 flex overflow-hidden">
                {/* Main Alert Feed */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-brand-text/40">Real-time Violation Feed</h3>
                            <span className="text-xs bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full font-bold">
                                Total Alerts: {violations.length}
                            </span>
                        </div>

                        {violations.length === 0 ? (
                            <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl">
                                <div className="bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Shield className="text-brand-text/20" size={32} />
                                </div>
                                <p className="text-brand-text/40 font-medium">No violations detected yet. High integrity session.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {violations.map((v, i) => (
                                    <div key={v.id || i} className="bg-brand-card border border-white/5 rounded-2xl p-5 flex items-start space-x-4 animate-reveal group hover:border-brand-primary/30 transition-all">
                                        <div className={`p-3 rounded-xl shrink-0 ${getViolationStyle(v.violationType)}`}>
                                            <AlertTriangle size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="font-bold text-brand-text flex items-center">
                                                    <User size={14} className="mr-2 text-brand-primary" />
                                                    {v.studentName}
                                                </h4>
                                                <span className="text-[10px] text-brand-text/30 font-mono">
                                                    <Clock size={10} className="inline mr-1" />
                                                    {v.timestamp ? new Date(v.timestamp).toLocaleTimeString() : 'Just now'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-brand-text/70 mb-2">{v.details}</p>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${getViolationStyle(v.violationType)}`}>
                                                {v.violationType.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Stats */}
                <aside className="w-80 border-l border-white/5 bg-brand-bg/20 p-6 hidden lg:block">
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary mb-6">Session Insights</h3>

                    <div className="space-y-6">
                        <div className="bg-brand-card p-4 rounded-2xl border border-white/5">
                            <p className="text-[10px] text-brand-text/40 uppercase font-bold mb-1">Students Flagged</p>
                            <p className="text-2xl font-bold text-brand-text">
                                {new Set(violations.map(v => v.studentId)).size}
                            </p>
                        </div>

                        <div className="space-y-3">
                            <p className="text-[10px] text-brand-text/40 uppercase font-bold px-1">Common Issues</p>
                            {['TAB_SWITCH', 'FOCUS_LOSS', 'FULLSCREEN_EXIT'].map(type => {
                                const count = violations.filter(v => v.violationType === type).length;
                                const percentage = violations.length > 0 ? (count / violations.length) * 100 : 0;
                                return (
                                    <div key={type} className="bg-white/5 p-3 rounded-xl transition-all hover:bg-white/10">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[10px] font-bold text-brand-text/60 italic capitalize">{type.toLowerCase().replace('_', ' ')}</span>
                                            <span className="text-[10px] font-bold text-brand-text">{count}</span>
                                        </div>
                                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-brand-primary" style={{ width: `${percentage}%` }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </aside>
            </main>
        </div>
    );
};

export default LiveMonitor;
