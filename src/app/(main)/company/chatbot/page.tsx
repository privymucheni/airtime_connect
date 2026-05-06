'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    Send,
    RotateCcw,
    ChevronRight,
    Bot,
    User,
    MessageCircle
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

export default function CompanyChatbotPage() {
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
        initChat();
    }, []);

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
        <div className="flex flex-col h-[calc(100vh-8rem)] animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                        <MessageCircle className="w-8 h-8 text-indigo-600" />
                        Support Chatbot
                    </h2>
                    <p className="text-gray-500 font-medium text-lg mt-1">
                        Find quick answers to common questions and issues.
                    </p>
                </div>
            </div>

            <div className="flex-1 bg-white rounded-3xl shadow-xl border border-gray-100 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-6 bg-indigo-600 text-white flex items-center justify-between shadow-md z-10">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                            <Bot className="w-7 h-7" />
                        </div>
                        <div>
                            <h3 className="font-black text-xl leading-tight">Support Assistant</h3>
                            <div className="flex items-center space-x-2 mt-1">
                                <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.6)]"></span>
                                <span className="text-xs font-bold uppercase tracking-widest opacity-90">Always Online</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleReset}
                        className="p-3 hover:bg-white/10 rounded-xl transition-colors flex items-center gap-2"
                        title="Reset Conversation"
                    >
                        <RotateCcw className="w-5 h-5" />
                        <span className="font-bold text-sm hidden sm:block">Restart Chat</span>
                    </button>
                </div>

                {/* Messages Area */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 bg-gray-50/50"
                >
                    {messages.map((m) => (
                        <div key={m.id} className={`flex flex-col ${m.type === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className={`flex items-end space-x-3 ${m.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${m.type === 'bot' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-600'
                                    }`}>
                                    {m.type === 'bot' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                                </div>
                                <div className={`max-w-[85%] md:max-w-[70%] p-5 rounded-3xl text-xl font-medium shadow-sm ${m.type === 'bot'
                                    ? 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                                    : 'bg-indigo-600 text-white rounded-br-none shadow-indigo-200'
                                    }`}>
                                    {m.text}
                                </div>
                            </div>

                            {/* Vertical Lines for context if bot */}
                            {m.type === 'bot' && m.options && m.options.length > 0 && (
                                <div className="w-full mt-5 space-y-3 pl-14 pr-4 md:pr-20">
                                    <p className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Select an option below:</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {m.options.map((opt) => (
                                            <button
                                                key={opt.id}
                                                onClick={() => handleOptionSelect(opt)}
                                                className="w-full text-left p-5 bg-white border border-gray-200 rounded-2xl hover:border-indigo-600 hover:text-indigo-600 hover:shadow-md transition-all font-bold text-lg flex items-center justify-between group shadow-sm active:scale-95"
                                            >
                                                <span>{opt.question}</span>
                                                <ChevronRight className="w-6 h-6 text-gray-300 group-hover:text-indigo-600 transition-colors flex-shrink-0 ml-2" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Empty State / End of path */}
                            {m.type === 'bot' && (!m.options || m.options.length === 0) && !isLoading && m.id !== 'welcome' && (
                                <div className="w-full mt-5 pl-14">
                                    <button
                                        onClick={handleReset}
                                        className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-800 hover:underline flex items-center gap-1.5 transition-colors"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        Ask something else
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex items-center space-x-2 pl-14">
                            <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce"></div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-white border-t border-gray-100 z-10">
                    <div className="p-2 bg-gray-50 rounded-2xl flex items-center border border-gray-100 focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-50 transition-all">
                        <input
                            type="text"
                            disabled
                            placeholder="Select an option from the chat above to proceed..."
                            className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-sm font-bold text-gray-400"
                        />
                        <button disabled className="p-3 text-gray-300 bg-gray-100 rounded-xl">
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
