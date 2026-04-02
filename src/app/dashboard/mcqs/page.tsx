'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Save,
  Loader2,
} from 'lucide-react';
import { saveExamQuestions, getExamQuestions, deleteExamQuestion } from '../../actions/mcq';
import { useToast } from '@/components/ui/toast';
import { Modal } from '@/components/ui/modal';

interface Question {
  id: string | number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export default function MCQPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [qIdToDelete, setQIdToDelete] = useState<string | number | null>(null);

  const { toast } = useToast();

  // Load existing questions from DB on mount
  useEffect(() => {
    async function fetchQuestions() {
      const result = await getExamQuestions();
      if (result.success && result.questions.length > 0) {
        setQuestions(result.questions);
      } else {
        // No questions in DB yet — start fresh
        setQuestions([]);
      }
      setIsLoading(false);
    }
    fetchQuestions();
  }, []);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now(),
        question: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        explanation: '',
      },
    ]);
  };

  const confirmDelete = (id: string | number) => {
    setQIdToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const removeQuestion = async () => {
    if (qIdToDelete !== null) {
      // If it's a string, it's from the database
      if (typeof qIdToDelete === 'string') {
        setIsDeleting(true);
        const result = await deleteExamQuestion(qIdToDelete);
        setIsDeleting(false);

        if (!result.success) {
          toast(`Failed to delete: ${result.error}`, 'error');
          setIsDeleteModalOpen(false);
          setQIdToDelete(null);
          return;
        }
        toast('Question removed from database!', 'success');
      } else {
        toast('Draft question removed.', 'info');
      }

      setQuestions(prev => prev.filter(q => q.id !== qIdToDelete));
      setIsDeleteModalOpen(false);
      setQIdToDelete(null);
    }
  };

  const handleSave = async () => {
    // Validate questions only if there are any
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        toast(`Question ${i + 1} has no text!`, 'error');
        return;
      }
      if (q.options.some(opt => !opt.trim())) {
        toast(`Question ${i + 1} has empty options!`, 'error');
        return;
      }
      if (!q.correctAnswer) {
        toast(`Question ${i + 1} needs a Correct Answer!`, 'error');
        return;
      }
    }

    setIsSaving(true);
    // Pass empty array when all questions deleted — server action will wipe DB
    const result = await saveExamQuestions(questions);
    
    if (result.success) {
      // Refresh local state with correct DB IDs so we can delete them properly later
      const fetchResult = await getExamQuestions();
      if (fetchResult.success) {
        setQuestions(fetchResult.questions);
      }

      toast(
        questions.length === 0
          ? 'Questions Saved Successfully! 🚀'
          : 'Questions Saved Successfully! 🚀',
        'success'
      );
    } else {
      toast(`Save failed: ${result.error}`, 'error');
    }
    
    setIsSaving(false);
  };

  const updateQuestion = (id: string | number, field: keyof Question, value: string | string[]) => {
    setQuestions(questions.map(q => (q.id === id ? { ...q, [field]: value } : q)));
  };

  const updateOption = (qId: string | number, oIdx: number, val: string) => {
    setQuestions(
      questions.map(q => {
        if (q.id === qId) {
          const newOptions = [...q.options];
          newOptions[oIdx] = val;
          return { ...q, options: newOptions };
        }
        return q;
      })
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="p-10 max-w-5xl mx-auto space-y-12 relative">
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
            <Trash2 className="w-8 h-8 text-rose-400" />
            <p className="text-sm font-bold text-rose-100">
              Are you sure you want to remove this question? This action cannot be undone once
              saved.
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white font-black uppercase tracking-widest rounded-2xl transition-all"
            >
              Cancel
            </button>
            <button
              onClick={removeQuestion}
              disabled={isDeleting}
              className="flex-1 py-4 bg-rose-500 hover:bg-rose-400 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-rose-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {isDeleting ? 'Deleting...' : 'Yes, Delete'}
            </button>
          </div>
        </div>
      </Modal>

      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-white flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Plus className="w-8 h-8 text-emerald-400" />
            </div>
            Create MCQ Exam
          </h1>
          <p className="mt-2 text-slate-400 font-medium ml-1">
            Add multiple choice questions for your bot to use.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-emerald-500/20 transform hover:scale-[1.05] active:scale-95 transition-all disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {isSaving ? 'Saving...' : 'Save All Questions'}
        </button>
      </header>

      <div className="space-y-8 pb-20">
        {questions.map((q, index) => (
          <div
            key={q.id}
            className="group relative bg-[#1E293B]/50 border border-white/5 rounded-3xl p-8 hover:bg-[#1E293B] hover:border-white/10 transition-all shadow-2xl transform hover:scale-[1.01]"
          >
            <div className="absolute -left-4 top-8 flex items-center justify-center w-10 h-10 bg-slate-800 border border-white/5 rounded-2xl font-black text-white shadow-xl group-hover:scale-110 transition-transform">
              {index + 1}
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">
                  Question Text
                </label>
                <textarea
                  value={q.question}
                  onChange={e => updateQuestion(q.id, 'question', e.target.value)}
                  className="w-full bg-slate-900 border border-white/5 rounded-2xl p-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 min-h-[100px] text-lg font-medium"
                  placeholder="e.g. What is the process of photosynthesis?"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {q.options.map((opt, oIdx) => (
                  <div key={oIdx} className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                      Option {String.fromCharCode(65 + oIdx)}
                      {q.correctAnswer === opt && opt !== '' && (
                        <span className="text-emerald-400">● CORRECT ANSWER</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={opt}
                      onChange={e => updateOption(q.id, oIdx, e.target.value)}
                      className={`w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${q.correctAnswer === opt && opt !== '' ? 'border-emerald-500/40 bg-emerald-500/5' : ''}`}
                      placeholder={`Enter option ${String.fromCharCode(65 + oIdx)}...`}
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">
                    Correct Answer
                  </label>
                  <select
                    value={q.correctAnswer}
                    onChange={e => updateQuestion(q.id, 'correctAnswer', e.target.value)}
                    className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none"
                  >
                    <option value="">Select Correct Option</option>
                    {q.options.map(
                      (opt, oIdx) =>
                        opt !== '' && (
                          <option key={oIdx} value={opt}>
                            Option {String.fromCharCode(65 + oIdx)}: {opt}
                          </option>
                        )
                    )}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">
                    Explanation (Optional)
                  </label>
                  <input
                    type="text"
                    value={q.explanation}
                    onChange={e => updateQuestion(q.id, 'explanation', e.target.value)}
                    className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    placeholder="Why is this answer correct?"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => confirmDelete(q.id)}
              className="absolute right-4 top-4 p-2 text-slate-600 hover:text-rose-500 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}

        <button
          onClick={addQuestion}
          className="w-full py-8 border-2 border-dashed border-white/5 rounded-3xl text-slate-500 hover:border-blue-500/30 hover:text-blue-400 hover:bg-blue-500/5 transition-all font-bold flex flex-col items-center gap-3 active:scale-[0.99] group"
        >
          <div className="p-3 bg-slate-800 rounded-2xl group-hover:bg-blue-500/20">
            <Plus className="w-8 h-8" />
          </div>
          Add New Question
        </button>
      </div>
    </div>
  );
}
