'use client';

import React, { useState, useEffect } from 'react';
import {
    Plus,
    Trash2,
    ChevronRight,
    MessageSquare,
    ChevronLeft,
    Save,
    X,
    Edit2
} from 'lucide-react';
import {
    getChatQuestions,
    addChatQuestion,
    updateChatQuestion,
    deleteChatQuestion
} from '@/actions/chatbot';

interface ChatQuestion {
    id: string;
    question: string;
    answer: string | null;
    parentId: string | null;
    _count?: {
        subQuestions: number;
    };
}

const ChatBotManagement = () => {
    const [questions, setQuestions] = useState<ChatQuestion[]>([]);
    const [navigationStack, setNavigationStack] = useState<{ id: string, question: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState<Partial<ChatQuestion>>({
        question: '',
        answer: '',
    });

    const currentParentId = navigationStack.length > 0 ? navigationStack[navigationStack.length - 1].id : null;

    const fetchQuestions = async () => {
        setIsLoading(true);
        try {
            const data = await getChatQuestions(currentParentId) as ChatQuestion[];
            setQuestions(data);
        } catch (error) {
            console.error("Failed to fetch questions:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, [currentParentId]);

    const handleLevelDown = (question: ChatQuestion) => {
        setNavigationStack([...navigationStack, { id: question.id, question: question.question }]);
    };

    const handleLevelUp = () => {
        setNavigationStack(navigationStack.slice(0, -1));
    };

    const handleAddOrUpdate = async () => {
        if (!currentQuestion.question) return;

        setIsLoading(true);
        try {
            if (isEditing && currentQuestion.id) {
                await updateChatQuestion(currentQuestion.id, {
                    question: currentQuestion.question,
                    answer: currentQuestion.answer || undefined,
                });
            } else {
                await addChatQuestion({
                    question: currentQuestion.question,
                    answer: currentQuestion.answer || undefined,
                    parentId: currentParentId,
                });
            }
            setIsModalOpen(false);
            setIsEditing(false);
            setCurrentQuestion({ question: '', answer: '' });
            fetchQuestions();
        } catch (error) {
            console.error("Failed to save question:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this question and all its sub-questions?')) return;

        setIsLoading(true);
        try {
            await deleteChatQuestion(id);
            fetchQuestions();
        } catch (error) {
            console.error("Failed to delete question:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const openEditModal = (question: ChatQuestion) => {
        setCurrentQuestion(question);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Chatbot Management</h2>
                    <p className="text-gray-500 font-medium text-lg">Configure your automated guided response system.</p>
                </div>

                <button
                    onClick={() => {
                        setIsEditing(false);
                        setCurrentQuestion({ question: '', answer: '' });
                        setIsModalOpen(true);
                    }}
                    className="flex items-center space-x-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 font-black shadow-xl transition-all transform hover:-translate-y-1 active:scale-95 text-lg"
                >
                    <Plus className="w-6 h-6 stroke-[3px]" />
                    <span>Add New Question</span>
                </button>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                    <div className="flex items-center space-x-4">
                        {navigationStack.length > 0 && (
                            <button
                                onClick={handleLevelUp}
                                className="p-2 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                <ChevronLeft className="w-5 h-5 text-gray-600" />
                            </button>
                        )}
                        <div className="flex items-center text-sm font-bold">
                            <span className={`text-gray-400 ${navigationStack.length === 0 ? 'text-indigo-600' : ''}`}>Root</span>
                            {navigationStack.map((nav, index) => (
                                <React.Fragment key={nav.id}>
                                    <ChevronRight className="w-4 h-4 mx-2 text-gray-300" />
                                    <span className={index === navigationStack.length - 1 ? 'text-indigo-600' : 'text-gray-400'}>
                                        {nav.question}
                                    </span>
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>

                {isLoading && questions.length === 0 ? (
                    <div className="p-20 text-center">
                        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Loading Knowledge Base...</p>
                    </div>
                ) : questions.length === 0 ? (
                    <div className="p-20 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <MessageSquare className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-2">No Questions Defined</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">Start building your automated support by adding your first question.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {questions.map((q) => (
                            <div key={q.id} className="group hover:bg-gray-50/80 transition-all p-6">
                                <div className="flex items-start justify-between gap-6">
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                <MessageSquare className="w-5 h-5" />
                                            </div>
                                            <h4 className="text-xl font-black text-gray-900">{q.question}</h4>
                                        </div>

                                        {q.answer && (
                                            <div className="ml-13 p-4 bg-gray-50 rounded-2xl border border-gray-100 italic text-gray-600">
                                                "{q.answer}"
                                            </div>
                                        )}

                                        <div className="ml-13 flex items-center gap-4">
                                            {q._count && q._count.subQuestions > 0 && (
                                                <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg uppercase tracking-wider">
                                                    {q._count.subQuestions} Sub-questions
                                                </span>
                                            )}
                                            {q.answer && (
                                                <span className="text-xs font-black text-green-600 bg-green-50 px-3 py-1.5 rounded-lg uppercase tracking-wider">
                                                    Has Answer
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleLevelDown(q)}
                                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-black text-gray-700 hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm active:scale-95"
                                        >
                                            <span>Manage Sub-q's</span>
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => openEditModal(q)}
                                            className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:border-amber-500 hover:text-amber-500 transition-all shadow-sm"
                                        >
                                            <Edit2 className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(q.id)}
                                            className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:border-red-500 hover:text-red-500 transition-all shadow-sm"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900">
                                    {isEditing ? 'Edit Question' : 'Add New Question'}
                                </h3>
                                <p className="text-gray-500 font-bold uppercase tracking-[0.1em] text-[10px] mt-1">
                                    {currentParentId ? 'Adding Sub-question' : 'Adding Root Level Question'}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-black text-gray-900 uppercase tracking-widest px-1">Question Text</label>
                                <input
                                    type="text"
                                    placeholder="e.g., How do I top up my wallet?"
                                    className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all text-lg font-bold text-gray-900 placeholder:text-gray-300"
                                    value={currentQuestion.question}
                                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-black text-gray-900 uppercase tracking-widest px-1">Automated Answer (Optional)</label>
                                <textarea
                                    rows={4}
                                    placeholder="Provide the answer the bot should give..."
                                    className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all text-lg font-bold text-gray-900 placeholder:text-gray-300 resize-none"
                                    value={currentQuestion.answer || ''}
                                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, answer: e.target.value })}
                                />
                                <p className="text-[10px] text-gray-400 font-bold italic px-1">If this question leads to sub-questions, you can leave the answer blank or provide a transition message.</p>
                            </div>
                        </div>

                        <div className="p-8 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-4">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-8 py-4 text-gray-500 font-black hover:bg-gray-200 rounded-2xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddOrUpdate}
                                disabled={!currentQuestion.question || isLoading}
                                className="flex items-center space-x-3 px-10 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 font-black shadow-xl transition-all disabled:opacity-50 disabled:translate-y-0"
                            >
                                <Save className="w-5 h-5" />
                                <span>{isEditing ? 'Update Question' : 'Save Question'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatBotManagement;
