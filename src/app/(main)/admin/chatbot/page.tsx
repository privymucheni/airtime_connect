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
  Edit2,
  HelpCircle
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
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-16">
      {/* Top Bar with Breadcrumbs & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
            <span>Admin</span>
            <span>/</span>
            <span className="text-indigo-600">Chatbot Settings</span>
          </nav>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Chatbot Management</h1>
          <p className="text-xs font-medium text-slate-500 mt-0.5">Configure your automated guided response system.</p>
        </div>

        <button
          onClick={() => {
            setIsEditing(false);
            setCurrentQuestion({ question: '', answer: '' });
            setIsModalOpen(true);
          }}
          className="flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold text-xs shadow-md shadow-indigo-600/10 hover:shadow-lg hover:shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Question</span>
        </button>
      </div>

      {/* Directory Stack & Questions list */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        {/* Navigation stack trace panel */}
        <div className="p-6 border-b border-slate-50 bg-slate-50/20 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            {navigationStack.length > 0 && (
              <button
                onClick={handleLevelUp}
                className="p-2 bg-white rounded-xl border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95 cursor-pointer"
                title="Back to Parent Level"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <div className="flex items-center text-[10px] font-bold uppercase tracking-wider">
              <span className={`px-2.5 py-1 rounded-md border ${navigationStack.length === 0 ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>Root</span>
              {navigationStack.map((nav, index) => (
                <React.Fragment key={nav.id}>
                  <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-slate-300" />
                  <span className={`px-2.5 py-1 rounded-md border truncate max-w-xs ${index === navigationStack.length - 1 ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
                    {nav.question}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* List content */}
        {isLoading && questions.length === 0 ? (
          <div className="p-20 text-center animate-in fade-in duration-300">
            <div className="relative flex items-center justify-center mx-auto w-10 h-10 mb-4">
              <div className="w-10 h-10 border-2 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Loading Knowledge Base...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center mb-4 text-slate-400 shadow-sm">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="text-xs font-semibold text-slate-900">No Questions Defined</h3>
            <p className="text-[10px] text-slate-400 mt-1 max-w-sm mx-auto">Start building your automated support by adding your first question.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {questions.map((q) => (
              <div key={q.id} className="group hover:bg-slate-50/40 transition-all p-5 flex items-center justify-between gap-6">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-950">{q.question}</h4>
                  </div>

                  {q.answer && (
                    <div className="ml-11 p-3.5 bg-slate-50 rounded-xl border border-slate-100 italic text-xs text-slate-500">
                      "{q.answer}"
                    </div>
                  )}

                  <div className="ml-11 flex items-center gap-3">
                    {q._count && q._count.subQuestions > 0 && (
                      <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100/30 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        {q._count.subQuestions} Sub-questions
                      </span>
                    )}
                    {q.answer && (
                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100/30 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        Has Answer
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleLevelDown(q)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-700 hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    <span>Sub-questions</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => openEditModal(q)}
                    className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:border-amber-500 hover:text-amber-500 transition-all shadow-sm active:scale-95 cursor-pointer"
                    title="Edit Question"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:border-red-500 hover:text-red-500 transition-all shadow-sm active:scale-95 cursor-pointer"
                    title="Delete Question"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Redesign */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl overflow-hidden border border-slate-100 animate-in slide-in-from-bottom-8 duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {isEditing ? 'Edit Chatbot Response' : 'Add Chatbot Question'}
                </h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  {currentParentId ? 'Adding Sub-question' : 'Adding Root Level Question'}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-slate-150 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Question Text</label>
                <input
                  type="text"
                  placeholder="e.g., How do I top up my wallet?"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-transparent focus:border-indigo-500 focus:bg-white rounded-xl outline-none transition-all text-xs font-semibold text-slate-800 placeholder:text-slate-350"
                  value={currentQuestion.question}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Automated Answer (Optional)</label>
                <textarea
                  rows={4}
                  placeholder="Provide the answer the bot should give..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-transparent focus:border-indigo-500 focus:bg-white rounded-xl outline-none transition-all text-xs font-semibold text-slate-800 placeholder:text-slate-350 resize-none"
                  value={currentQuestion.answer || ''}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, answer: e.target.value })}
                />
                <p className="text-[9px] text-slate-400 italic">If this question leads to sub-questions, you can leave the answer blank or provide a transition message.</p>
              </div>
            </div>

            <div className="p-6 bg-slate-55 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddOrUpdate}
                disabled={!currentQuestion.question || isLoading}
                className="flex items-center space-x-2 px-5 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold text-xs shadow-md shadow-indigo-600/10 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
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
