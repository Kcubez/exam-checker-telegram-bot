'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, Bot, Key, Terminal, Smartphone, Eye, EyeOff, Loader2 } from 'lucide-react';
import { getBotSettings, updateBotSettings } from '../../actions/settings';
import { useToast } from '@/components/ui/toast';

export default function BotSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showToken, setShowToken] = useState(false);
  
  const { toast } = useToast();
  
  const [botName, setBotName] = useState('Exam Checker Bot');
  const [telegramToken, setTelegramToken] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('🎉 Exam Checker Bot မှ ကြိုဆိုပါတယ်!\n\nကျွန်တော်က သင့်ရဲ့ စာမေးပွဲအဖြေလွှာတွေကို စစ်ဆေးပေးမယ့် AI Bot ပါ။ 🚀');

  // 1. Fetch settings on load
  useEffect(() => {
    async function fetchSettings() {
      const result = await getBotSettings();
      if (result.success && result.bot) {
        setBotName(result.bot.name);
        setTelegramToken(result.bot.telegramBotToken || '');
        setWelcomeMessage(result.bot.welcomeMessage || '');
      }
      setInitialLoading(false);
    }
    fetchSettings();
  }, []);

  // 2. Actually save to DB
  const handleSave = async () => {
    setLoading(true);
    const result = await updateBotSettings({
      name: botName,
      telegramBotToken: telegramToken,
      welcomeMessage: welcomeMessage
    });
    setLoading(false);

    if (result.success) {
      toast('Settings saved successfully! 🚀', 'success');
    } else {
      toast(`Update failed: ${result.error}`, 'error');
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-10 max-w-5xl mx-auto space-y-12">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-white flex items-center gap-3 tracking-tight">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Settings className="w-8 h-8 text-amber-400" />
            </div>
            Bot Configuration
          </h1>
          <p className="mt-2 text-slate-400 font-medium ml-1">Configure your AI assistant&apos;s personality and connections.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-blue-500/20 active:scale-95 group disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
          )}
          {loading ? 'Updating...' : 'Update Settings'}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8 pb-20">
          {/* General Section */}
          <section className="bg-slate-900/30 border border-white/5 rounded-[40px] p-10 space-y-8 backdrop-blur-3xl">
            <h2 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Bot className="w-4 h-4 text-blue-400" />
              </div>
              Identity & Basics
            </h2>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Display Bot Name</label>
                <input 
                  type="text" 
                  value={botName}
                  onChange={(e) => setBotName(e.target.value)}
                  className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all font-medium"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Telegram API Token</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Key className="w-5 h-5 text-slate-600 group-focus-within:text-amber-400 transition-colors" />
                  </div>
                  <input 
                    type={showToken ? "text" : "password"} 
                    value={telegramToken}
                    onChange={(e) => setTelegramToken(e.target.value)}
                    placeholder="758362XXXX:AAHXXXXXXXXX..."
                    className="w-full bg-slate-950/50 border border-white/5 rounded-2xl pl-13 pr-16 py-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all font-mono text-sm"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-600 hover:text-white transition-colors"
                  >
                    {showToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-600 font-bold ml-1 uppercase tracking-tight">Get your token from @BotFather on Telegram.</p>
              </div>
            </div>
          </section>

          {/* Personality Section (Welcome Message) */}
          <section className="bg-slate-900/30 border border-white/5 rounded-[40px] p-10 space-y-8 backdrop-blur-3xl">
            <h2 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                <Terminal className="w-4 h-4 text-emerald-400" />
              </div>
              Bot Personality
            </h2>

            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Welcome Message</label>
                <textarea 
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-6 py-5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all font-medium min-h-[160px] leading-relaxed"
                />
                <p className="text-[10px] text-slate-600 font-bold ml-1 uppercase tracking-tight">The first message a student sees when they type /start.</p>
              </div>
            </div>
          </section>
        </div>

        {/* Info Column */}
        <div className="space-y-6">
           <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[40px] p-8 text-white relative overflow-hidden group shadow-2xl shadow-blue-500/10">
              <Smartphone className="absolute -right-8 -top-8 w-48 h-48 opacity-10 group-hover:-rotate-12 transition-transform duration-1000" />
              <h3 className="text-xl font-black uppercase tracking-tight relative z-10 leading-tight">Live Connection<br/>Status</h3>
              <div className="mt-8 flex items-center gap-3 bg-white/10 w-fit px-4 py-2 rounded-full border border-white/10 relative z-10">
                 <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                 <span className="text-xs font-bold uppercase tracking-widest">Bot Active</span>
              </div>
              <p className="mt-6 text-sm text-blue-100 leading-relaxed font-medium relative z-10 opacity-80">
                Your bot is currently receiving updates from Telegram. Any changes here will reflect instantly on all student interactions.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
