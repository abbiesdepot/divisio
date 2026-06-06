import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { 
  UserPlus, 
  Search, 
  ShieldCheck, 
  Mail, 
  Users, 
  Sparkles, 
  BrainCircuit, 
  TrendingUp, 
  Activity, 
  Loader2,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export const TeamManagement: React.FC = () => {
  const { organizations, activeOrgId, getOrgWorkload, getAIWorkloadInsights, currentUser, updateMemberRole } = useApp();
  const activeOrg = organizations.find(o => o.id === activeOrgId);
  const [search, setSearch] = useState('');
  const [aiInsights, setAiInsights] = useState<{ overallStatus: string; insights: any[] } | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  if (!activeOrg) return null;

  const currentUserMember = activeOrg.members.find(m => m.userId === currentUser?.id);
  const isPrivileged = !!currentUserMember && ['owner','leader','coordinator'].includes(currentUserMember.roleType);

  const workload = getOrgWorkload(activeOrgId!);

  const handleFetchAiInsights = async () => {
    setIsAiLoading(true);
    try {
      const insights = await getAIWorkloadInsights(activeOrgId!);
      setAiInsights(insights);
    } catch (error) {
      console.error("Failed to get AI insights", error);
    } finally {
      setIsAiLoading(false);
    }
  };
  
  const roleOrder: Record<string, number> = {
    'Pemimpin Tim': 1,
    'Bendahara': 2,
    'Sekretaris': 3,
    'Koordinator': 4,
    'PIC': 5,
    'Anggota': 6,
  };

  const getRoleWeight = (role: string) => {
    // Try to find exact match or partial match
    const found = Object.entries(roleOrder).find(([key]) => role.toLowerCase().includes(key.toLowerCase()));
    return found ? found[1] : 99;
  };

  const filteredMembers = activeOrg.members
    .filter(m => 
      m.name.toLowerCase().includes(search.toLowerCase()) || 
      m.role.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => getRoleWeight(a.role) - getRoleWeight(b.role));

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-brand-dark uppercase tracking-tight">Kapasitas Tim</h1>
          <p className="text-gray-400 font-medium italic">Pantau distribusi tugas di <span className="text-brand-teal font-black uppercase text-xs tracking-widest">{activeOrg.name}</span></p>
          <div className="mt-2 flex items-center gap-3 text-[12px]">
            {activeOrg.joinCode && (
              <div className="flex items-center gap-2 text-gray-500">
                <span className="font-black uppercase text-[10px]">Kode:</span>
                <span className="bg-white border border-gray-100 px-2 py-1 rounded text-[12px]">{activeOrg.joinCode}</span>
                <button onClick={() => navigator.clipboard?.writeText(activeOrg.joinCode)} className="px-2 py-1 bg-brand-teal text-white rounded text-[10px] font-black">Salin</button>
              </div>
            )}
            {activeOrg.subscription && (
              <div className="flex items-center gap-2 text-gray-500">
                <span className="font-black uppercase text-[10px]">Tier:</span>
                <span className="bg-white border border-gray-100 px-2 py-1 rounded text-[12px]">{activeOrg.subscription.tier}</span>
              </div>
            )}
          </div>
        </div>
        
        <button 
          onClick={handleFetchAiInsights}
          disabled={isAiLoading}
          className="flex items-center gap-3 bg-brand-teal hover:bg-brand-teal/95 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-brand-teal/20 transition-all active:scale-95 disabled:opacity-50"
        >
          {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
          {isAiLoading ? 'Menganalisis...' : 'Analisis AI'}
        </button>
      </header>

      {/* AI Insights Panel */}
      <AnimatePresence>
        {aiInsights && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-brand-dark rounded-[3rem] p-10 text-white relative overflow-hidden group border border-white/5"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform">
               <Sparkles className="w-32 h-32 text-brand-yellow" />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row gap-12">
               <div className="md:w-1/3 space-y-6">
                  <div className="flex items-center gap-3">
                    <BrainCircuit className="w-5 h-5 text-brand-teal" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">AI Workspace Insight</span>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black uppercase tracking-tight">Kesehatan Tim: <span className="text-brand-yellow">{aiInsights.overallStatus}</span></h2>
                    <p className="text-sm font-medium text-brand-grey/70 italic leading-relaxed">
                      Berdasarkan analisis algoritma DIVISIO terhadap beban kerja anggota dan tenggat waktu yang aktif saat ini.
                    </p>
                  </div>
                  <button 
                    onClick={() => setAiInsights(null)}
                    className="text-[10px] font-black uppercase tracking-widest text-brand-teal hover:underline"
                  >
                    Tutup Laporan
                  </button>
               </div>
               <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {aiInsights.insights.slice(0, 4).map((insight, idx) => {
                    const member = activeOrg.members.find(m => m.id === insight.memberId);
                    return (
                      <div key={idx} className="bg-white/5 border border-white/10 p-5 rounded-2xl hover:bg-white/10 transition-all">
                        <div className="flex items-center justify-between mb-3">
                           <span className="text-[10px] font-black uppercase tracking-widest text-brand-teal">{member?.name || 'Anggota'}</span>
                           <span className={cn(
                             "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                             insight.status === 'Sibuk' ? "bg-red-500" : insight.status === 'Normal' ? "bg-brand-teal" : "bg-brand-yellow"
                           )}>{insight.status}</span>
                        </div>
                        <p className="text-xs font-medium italic opacity-80 leading-relaxed text-brand-grey">"{insight.message}"</p>
                      </div>
                    );
                  })}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {filteredMembers.map((member) => {
          const loadScore = workload[member.id] || 0;
          const percentage = Math.min((loadScore / 10) * 100, 100); // 10 points = 100% capacity
          
          return (
            <motion.div 
              layout
              key={member.id}
              className="bg-white rounded-[2.5rem] border border-gray-100 p-8 hover:shadow-xl transition-all group flex flex-col sm:flex-row gap-8 items-center"
            >
              <div className="relative">
                <div className="w-24 h-24 rounded-[2rem] bg-brand-grey flex items-center justify-center text-3xl font-black text-brand-dark border border-gray-50 shadow-inner group-hover:scale-105 transition-transform">
                  {member.name.charAt(0)}
                </div>
                <div className={cn(
                  "absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center",
                  percentage > 80 ? "bg-red-500" : percentage > 40 ? "bg-brand-yellow" : "bg-brand-teal"
                )}>
                  <Activity className="w-3 h-3 text-white" />
                </div>
              </div>

              <div className="flex-1 space-y-6 w-full text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black text-brand-dark uppercase tracking-tight leading-none mb-2">{member.name}</h3>
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{member.role}</span>
                       <div className="w-1 h-1 bg-gray-200 rounded-full" />
                       <span className="text-[10px] font-black text-brand-teal uppercase tracking-widest">{member.division || 'Umum'}</span>
                      {isPrivileged && (
                        <select value={member.roleType} onChange={(e) => updateMemberRole(activeOrg.id, member.id, e.target.value as any)} className="ml-3 bg-white border border-gray-100 rounded px-2 py-1 text-[10px] font-black">
                          <option value="owner">Owner</option>
                          <option value="leader">Leader</option>
                          <option value="coordinator">Coordinator</option>
                          <option value="member">Member</option>
                        </select>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-center sm:items-end">
                    <span className={cn(
                      "text-2xl font-black tracking-tighter leading-none mb-1",
                      percentage > 80 ? "text-red-500" : percentage > 40 ? "text-brand-dark" : "text-brand-teal"
                    )}>{Math.round(percentage)}%</span>
                    <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Kapasitas Terisi</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-gray-400">
                    <span>Workload Distribution</span>
                    <span className={cn(
                      percentage > 90 ? "text-red-500 animate-pulse" : ""
                    )}>{percentage > 80 ? 'CRITICAL BUSY' : percentage > 50 ? 'NORMAL' : 'UNDERUTILIZED'}</span>
                  </div>
                  <div className="h-3 bg-brand-grey rounded-full border border-gray-100 overflow-hidden relative">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      className={cn(
                        "h-full rounded-full transition-all duration-1000",
                        percentage > 80 ? "bg-red-500" : percentage > 40 ? "bg-brand-yellow" : "bg-brand-teal"
                      )}
                    />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                     <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                           <TrendingUp className="w-3.5 h-3.5 text-brand-teal" />
                           <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">{loadScore} Poin</span>
                        </div>
                     </div>
                     <button className="text-[9px] font-black uppercase text-brand-teal tracking-widest flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all hover:underline">
                        Lihat Tugas <ChevronRight className="w-3 h-3" />
                     </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredMembers.length === 0 && (
        <div className="py-32 bg-white rounded-[3rem] border border-dashed border-gray-200 text-center space-y-6">
          <div className="w-24 h-24 bg-brand-grey rounded-[2rem] flex items-center justify-center mx-auto border border-gray-100 shadow-inner">
            <Users className="w-10 h-10 text-gray-200" />
          </div>
          <div className="space-y-2">
            <p className="text-brand-dark font-black text-2xl uppercase tracking-tight">Belum Ada Anggota</p>
            <p className="text-gray-400 font-medium italic max-w-xs mx-auto">Tidak ada anggota yang ditemukan. Bagikan kode bergabung untuk mulai berkolaborasi.</p>
          </div>
        </div>
      )}
    </div>
  );
};
