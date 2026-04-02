import { Users, Search, Download, TrendingUp, Trophy } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { formatDistanceToNow } from 'date-fns';

export default async function StudentsPage() {
  const students = await prisma.student.findMany({
    orderBy: { score: 'desc' },
    include: {
        bot: { select: { questions: { select: { id: true } } } }
    }
  });

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-12">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-white flex items-center gap-3 tracking-tight">
            <div className="p-2 bg-amber-500/10 rounded-lg ring-1 ring-amber-500/20">
              <Users className="w-8 h-8 text-amber-400" />
            </div>
            Student Results
          </h1>
          <p className="mt-2 text-slate-400 font-medium ml-1">Live performance tracking and leaderboard of all your exam takers.</p>
        </div>
        <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl font-bold transition-all border border-white/10 group">
          <Download className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
          Export CSV
        </button>
      </header>

      <div className="bg-[#1E293B]/60 border border-white/5 rounded-[40px] p-8 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
        {/* Background Decal */}
        <Trophy className="absolute -right-20 -bottom-20 w-96 h-96 text-amber-500/5 rotate-12 pointer-events-none" />

        <div className="flex items-center gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                    type="text" 
                    disabled
                    placeholder="Search by username... (Coming Soon)" 
                    className="w-full bg-slate-900 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
            </div>
        </div>

        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="pb-4 pt-2 px-6 text-xs font-black uppercase tracking-widest text-slate-500">Rank</th>
                <th className="pb-4 pt-2 px-6 text-xs font-black uppercase tracking-widest text-slate-500">Telegram User</th>
                <th className="pb-4 pt-2 px-6 text-xs font-black uppercase tracking-widest text-slate-500">Progress</th>
                <th className="pb-4 pt-2 px-6 text-xs font-black uppercase tracking-widest text-slate-500">Score</th>
                <th className="pb-4 pt-2 px-6 text-xs font-black uppercase tracking-widest text-slate-500">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {students.length === 0 ? (
                <tr>
                    <td colSpan={5} className="text-center py-20 text-slate-500 font-medium">
                        No students have taken the exam yet.
                    </td>
                </tr>
              ) : (
                students.map((student, idx) => {
                  const maxQ = student.bot?.questions?.length || 0;
                  const isFinished = student.currentQuestionIndex >= maxQ && maxQ > 0;
                  return (
                    <tr key={student.id} className="hover:bg-white/5 transition-colors group">
                      <td className="py-5 px-6">
                        <span className={`flex items-center justify-center w-8 h-8 rounded-full font-black ${idx === 0 ? 'bg-amber-400 text-amber-900 shadow-lg shadow-amber-400/20' : idx === 1 ? 'bg-slate-300 text-slate-800' : idx === 2 ? 'bg-orange-400 text-orange-950' : 'bg-slate-800 text-slate-400'}`}>
                            {idx + 1}
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        <div className="font-bold text-white flex items-center gap-2">
                            {student.telegramUsername || `@User_${student.telegramChatId.substring(0, 8)}`}
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-3">
                            <div className="w-32 h-2 bg-slate-900 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-blue-500 rounded-full" 
                                    style={{ width: `${maxQ > 0 ? (student.currentQuestionIndex / maxQ) * 100 : 0}%` }}
                                />
                            </div>
                            <span className="text-sm font-bold text-slate-400">
                                {student.currentQuestionIndex} / {maxQ}
                            </span>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-black text-emerald-400">{student.score}</span>
                            <span className="text-xs font-bold text-slate-500">pts</span>
                            {isFinished && <TrendingUp className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />}
                        </div>
                      </td>
                      <td className="py-5 px-6 text-sm font-medium text-slate-400">
                        {formatDistanceToNow(student.updatedAt, { addSuffix: true })}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
