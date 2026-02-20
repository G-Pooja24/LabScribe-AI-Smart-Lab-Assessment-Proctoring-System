import React, { useState, useRef, useEffect, useContext } from 'react';
import { Role, ChatMessage } from '../../types';
import { getTeacherChatResponse, getStudentChatResponse } from '../../services/geminiService';
import { PlusIcon, HistoryIcon, XIcon } from './Icons';
import { AppContext } from '../../contexts/AppContext';

// New Components for Animations
const ThinkingOrb: React.FC = () => (
    <div className="flex items-center justify-center p-2">
        <div className="w-3 h-3 bg-current rounded-full animate-pulse [animation-delay:-0.3s]"></div>
        <div className="w-3 h-3 bg-current rounded-full animate-pulse [animation-delay:-0.15s] mx-1.5"></div>
        <div className="w-3 h-3 bg-current rounded-full animate-pulse"></div>
    </div>
);

const TypewriterText: React.FC<{ text: string, onComplete: () => void }> = ({ text, onComplete }) => {
    const [displayedText, setDisplayedText] = useState('');
  
    useEffect(() => {
        let i = 0;
        setDisplayedText(''); 
        const intervalId = setInterval(() => {
            if (i < text.length) {
                setDisplayedText(prev => prev + text.charAt(i));
                i++;
            } else {
                clearInterval(intervalId);
                onComplete();
            }
        }, 20); 
  
        return () => clearInterval(intervalId);
    }, [text, onComplete]);
  
    return <p className="whitespace-pre-wrap">{displayedText}</p>;
};


interface ChatbotProps {
    role: Role;
}

const Chatbot: React.FC<ChatbotProps> = ({ role }) => {
    const { 
        currentUser, chatHistories, setChatHistory, clearChatHistory, 
        initialChatMessage, chatArchives, loadArchivedChat
    } = useContext(AppContext);
    
    const userId = currentUser?.id;
    const messages = userId ? (chatHistories[userId] || [initialChatMessage]) : [initialChatMessage];
    const userArchives = userId ? chatArchives[userId] : [];
    
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
    const messageListRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (messageListRef.current) {
            messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        // Add a small delay to ensure the DOM has updated (especially with typewriter) before scrolling
        const timer = setTimeout(() => {
            scrollToBottom();
        }, 50);
        return () => clearTimeout(timer);
    }, [messages]);
    
    const handleSendMessage = async () => {
        if (!input.trim() || isLoading || !userId) return;

        const userMessage: ChatMessage = { id: Date.now().toString(), text: input, sender: 'user' };
        const newMessagesWithUser = [...messages, userMessage];
        setChatHistory(userId, newMessagesWithUser);
        
        setInput('');
        setIsLoading(true);

        const loadingMessage: ChatMessage = { id: 'loading', text: '', sender: 'ai', isLoading: true };
        setChatHistory(userId, [...newMessagesWithUser, loadingMessage]);

        try {
            const chatHistoryForApi = newMessagesWithUser.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            }));
            
            const aiResponseText = role === Role.Teacher
                ? await getTeacherChatResponse(chatHistoryForApi, input)
                : await getStudentChatResponse(chatHistoryForApi, input);

            const aiMessage: ChatMessage = { id: (Date.now() + 1).toString(), text: aiResponseText, sender: 'ai' };
            setChatHistory(userId, [...newMessagesWithUser, aiMessage]);
        } catch (error) {
            console.error(error);
            const errorMessage: ChatMessage = { id: (Date.now() + 1).toString(), text: 'Sorry, something went wrong.', sender: 'ai' };
            setChatHistory(userId, [...newMessagesWithUser, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewChat = () => {
        if (!isLoading && userId) {
            clearChatHistory(userId);
        }
    };

    const handleLoadChat = (index: number) => {
        if (userId) {
            loadArchivedChat(userId, index);
            setIsHistoryPanelOpen(false);
        }
    };

    return (
        <div className="relative flex flex-col h-[calc(100vh-13rem)] max-h-[700px]">
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
                <h3 className={`text-xl font-bold text-brand-text font-display`}>
                    {role === Role.Teacher ? 'AI Teaching Assistant' : 'AI Study Buddy'}
                </h3>
                <div className="flex items-center gap-2">
                     <button onClick={() => setIsHistoryPanelOpen(true)} className={`p-2 rounded-full text-brand-text/80 hover:bg-brand-primary/20`} title="Chat History" disabled={isLoading || !userId}>
                        <HistoryIcon className="w-5 h-5" />
                    </button>
                    <button onClick={handleNewChat} className={`p-2 rounded-full text-brand-text/80 hover:bg-brand-primary/20`} title="New Chat" disabled={isLoading || !userId}>
                        <PlusIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
            <div ref={messageListRef} className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl shadow-md ${msg.sender === 'user' ? 'bg-brand-primary text-brand-text' : msg.isLoading ? 'bg-brand-bg text-brand-secondary' : 'bg-brand-bg text-brand-text'}`}>
                            {msg.isLoading ? <ThinkingOrb /> : <TypewriterText text={msg.text} onComplete={scrollToBottom} />}
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-4 border-t border-white/10">
                <div className="flex items-center space-x-2">
                    <input
                        type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type your message..."
                        className={`flex-1 border rounded-full py-2 px-4 focus:outline-none focus:ring-2 border-brand-primary/30 bg-brand-bg text-brand-text focus:ring-brand-primary`}
                        disabled={isLoading || !userId}
                    />
                    <button onClick={handleSendMessage} disabled={isLoading || !userId} className={`rounded-full p-2 w-10 h-10 flex items-center justify-center transition-all duration-300 shadow-lg disabled:opacity-50 bg-brand-primary text-brand-text hover:bg-brand-secondary shadow-brand-primary/30`}>
                        <svg className="w-6 h-6 transform rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
                    </button>
                </div>
            </div>

            {/* History Panel */}
            <div className={`absolute inset-0 z-10 transition-opacity duration-300 ${isHistoryPanelOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                 <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsHistoryPanelOpen(false)}></div>
                 <div className={`absolute top-0 right-0 h-full w-full max-w-sm bg-brand-bg border-brand-primary/20 shadow-lg z-20 flex flex-col transform transition-transform duration-300 ease-in-out border-l ${isHistoryPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className={`p-4 border-b border-brand-primary/20 flex justify-between items-center`}>
                        <h4 className={`text-lg font-bold text-brand-text font-display`}>Chat History</h4>
                        <button onClick={() => setIsHistoryPanelOpen(false)} className={`p-2 rounded-full text-brand-text/80 hover:bg-brand-primary/20`} aria-label="Close history">
                            <XIcon className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {userArchives && userArchives.length > 0 ? (
                            userArchives.map((chat, index) => {
                                const firstUserMessage = chat.find(m => m.sender === 'user')?.text;
                                return (
                                    <div key={index} onClick={() => handleLoadChat(index)} className={`p-4 border-b border-brand-primary/20 hover:bg-brand-card cursor-pointer`}>
                                        <p className={`truncate font-medium text-brand-text`}>{firstUserMessage || "Empty Chat"}</p>
                                        <p className={`text-xs text-brand-text/80 mt-1`}>{chat.length - 1} messages</p>
                                    </div>
                                );
                            })
                        ) : (
                            <div className={`p-8 text-center text-brand-text/80`}><p>No past chats found.</p></div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chatbot;