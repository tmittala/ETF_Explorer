
import React, { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { fetchETFAnalysis, generateETFVisual } from './services/geminiService';
import { ETFData, ImageSize } from './types';
import { PerformanceChart } from './components/PerformanceChart';
import { ChatBot } from './components/ChatBot';

const POPULAR_ETFS = [
  'VOO', 'QQQ', 'SCHD', 'VTI', 'JEPI', 'ARKK', 'SPY', 'IWM', 'VEA', 'VWO', 
  'XLK', 'XLF', 'DIA', 'SMH', 'TLT', 'GLD', 'VT', 'VXUS', 'VIG', 'BND'
];

const App: React.FC = () => {
  const [ticker, setTicker] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ETFData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<ImageSize>('1K');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isDark, setIsDark] = useState(true);

  // Toggle theme class on the html element to trigger Tailwind dark: variants
  useEffect(() => {
    const htmlElement = document.documentElement;
    if (isDark) {
      htmlElement.classList.add('dark');
      document.body.style.backgroundColor = '#000000';
    } else {
      htmlElement.classList.remove('dark');
      document.body.style.backgroundColor = '#ffffff';
    }
  }, [isDark]);

  const performAnalysis = async (searchTicker: string) => {
    setLoading(true);
    setError(null);
    setData(null);
    setGeneratedImage(null);

    try {
      const result = await fetchETFAnalysis(searchTicker.toUpperCase());
      setData(result);
      setTicker(searchTicker.toUpperCase());
    } catch (err) {
      console.error(err);
      setError("Failed to fetch live data. Verify the ticker and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker.trim()) {
      const randomTicker = POPULAR_ETFS[Math.floor(Math.random() * POPULAR_ETFS.length)];
      performAnalysis(randomTicker);
    } else {
      performAnalysis(ticker.trim());
    }
  };

  const handleGenerateImage = async () => {
    if (!data) return;
    setIsGeneratingImage(true);
    try {
      const imageUrl = await generateETFVisual(data.summary, imageSize);
      setGeneratedImage(imageUrl);
    } catch (err) {
      console.error("Image generation failed", err);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const formatPercent = (val: string) => {
    const num = parseFloat(val.replace(/[+%]/g, ''));
    if (isNaN(num)) return val;
    return `${num > 0 ? '+' : ''}${num.toFixed(2)}%`;
  };

  const formatPrice = (price: string) => {
    if (price.startsWith('$')) return price;
    return `$${price}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 min-h-screen flex flex-col text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <nav className="flex justify-end items-center mb-12">
        <button 
          onClick={() => setIsDark(!isDark)}
          className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:scale-110 transition-transform shadow-sm border border-slate-200 dark:border-slate-700"
          aria-label="Toggle Theme"
        >
          {isDark ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.05 16.05l.707.707M7.95 7.95l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </nav>

      <div className="text-center mb-12">
        <h1 className="text-6xl md:text-7xl font-bold tracking-tight mb-4 text-slate-900 dark:text-white">
          ETF <span className="font-light opacity-60">Explorer</span>
        </h1>
        <p className="text-xl md:text-2xl font-medium text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10">
          live verified insights for your portfolio.
        </p>
        
        <form onSubmit={handleSearch} className="max-w-md mx-auto">
          <div className="relative group shadow-lg rounded-2xl">
            <input
              type="text"
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-5 text-xl font-medium focus:ring-2 focus:ring-blue-500 transition-all outline-none text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-500"
              placeholder="Enter Ticker (VOO, QQQ, SCHD...)"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 top-2 bottom-2 bg-blue-600 text-white px-6 rounded-xl font-bold hover:bg-blue-500 transition-colors disabled:opacity-50"
            >
              {loading ? "..." : "Analyze"}
            </button>
          </div>
          {error && <p className="text-red-600 dark:text-red-400 text-sm mt-4 font-semibold">{error}</p>}
        </form>
      </div>

      {data && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white dark:bg-[#1c1c1e] p-8 rounded-[32px] shadow-sm border border-slate-100 dark:border-white/5">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-3 inline-block">
                  {data.sector}
                </span>
                <h3 className="text-6xl font-bold tracking-tighter text-slate-900 dark:text-white">{data.ticker}</h3>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mb-1">Live Price</p>
                <p className="text-4xl font-semibold tracking-tighter text-slate-900 dark:text-white">{formatPrice(data.currentPrice)}</p>
              </div>
            </div>
            <p className="text-xl md:text-2xl leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
              {data.summary}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-[#1c1c1e] p-8 rounded-[32px] flex flex-col border border-slate-100 dark:border-white/5 shadow-sm">
              <h4 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Live Performance Yields</h4>
              <PerformanceChart data={data.performance} />
              <div className="grid grid-cols-2 gap-4 mt-auto pt-6">
                {[
                  { label: 'YTD', val: data.performance.ytd },
                  { label: '3M', val: data.performance.threeMonth },
                  { label: '6M', val: data.performance.sixMonth },
                  { label: '1Y', val: data.performance.oneYear },
                ].map((p, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-[20px] border border-slate-100 dark:border-slate-700/50">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase mb-1 tracking-widest">{p.label}</p>
                    <p className={`text-2xl font-bold ${parseFloat(p.val) >= 0 ? 'text-[#34c759]' : 'text-[#ff3b30]'}`}>
                      {formatPercent(p.val)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-[#1c1c1e] p-8 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm">
              <h4 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Current Top Holdings</h4>
              <div className="space-y-4">
                {data.holdings.map((h, i) => (
                  <div key={i} className="flex justify-between items-center group">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-400">
                        {i + 1}
                      </div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-500 transition-colors">{h.name}</span>
                    </div>
                    <span className="font-mono text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full font-bold">
                      {h.percentage.includes('%') ? h.percentage : `${h.percentage}%`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-[#1c1c1e] p-10 rounded-[32px] border border-slate-100 dark:border-white/5">
            <h4 className="text-xl font-bold mb-8 text-center text-slate-900 dark:text-white">Alternatives to Explore</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {data.alternatives.map((alt, i) => (
                <button
                  key={i}
                  onClick={() => performAnalysis(alt.ticker)}
                  className="flex flex-col items-center bg-white dark:bg-slate-800 p-6 rounded-[24px] hover:scale-105 transition-all active:scale-95 shadow-sm hover:shadow-xl group border border-slate-100 dark:border-slate-700"
                >
                  <span className="text-2xl font-black text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">{alt.ticker}</span>
                  <span className="text-sm text-slate-500 dark:text-slate-400 font-bold mt-2">{formatPrice(alt.price)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="relative rounded-[32px] overflow-hidden bg-slate-100 dark:bg-[#1c1c1e] min-h-[400px] flex items-center justify-center border border-slate-200 dark:border-white/5">
            {generatedImage ? (
              <img src={generatedImage} alt="ETF Vision" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-8">
                <button
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImage}
                  className="bg-slate-900 dark:bg-white text-white dark:text-black px-10 py-4 rounded-full font-black shadow-2xl hover:opacity-90 disabled:opacity-50 transition-all active:scale-95"
                >
                  {isGeneratingImage ? "Visualizing Strategy..." : "Visualize Asset Theme"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-6"></div>
          <p className="text-xs font-black text-slate-500 dark:text-slate-500 uppercase tracking-[0.2em]">Verifying Live Data via Google Search...</p>
        </div>
      )}

      {!data && !loading && (
        <div className="flex-1 flex items-center justify-center py-20">
          <p className="text-2xl font-medium italic text-slate-400 dark:text-slate-700">Ready for exploration</p>
        </div>
      )}

      <footer className="mt-auto py-12 flex flex-col md:flex-row justify-between items-center md:items-end border-t border-slate-100 dark:border-white/5 gap-6">
        <div className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-600">
          Made by Tushar
        </div>
        <div className="text-center md:text-right">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 max-w-[320px] leading-relaxed uppercase tracking-wider">
            Real-time Grounded AI Engine. Verified with Google Search.
          </p>
        </div>
      </footer>

      <ChatBot />
      <Analytics />
    </div>
  );
};

export default App;
