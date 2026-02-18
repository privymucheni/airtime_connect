'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    MessageCircle,
    X,
    Send,
    RotateCcw,
    ChevronRight,
    Bot,
    User
} from 'lucide-react';
import { getChatQuestions } from '@/actions/chatbot';

interface ChatQuestion {
    id: string;
    question: string;
    answer: string | null;
    parentId: string | null;
    _count?: {
        subQuestions: number;
    };
}

interface Message {
    id: string;
    type: 'bot' | 'user';
    text: string;
    options?: ChatQuestion[];
}

export const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const initChat = async () => {
        setIsLoading(true);
        setMessages([]);
        try {
            const initialQuestions = await getChatQuestions(null) as ChatQuestion[];
            setMessages([
                {
                    id: 'welcome',
                    type: 'bot',
                    text: "Hello! How can I help you today? Please select an option below:",
                    options: initialQuestions
                }
            ]);
        } catch (error) {
            console.error("Failed to init chat:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            initChat();
        }
    }, [isOpen]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleOptionSelect = async (question: ChatQuestion) => {
        if (isLoading) return;

        // Add user message without clearing options yet
        const userMsgId = Date.now().toString();
        setMessages(prev => [
            ...prev,
            { id: userMsgId, type: 'user', text: question.question }
        ]);

        setIsLoading(true);

        try {
            const subQuestions = await getChatQuestions(question.id) as ChatQuestion[];

            // Delay for "thinking" effect
            await new Promise(resolve => setTimeout(resolve, 800));

            setMessages(prev => [
                ...prev.map(m => ({ ...m, options: undefined })), // Clear options ONLY when bot replies
                {
                    id: (Date.now() + 1).toString(),
                    type: 'bot',
                    text: question.answer || "Please choose one of the following:",
                    options: subQuestions.length > 0 ? subQuestions : []
                }
            ]);
        } catch (error) {
            console.error("Error fetching sub-questions:", error);
            setMessages(prev => [
                ...prev,
                {
                    id: 'error',
                    type: 'bot',
                    text: "I'm having trouble retrieving the next set of options. Please try again."
                }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        initChat();
    };

    return (
        <>
            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-8 right-8 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 z-[99] ${isOpen ? 'bg-gray-900 text-white rotate-90' : 'bg-indigo-600 text-white'
                    }`}
            >
                {isOpen ? <X className="w-8 h-8" /> : <MessageCircle className="w-8 h-8" />}
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-28 right-8 w-[400px] h-[600px] bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 flex flex-col overflow-hidden z-[99] animate-in slide-in-from-bottom-8 fade-in duration-300">
                    {/* Header */}
                    <div className="p-6 bg-indigo-600 text-white flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                                <Bot className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-black text-lg leading-tight">Support Bot</h3>
                                <div className="flex items-center space-x-1.5">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Always Online</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleReset}
                            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                            title="Reset Conversation"
                        >
                            <RotateCcw className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50"
                    >
                        {messages.map((m) => (
                            <div key={m.id} className={`flex flex-col ${m.type === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`flex items-end space-x-2 ${m.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${m.type === 'bot' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-600'
                                        }`}>
                                        {m.type === 'bot' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                    </div>
                                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-bold shadow-sm ${m.type === 'bot'
                                        ? 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                                        : 'bg-indigo-600 text-white rounded-br-none'
                                        }`}>
                                        {m.text}
                                    </div>
                                </div>

                                {/* Vertical Lines for context if bot */}
                                {m.type === 'bot' && m.options && m.options.length > 0 && (
                                    <div className="w-full mt-4 space-y-2 pl-10">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Select an option:</p>
                                        {m.options.map((opt) => (
                                            <button
                                                key={opt.id}
                                                onClick={() => handleOptionSelect(opt)}
                                                className="w-full text-left p-3.5 bg-white border border-gray-100 rounded-xl hover:border-indigo-600 hover:text-indigo-600 transition-all font-bold text-sm flex items-center justify-between group shadow-sm active:scale-95"
                                            >
                                                <span>{opt.question}</span>
                                                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-600 transition-colors" />
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Empty State / End of path */}
                                {m.type === 'bot' && (!m.options || m.options.length === 0) && !isLoading && m.id !== 'welcome' && (
                                    <div className="w-full mt-4 pl-10">
                                        <button
                                            onClick={handleReset}
                                            className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline flex items-center gap-1"
                                        >
                                            <RotateCcw className="w-3 h-3" />
                                            Ask something else
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex items-center space-x-2 pl-10">
                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-white border-t border-gray-100">
                        <div className="p-2 bg-gray-50 rounded-2xl flex items-center">
                            <input
                                type="text"
                                disabled
                                placeholder="Select an option above..."
                                className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-sm font-bold text-gray-400"
                            />
                            <button disabled className="p-2 text-gray-300">
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
