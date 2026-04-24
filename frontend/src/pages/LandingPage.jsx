import React from 'react';

const LandingPage = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-white font-sans selection:bg-primary-500/30">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary-600/10 blur-[120px]" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] rounded-full bg-purple-600/10 blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-50 flex items-center justify-between px-6 md:px-12 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:scale-110 transition-transform duration-300">
            <span className="text-2xl text-white">🌙</span>
          </div>
          <h1 className="text-2xl font-display font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Helthify
          </h1>
        </div>
        <button 
          onClick={onGetStarted}
          className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full font-medium transition-all duration-300 backdrop-blur-md"
        >
          Sign In
        </button>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 pt-16 pb-32 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium">
            ✨ Your AI-Powered Wellness Journey Starts Here
          </div>
          
          <h2 className="text-5xl md:text-7xl font-display font-black leading-[1.1] tracking-tight">
            Built for focus. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-purple-400 to-indigo-400">
              Designed for rest.
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Stop guessing. Start tracking. Use our advanced AI to analyze your sleep patterns and maximize your daily productivity.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button 
              onClick={onGetStarted}
              className="px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-2xl shadow-xl shadow-primary-500/25 transition-all duration-300 hover:-translate-y-1 w-full sm:w-auto text-lg"
            >
              Get Started Now
            </button>
            <a 
              href="#features"
              className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-2xl transition-all duration-300 backdrop-blur-sm w-full sm:w-auto flex items-center justify-center gap-2"
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Real Platform Preview - Pure CSS/Component Mockup */}
        <div className="max-w-5xl mx-auto mt-24 relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-primary-600/20 to-purple-600/20 blur-3xl opacity-50"></div>
          
          <div className="relative glass-card border-white/10 overflow-hidden shadow-2xl rounded-3xl p-6 md:p-10 bg-[#0B0F19]/80 backdrop-blur-2xl">
            {/* Header of Mockup */}
            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 animate-pulse"></div>
                <div className="h-4 w-24 bg-slate-800 rounded animate-pulse"></div>
              </div>
              <div className="flex gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500/20 border border-red-500/50"></div>
                <div className="w-4 h-4 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                <div className="w-4 h-4 rounded-full bg-green-500/20 border border-green-500/50"></div>
              </div>
            </div>

            {/* Simulated Dashboard Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="glass-card p-6 border-white/5 bg-white/5">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Avg Sleep</p>
                <p className="text-3xl font-display font-black text-white">7.5<span className="text-sm text-slate-500 ml-1">h</span></p>
                <div className="mt-3 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full w-[75%] bg-primary-500"></div>
                </div>
              </div>
              <div className="glass-card p-6 border-white/5 bg-white/5">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Quality</p>
                <p className="text-3xl font-display font-black text-white">4.8<span className="text-sm text-slate-500 ml-1">/ 5</span></p>
                <div className="mt-3 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full w-[90%] bg-purple-500"></div>
                </div>
              </div>
              <div className="glass-card p-6 border-white/5 bg-white/5">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Focus</p>
                <p className="text-3xl font-display font-black text-white">92<span className="text-sm text-slate-500 ml-1">%</span></p>
                <div className="mt-3 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full w-[92%] bg-indigo-500"></div>
                </div>
              </div>
            </div>

            {/* Simulated Chart */}
            <div className="glass-card p-8 border-white/5 bg-[#0B0F19]/50 min-h-[250px] flex flex-col justify-end">
              <div className="flex items-end justify-between gap-2 h-40">
                <div className="flex-1 bg-primary-500/40 rounded-t-lg border-x border-t border-primary-500/20 hover:bg-primary-500/60 transition-all cursor-pointer h-[40%]"></div>
                <div className="flex-1 bg-primary-500/40 rounded-t-lg border-x border-t border-primary-500/20 hover:bg-primary-500/60 transition-all cursor-pointer h-[60%]"></div>
                <div className="flex-1 bg-primary-500/40 rounded-t-lg border-x border-t border-primary-500/20 hover:bg-primary-500/60 transition-all cursor-pointer h-[85%]"></div>
                <div className="flex-1 bg-primary-500/40 rounded-t-lg border-x border-t border-primary-500/20 hover:bg-primary-500/60 transition-all cursor-pointer h-[55%]"></div>
                <div className="flex-1 bg-primary-500/40 rounded-t-lg border-x border-t border-primary-500/20 hover:bg-primary-500/60 transition-all cursor-pointer h-[75%]"></div>
                <div className="flex-1 bg-primary-500/40 rounded-t-lg border-x border-t border-primary-500/20 hover:bg-primary-500/60 transition-all cursor-pointer h-[95%]"></div>
                <div className="flex-1 bg-primary-500/40 rounded-t-lg border-x border-t border-primary-500/20 hover:bg-primary-500/60 transition-all cursor-pointer h-[80%]"></div>
              </div>
              <div className="flex justify-between mt-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>
            </div>
            
            {/* AI Recommendation Overlay */}
            <div className="absolute bottom-10 right-10 max-w-[280px] animate-bounce-slow">
              <div className="glass-card p-4 bg-primary-600 border-primary-400/50 shadow-2xl shadow-primary-600/20">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/70 mb-1">AI Recommendation</p>
                <p className="text-sm font-medium text-white leading-relaxed">
                  "Your focus is 20% higher when you sleep before 11 PM. Try to maintain this rhythm."
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div id="features" className="max-w-7xl mx-auto mt-40 space-y-20">
          <div className="text-center space-y-4">
            <h3 className="text-3xl md:text-5xl font-display font-black">Pure Intelligence</h3>
            <p className="text-slate-400 max-w-xl mx-auto">Advanced tools built on the foundation of sleep science and behavioral psychology.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon="🌙" 
              title="Sleep Tracking" 
              desc="Log your cycles manually and get automated quality scoring based on your inputs."
            />
            <FeatureCard 
              icon="📉" 
              title="Trend Analysis" 
              desc="Visualize your progress over 7, 14, or 30 days with our high-precision bar charts."
            />
            <FeatureCard 
              icon="🥗" 
              title="Diet Planning" 
              desc="AI-generated nutrition plans that adapt to your sleep quality and energy needs."
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <span className="text-xl">🌙</span>
            <span className="font-display font-bold text-slate-400 tracking-tight">Helthify AI</span>
          </div>
          <p className="text-slate-500 text-sm">
            © 2024 Helthify. The data-driven way to better health.
          </p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="glass-card p-8 border-white/5 group hover:border-primary-500/30 transition-all duration-500 bg-[#131B2C]/40">
    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-4xl mb-6 group-hover:scale-110 group-hover:bg-primary-500/10 transition-all duration-500 shadow-inner">
      {icon}
    </div>
    <h3 className="text-2xl font-display font-bold mb-4">{title}</h3>
    <p className="text-slate-400 leading-relaxed text-base">
      {desc}
    </p>
  </div>
);

export default LandingPage;