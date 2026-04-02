import { Bot, CheckCircle, Smartphone } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0F172A] text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-3xl w-full text-center space-y-8 animate-in fade-in zoom-in duration-700">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-linear-to-br from-blue-500 to-indigo-600 rounded-3xl shadow-2xl mb-4 group hover:scale-110 transition-transform duration-300">
          <Bot className="w-12 h-12 text-white" />
        </div>

        <h1 className="text-5xl font-extrabold tracking-tight bg-linear-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          AI Exam Checker Bot
        </h1>

        <p className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
          စာမေးပွဲအဖြေလွှာများနှင့် အကျဉ်းချုပ်များကို အလိုအလျောက် စစ်ဆေးပေးမည့် စမတ်ကျသော
          တယ်လီဂရမ်ဘော့တ် ဖြစ်သည်။ 🇲🇲
        </p>

        <div className="grid md:grid-cols-3 gap-6 pt-10">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
            <CheckCircle className="w-8 h-8 text-emerald-400 mb-4" />
            <h3 className="font-bold text-lg mb-2">Text Check</h3>
            <p className="text-sm text-slate-400">ရေးသားထားသော အဖြေများကို စစ်ဆေးပေးခြင်း</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
            <Smartphone className="w-8 h-8 text-blue-400 mb-4" />
            <h3 className="font-bold text-lg mb-2">Photo Scan</h3>
            <p className="text-sm text-slate-400">
              လက်ရေးအဖြေလွှာများကို ဓာတ်ပုံမှတစ်ဆင့် စစ်ဆေးခြင်း
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
            <Bot className="w-8 h-8 text-amber-400 mb-4" />
            <h3 className="font-bold text-lg mb-2">AI Feedback</h3>
            <p className="text-sm text-slate-400">
              အမှတ်နှင့် အကြံပြုချက်များကို မြန်မာလို ပေးခြင်း
            </p>
          </div>
        </div>

        <div className="pt-12 text-slate-500 flex flex-col items-center">
          <span className="text-xs uppercase tracking-widest mb-2 opacity-50">
            Webhook Endpoint Status
          </span>
          <div className="flex items-center space-x-2 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-emerald-400">/api/webhooks/telegram</span>
          </div>
        </div>
      </div>
    </main>
  );
}
