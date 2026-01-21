
import React, { useState, useEffect } from 'react';
import { analyzeApiResponse } from './services/apiAnalyzer';
import { generateBaseSchema } from './services/schemaGenerator';
import { enhanceSchemaWithAI } from './services/geminiService';
import { DashboardSchema, SavedDashboard } from './types';
import { JSONRenderer } from './components/JSONRenderer';
import { 
  LayoutDashboard, Database, Settings, ArrowRight, Loader2, 
  Play, Code, AlertCircle, Plus, Globe, X, History 
} from 'lucide-react';

const App: React.FC = () => {
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/users');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dashboards, setDashboards] = useState<SavedDashboard[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(true);
  const [showSchema, setShowSchema] = useState(false);

  // Auto-generate initial if none exists
  useEffect(() => {
    if (dashboards.length === 0 && !loading && isAddingNew) {
      // Keep state as is for user to click
    }
  }, []);

  const handleGenerate = async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(url, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
      
      const data = await response.json();
      const analysis = analyzeApiResponse(data);
      const baseSchema = generateBaseSchema(analysis);
      const enhancedSchema = await enhanceSchemaWithAI(analysis, baseSchema);

      const newDashboard: SavedDashboard = {
        id: Math.random().toString(36).substr(2, 9),
        name: new URL(url).pathname.split('/').pop()?.toUpperCase() || 'NEW DASHBOARD',
        url,
        schema: enhancedSchema,
        data: data
      };

      setDashboards(prev => [...prev, newDashboard]);
      setActiveId(newDashboard.id);
      setIsAddingNew(false);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch or analyze data');
    } finally {
      setLoading(false);
    }
  };

  const activeDashboard = dashboards.find(d => d.id === activeId);

  return (
    <div className="min-h-screen flex bg-[#fcfdfe]">
      {/* Refined Sidebar */}
      <aside className="w-72 bg-[#0a0c10] text-slate-400 hidden md:flex flex-col border-r border-slate-800 shadow-2xl">
        <div className="p-8 pb-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Database size={20} className="text-white" />
            </div>
            <span className="font-black text-white text-lg tracking-tight">API<span className="text-indigo-500">ADMIN</span></span>
          </div>
        </div>
        
        <div className="flex-1 px-4 space-y-8 overflow-y-auto custom-scrollbar">
          <div>
            <div className="px-4 mb-4 flex justify-between items-center group">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Dashboards</span>
              <button 
                onClick={() => setIsAddingNew(true)}
                className="p-1 hover:bg-slate-800 rounded-lg text-indigo-400 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="space-y-1">
              {dashboards.map((d) => (
                <button
                  key={d.id}
                  onClick={() => { setActiveId(d.id); setIsAddingNew(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    activeId === d.id && !isAddingNew 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Globe size={18} className={activeId === d.id && !isAddingNew ? 'text-indigo-200' : 'text-slate-600'} />
                  <span className="truncate">{d.name}</span>
                </button>
              ))}
              
              <button 
                onClick={() => setIsAddingNew(true)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold border-2 border-dashed transition-all mt-4 ${
                  isAddingNew 
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5' 
                  : 'border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-400'
                }`}
              >
                <Plus size={18} />
                <span>Add New API</span>
              </button>
            </div>
          </div>

          <div>
             <span className="px-4 mb-4 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">System</span>
             <div className="space-y-1">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-800/50 hover:text-slate-200 transition-all">
                  <History size={18} /> Logs
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-800/50 hover:text-slate-200 transition-all">
                  <Settings size={18} /> Settings
                </button>
             </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-800/50 bg-[#07090d]">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xs font-black text-slate-400">ADM</div>
             <div>
               <p className="text-xs font-black text-slate-200">Admin User</p>
               <p className="text-[10px] font-bold text-slate-500">Free Tier</p>
             </div>
           </div>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header bar */}
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-10 shrink-0">
          <div className="flex items-center gap-4 text-slate-400">
             {!isAddingNew && activeDashboard && (
               <>
                <Globe size={18} className="text-indigo-500" />
                <span className="text-sm font-bold text-slate-600 truncate max-w-md">{activeDashboard.url}</span>
               </>
             )}
          </div>
          <div className="flex gap-3">
             {activeDashboard && !isAddingNew && (
               <button 
                onClick={() => setShowSchema(!showSchema)}
                className={`px-5 py-2 rounded-xl text-xs font-black tracking-widest uppercase flex items-center gap-2 transition-all ${
                  showSchema ? 'bg-slate-900 text-white shadow-xl' : 'bg-white border border-slate-100 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <Code size={14} /> {showSchema ? 'Hide JSON' : 'View JSON'}
              </button>
             )}
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          {isAddingNew ? (
            <div className="max-w-3xl mx-auto py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></div>
                  Dynamic Generator
                </div>
                <h1 className="text-6xl font-black text-slate-900 tracking-tighter mb-6">
                  Forge your <span className="text-indigo-600">Admin Panel</span>
                </h1>
                <p className="text-slate-400 text-lg font-medium leading-relaxed">
                  Connect any REST endpoint. Our synthesis engine will auto-detect the data structure and craft a high-performance dashboard for you.
                </p>
              </div>

              <div className="bg-white p-10 rounded-[32px] shadow-2xl shadow-indigo-100/50 border border-slate-50 space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-bl-[100px] -z-10"></div>
                
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">REST Endpoint URL</label>
                  <div className="relative group">
                    <input 
                      type="text" 
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://api.example.com/data"
                      className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none text-slate-800 font-bold pr-14 transition-all"
                    />
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300">
                      <Play size={20} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Authorization</label>
                      <input 
                        type="password" 
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="Bearer token (optional)"
                        className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none text-slate-800 font-bold text-sm transition-all"
                      />
                   </div>
                   <div className="flex items-end">
                      <button 
                        onClick={handleGenerate}
                        disabled={loading || !url}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 px-8 rounded-2xl flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:transform-none shadow-xl shadow-indigo-200"
                      >
                        {loading ? <Loader2 className="animate-spin" /> : <><Plus size={22} /> Build Dashboard</>}
                      </button>
                   </div>
                </div>

                {error && (
                  <div className="p-6 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-4 text-rose-600 animate-in shake duration-500">
                    <AlertCircle size={22} className="shrink-0" />
                    <div className="text-sm font-bold">
                      <p className="mb-1 uppercase tracking-widest text-[10px] opacity-70">Generation Error</p>
                      {error}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in duration-500">
              {showSchema && activeDashboard && (
                <div className="mb-10 bg-[#0a0c10] rounded-[24px] p-8 text-indigo-400 overflow-x-auto max-h-[500px] shadow-2xl border border-slate-800/50">
                  <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">UI Schema Declaration</span>
                    <button onClick={() => setShowSchema(false)} className="text-slate-500 hover:text-white"><X size={16} /></button>
                  </div>
                  <pre className="text-xs leading-relaxed font-mono">{JSON.stringify(activeDashboard.schema, null, 2)}</pre>
                </div>
              )}

              {activeDashboard && (
                <JSONRenderer 
                  schema={activeDashboard.schema} 
                  data={activeDashboard.data} 
                  activePageId="dashboard" 
                />
              )}
            </div>
          )}
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .shake { animation: shake 0.4s ease-in-out; }
      `}</style>
    </div>
  );
};

export default App;
