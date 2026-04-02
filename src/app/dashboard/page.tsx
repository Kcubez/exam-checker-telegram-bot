import { Bot, Users, CheckSquare, Zap, BarChart3, Clock, ArrowUpRight } from 'lucide-react';

import { prisma } from '@/lib/prisma';

export default async function DashboardPage() {
  const botsCount = await prisma.bot.count();
  const questionsCount = await prisma.question.count();
  const studentsCount = await prisma.student.count();
  
  const students = await prisma.student.findMany({ select: { score: true }});
  const totalScore = students.reduce((acc, s) => acc + s.score, 0);
  
  let avgAccuracy = 0;
  if (studentsCount > 0 && questionsCount > 0) {
     const maxPossibleScore = studentsCount * questionsCount;
     avgAccuracy = Math.round((totalScore / maxPossibleScore) * 100);
  }

  const stats = [
    { label: 'Active Bots', value: botsCount.toString(), icon: Bot, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Questions', value: questionsCount.toString(), icon: CheckSquare, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Students Checked', value: studentsCount.toString(), icon: Users, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { label: 'Avg. Accuracy', value: `${avgAccuracy}%`, icon: Zap, color: 'text-rose-400', bg: 'bg-rose-400/10' },
  ];

  return (
    <div className="p-10 space-y-12">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Main Dashboard</h1>
          <p className="mt-2 text-slate-400 font-medium ml-1">Track your Exam Bot&apos;s performance and activity.</p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl text-xs font-bold text-slate-400">
           <Clock className="w-4 h-4" />
           Last updated: 5 mins ago
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-[#1E293B]/60 border border-white/5 rounded-3xl p-6 hover:border-white/10 transition-all group overflow-hidden relative shadow-2xl">
            <div className={`p-3 ${stat.bg} w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-white/5`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">{stat.label}</h3>
              <p className="text-4xl font-black text-white">{stat.value}</p>
            </div>
            <div className="absolute right-6 bottom-6 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all pointer-events-none">
               <stat.icon className="w-20 h-20" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[400px]">
         <div className="lg:col-span-2 bg-[#1E293B]/40 border border-white/5 rounded-4xl p-8 backdrop-blur-3xl shadow-2xl border-dashed">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-blue-400" />
                  Bot Activity Overview
               </h3>
               <button className="text-xs p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-all">Download Report</button>
            </div>
            <div className="h-full flex items-center justify-center border-t border-white/5 bg-slate-900/20 rounded-3xl animate-pulse">
               <span className="text-slate-600 font-bold uppercase tracking-widest text-[10px]">Real-time analytics coming soon</span>
            </div>
         </div>

         <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-4xl p-8 flex flex-col justify-between shadow-2xl shadow-blue-500/20 group relative overflow-hidden">
            <Zap className="absolute top-0 right-0 w-64 h-64 opacity-10 -mr-10 -mt-10 group-hover:rotate-12 transition-transform duration-700" />
            <div className="relative z-10 space-y-4">
               <h3 className="text-2xl font-black text-white leading-tight">Pro Features<br/>Unlocked</h3>
               <p className="text-blue-100 text-sm leading-relaxed opacity-80">You&apos;re currently on the Exam Creator Plus plan. Enjoy unlimited bot instances and advanced AI checking.</p>
            </div>
            <button className="relative z-10 w-full py-4 bg-white text-blue-600 font-black rounded-2xl flex items-center justify-center gap-2 shadow-xl hover:bg-blue-50 transition-colors">
               View All Benefits
               <ArrowUpRight className="w-5 h-5" />
            </button>
         </div>
      </div>
    </div>
  );
}
