import React from 'react';
import { useApp } from '../AppContext';
import { 
  CheckCircle2, 
  Clock, 
  Users, 
  ArrowUpRight, 
  Building2, 
  ClipboardList,
  Target,
  Zap,
  TrendingUp,
  AlertCircle,
  Activity,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { cn } from '../lib/utils';

export const Dashboard: React.FC<{ onNavigate?: (page: 'dashboard' | 'tasks' | 'team') => void }> = ({ onNavigate }) => {
  const { organizations, activeOrgId, tasks, currentUser, getOrgWorkload } = useApp();
  const activeOrg = organizations.find(o => o.id === activeOrgId);
  
  if (!activeOrg) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center space-y-6">
        <div className="w-24 h-24 bg-brand-grey rounded-[2rem] flex items-center justify-center mb-4 border border-gray-100">
          <Building2 className="w-10 h-10 text-gray-200" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-brand-dark uppercase tracking-tight">Tidak Ada Tim Terpilih</h2>
          <p className="text-gray-400 max-w-sm mt-2 font-medium italic mx-auto">
            Anda belum bergabung dengan ruang kerja manapun. Gunakan pemilih di atas untuk membuat atau bergabung dengan tim.
          </p>
          <div className="mt-8 p-6 bg-brand-grey border border-gray-100 rounded-[2rem] max-w-xs mx-auto">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Kode Bergabung Demo</p>
            <p className="text-xl font-mono font-black text-brand-dark tracking-wider select-all">default-org</p>
            <p className="text-[9px] font-medium text-gray-400 mt-2 uppercase tracking-wide">Gunakan ini untuk melihat data contoh</p>
          </div>
        </div>
      </div>
    );
  }

  const orgTasks = tasks.filter(t => t.orgId === activeOrgId);
  const completed = orgTasks.filter(t => t.status === 'done').length;
  const inProgress = orgTasks.filter(t => t.status === 'in_progress').length;
  const overdue = orgTasks.filter(t => t.status !== 'done' && new Date(t.deadline) < new Date()).length;

  const getWorkloadLeader = () => {
    const workload = getOrgWorkload(activeOrg.id);
    let max = -1;
    let leader = null;
    activeOrg.members.forEach(m => {
      if ((workload[m.id] || 0) > max) {
        max = workload[m.id] || 0;
        leader = m;
      }
    });
    return leader ? { ...leader, points: max } : null;
  };

  const topPerformer = getWorkloadLeader();

  const stats = [
    { label: 'Total Tugas', value: orgTasks.length, icon: ClipboardList, color: 'text-brand-dark', bg: 'bg-brand-teal/5' },
    { label: 'Selesai', value: completed, icon: CheckCircle2, color: 'text-brand-teal', bg: 'bg-brand-teal/10' },
    { label: 'Terlambat', value: overdue, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
    { label: 'Anggota Tim', value: activeOrg.members.length, icon: Users, color: 'text-brand-dark', bg: 'bg-brand-grey' },
  ];

  const recentTasks = orgTasks
    .sort((a, b) => new Date(b.deadline).getTime() - new Date(a.deadline).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-50 pb-10">
        <div>
          <p className="text-[10px] font-black text-brand-teal uppercase tracking-[0.4em] mb-3 flex items-center gap-2">
            <Target className="w-3.5 h-3.5" /> Ruang Kerja Aktif
          </p>
          <h1 className="text-5xl font-black text-brand-dark uppercase tracking-tight">Selamat Datang, {currentUser?.name}!</h1>
          <p className="text-gray-400 mt-2 font-medium italic">
            Ruang Kerja Aktif: <span className="text-brand-dark font-black uppercase tracking-widest text-xs ml-1">{activeOrg.name}</span>
          </p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-white border border-gray-100 px-6 py-4 rounded-2xl shadow-sm flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-brand-teal/10 flex items-center justify-center">
               <Zap className="w-5 h-5 text-brand-teal fill-brand-teal" />
             </div>
             <div>
               <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Aktivitas Tim</p>
               <p className="text-sm font-black text-brand-dark uppercase tracking-tight mt-1">Semua berjalan lancar</p>
             </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all group"
          >
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-8 border border-gray-50 transition-all group-hover:scale-110", stat.bg)}>
              <stat.icon className={cn("w-7 h-7", stat.color)} />
            </div>
            <p className="text-[10px] uppercase font-black tracking-[0.3em] text-gray-400">{stat.label}</p>
            <p className="text-4xl font-black text-brand-dark mt-2 tracking-tighter">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
           <section className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-teal/5 rounded-bl-[100%] border-l border-b border-brand-teal/10 -mr-4 -mt-4" />
            
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-dark flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-brand-yellow" />
                </div>
                <h2 className="font-black text-2xl text-brand-dark uppercase tracking-tight">Tugas Terbaru</h2>
              </div>
              <button 
                onClick={() => onNavigate?.('tasks')}
                className="text-brand-teal text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5 hover:underline"
              >
                Lihat semua tugas <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-6">
              {recentTasks.length > 0 ? recentTasks.map(task => {
                const assignee = activeOrg.members.find(m => m.id === task.assigneeId);
                return (
                  <div key={task.id} className="group relative flex items-center justify-between p-6 bg-brand-grey rounded-[1.5rem] border border-gray-100 hover:border-brand-teal/50 transition-all hover:translate-x-2">
                    <div className="flex items-center gap-6">
                      <div className={cn(
                        "w-2 h-12 rounded-full",
                        task.difficulty === 'hard' ? 'bg-red-500' : task.difficulty === 'medium' ? 'bg-brand-yellow' : 'bg-brand-teal'
                      )} />
                      <div>
                        <h3 className="font-black text-brand-dark uppercase tracking-tight text-base leading-none">{task.name}</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">
                          <span className="text-brand-teal">{assignee?.name || 'Anggota'}</span> • Tenggat {new Date(task.deadline).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                    </div>
                    <span className={cn(
                      "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border",
                      task.status === 'done' ? 'bg-green-50 text-green-700 border-green-100' : 
                      task.status === 'pending_approval' ? 'bg-brand-teal/10 text-brand-teal border-brand-teal/20' :
                      'bg-white text-brand-dark border-gray-100'
                    )}>
                      {task.status === 'not_started' ? 'Belum Mulai' : 
                       task.status === 'in_progress' ? 'Sedang Berjalan' : 
                       task.status === 'pending_approval' ? 'Persetujuan' : 'Selesai'}
                    </span>
                  </div>
                );
              }) : (
                <div className="text-center py-20 bg-brand-grey rounded-[2rem] border border-dashed border-gray-200">
                  <p className="text-[10px] uppercase font-black tracking-[0.3em] text-gray-300">Tidak ada tugas ditemukan.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-10">
          <section className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
            <h2 className="font-black text-2xl text-brand-dark uppercase tracking-tight mb-8">Kalender</h2>
            <div className="p-2 bg-brand-grey rounded-[2rem]">
              <Calendar 
                className="border-none w-full font-sans !bg-transparent" 
                tileClassName={({ date }) => {
                  const hasTask = orgTasks.some(t => new Date(t.deadline).toDateString() === date.toDateString());
                  return hasTask ? 'bg-brand-teal text-white font-black rounded-xl transition-all scale-90 shadow-lg shadow-brand-teal/20' : 'text-brand-dark font-medium';
                }}
              />
            </div>
            <div className="mt-10 flex items-center justify-center">
              <button 
                onClick={() => onNavigate?.('tasks')}
                className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 flex items-center gap-2 hover:text-brand-dark transition-all"
              >
                <ArrowUpRight className="w-4 h-4" /> Lihat Kalender Lengkap
              </button>
            </div>
          </section>
          
          <section className="bg-brand-dark p-10 rounded-[3rem] text-white overflow-hidden relative group border border-white/5 shadow-2xl">
             <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-brand-teal/20 rounded-full blur-3xl group-hover:bg-brand-teal/30 transition-all" />
             <div className="relative z-10">
               <div className="flex items-center gap-3 mb-6">
                 <div className="w-8 h-8 rounded-xl bg-brand-teal/20 flex items-center justify-center">
                   <Activity className="w-4 h-4 text-brand-teal" />
                 </div>
                 <h3 className="text-brand-yellow font-black text-[10px] uppercase tracking-[0.3em]">AI Workload Monitor</h3>
               </div>
               
               {topPerformer ? (
                 <div className="space-y-6">
                   <div>
                     <p className="text-2xl font-black uppercase tracking-tight leading-none mb-2">
                       {topPerformer.name}
                     </p>
                     <p className="text-[10px] font-black uppercase tracking-widest text-brand-grey opacity-50">Memegang beban kerja tertinggi</p>
                   </div>
                   
                   <div className="space-y-2">
                     <div className="flex justify-between items-end">
                       <span className="text-2xl font-black tracking-tighter text-brand-teal">{Math.round(Math.min((topPerformer.points / 10) * 100, 100))}%</span>
                       <span className="text-[9px] font-black uppercase tracking-widest opacity-40">{topPerformer.points} Pts</span>
                     </div>
                     <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((topPerformer.points / 10) * 100, 100)}%` }}
                          className={cn(
                            "h-full rounded-full",
                            topPerformer.points > 8 ? "bg-red-500" : topPerformer.points > 4 ? "bg-brand-yellow" : "bg-brand-teal"
                          )} 
                        />
                     </div>
                   </div>
                   
                   <button 
                    onClick={() => onNavigate?.('team')}
                    className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                   >
                     Lihat Detail Distribusi <ChevronRight className="w-4 h-4" />
                   </button>
                 </div>
               ) : (
                 <div className="py-10 text-center border border-dashed border-white/10 rounded-3xl">
                   <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Belum ada aktivitas terdeteksi.</p>
                 </div>
               )}
             </div>
          </section>
        </div>
      </div>
    </div>
  );
};
