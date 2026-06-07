import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Trash2, 
  User, 
  Zap, 
  Grid, 
  List,
  ChevronRight,
  ClipboardList,
  Search,
  Filter,
  MessageSquare,
  Paperclip,
  Link as LinkIcon,
  X,
  Send,
  ExternalLink,
  BrainCircuit,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Difficulty, TaskStatus, Task, TaskComment, Attachment, Recommendation } from '../types';

const AIRecommendations: React.FC<{
  taskId?: string;
  onSelect: (memberId: string) => void;
  selectedId?: string;
  isCreating?: boolean;
  newTaskData?: any;
}> = ({ taskId, onSelect, selectedId, isCreating, newTaskData }) => {
  const { getAIRecommendations } = useApp();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const recs = await getAIRecommendations(isCreating ? newTaskData : taskId!);
      setRecommendations(recs);
    } catch (err) {
      setError('Gagal memuat rekomendasi AI');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isCreating && taskId) {
      fetchRecs();
    }
  }, [taskId]);

 const canAnalyze = isCreating ? (newTaskData?.name?.length > 3) : true;
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BrainCircuit className={cn("w-4 h-4", isLoading ? "text-brand-yellow" : "text-brand-teal")} />
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">AI Insights Recommendations</h3>
        </div>
        <button 
          type="button"
          onClick={fetchRecs}
          disabled={isLoading || !canAnalyze}
          className="flex items-center gap-2 text-[9px] font-black uppercase text-brand-teal tracking-widest hover:underline disabled:opacity-30 disabled:no-underline"
        >
          {isLoading ? (
            <><Loader2 className="w-3 h-3 animate-spin" /> Menganalisis...</>
          ) : (
            <><Zap className="w-3 h-3" /> {recommendations.length > 0 ? 'Analisis Ulang' : 'Dapatkan Rekomendasi AI'}</>
          )}
        </button>
      </div>

      {isLoading ? (
        <div className="bg-brand-grey border border-dashed border-gray-200 rounded-[2rem] p-8 flex flex-col items-center justify-center gap-3">
          <div className="relative">
            <Loader2 className="w-8 h-8 text-brand-teal animate-spin" />
            <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-brand-yellow animate-pulse" />
          </div>
          <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">DIVISIO AI sedang mencocokkan tim terbaik...</span>
        </div>
      ) : recommendations.length > 0 ? (
        <div className="grid grid-cols-1 gap-3">
          {recommendations.sort((a, b) => b.score - a.score).map((rec) => (
            <button
              type="button"
              key={rec.memberId}
              onClick={() => onSelect(rec.memberId)}
              className={cn(
                "flex items-start gap-4 p-5 rounded-2xl border transition-all text-left group",
                selectedId === rec.memberId 
                  ? "bg-brand-teal text-white border-brand-teal shadow-xl shadow-brand-teal/20" 
                  : "bg-white border-gray-100 hover:border-brand-teal/50"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex flex-col items-center justify-center text-[10px] font-black shrink-0",
                selectedId === rec.memberId ? "bg-white/20 text-white" : "bg-brand-grey text-brand-dark"
              )}>
                <span>{rec.score}%</span>
                <span className="text-[7px] uppercase leading-none mt-0.5">Match</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className={cn(
                    "text-[11px] font-black uppercase tracking-tight truncate",
                    selectedId === rec.memberId ? "text-white" : "text-brand-dark"
                  )}>{rec.memberName}</p>
                </div>
                <p className={cn(
                  "text-[10px] font-medium italic leading-snug line-clamp-2",
                  selectedId === rec.memberId ? "text-white/80" : "text-gray-400"
                )}>"{rec.explanation}"</p>
              </div>
              <div className="shrink-0 pt-1">
                {selectedId === rec.memberId ? (
                  <CheckCircle2 className="w-4 h-4 text-white" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-gray-200 group-hover:border-brand-teal/30" />
                )}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="px-6 py-8 bg-brand-grey/50 rounded-3xl border border-dashed border-gray-200 flex flex-col items-center text-center">
           {!canAnalyze ? (
             <p className="text-[10px] font-medium text-gray-400 italic">Isi nama dan deskripsi tugas di atas untuk melihat rekomendasi AI.</p>
           ) : (
             <div className="space-y-4">
                <p className="text-[10px] font-medium text-gray-400 italic max-w-[240px]">
                  Klik tombol di atas untuk menganalisis kecocokan anggota berdasarkan keterampilan dan beban kerja.
                </p>
             </div>
           )}
        </div>
      )}
    </section>
  );
};

export const TasksPage: React.FC = () => {
  const { 
    organizations, 
    activeOrgId, 
    tasks, 
    addTask, 
    deleteTask, 
    updateTaskStatus, 
    getOrgWorkload, 
    currentUser,
    addComment,
    addAttachment
  } = useApp();
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [isAdding, setIsAdding] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  
  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    deadline: new Date().toISOString().slice(0, 16),
    difficulty: 'medium' as Difficulty,
    category: 'General',
    assigneeId: '',
  });

  const activeOrg = organizations.find(o => o.id === activeOrgId);
  const currentUserMember = activeOrg?.members.find(m => m.userId === currentUser?.id);
  const isPrivileged = !!currentUserMember && ['owner','leader','coordinator'].includes(currentUserMember.roleType);

  if (!activeOrg) return null;

  const workload = getOrgWorkload(activeOrgId!);
  
  // Apply Search and Filters
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesAssignee = assigneeFilter === 'all' || t.assigneeId === assigneeFilter;
    return matchesSearch && matchesStatus && matchesAssignee;
  });

  const orgTasks = filteredTasks;
  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  const getSuggestedMember = () => {
    if (activeOrg.members.length === 0) return null;
    return [...activeOrg.members].sort((a, b) => (workload[a.id] || 0) - (workload[b.id] || 0))[0];
  };

  const suggestedMember = getSuggestedMember();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.assigneeId) {
      addTask({ ...formData, orgId: activeOrgId! });
      setFormData({
        name: '',
        description: '',
        deadline: new Date().toISOString().split('T')[0],
        difficulty: 'medium',
        category: 'General',
        assigneeId: '',
      });
      setIsAdding(false);
    }
  };

  const categories = [
    'General',
    'Design',
    'Technology',
    'Documentation',
    'Event Planning',
    'Marketing',
    'Legal',
    'Finance',
    'Media'
  ];

  const columns: { id: TaskStatus; label: string }[] = [
    { id: 'not_started', label: 'Belum Mulai' },
    { id: 'in_progress', label: 'Sedang Berjalan' },
    { id: 'pending_approval', label: 'Menunggu Persetujuan' },
    { id: 'done', label: 'Selesai' },
  ];

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-black text-brand-dark uppercase tracking-tight">Tugas Tim</h1>
            <div className="h-6 w-px bg-gray-100 mx-2" />
            <div className="flex p-1 bg-brand-grey rounded-xl border border-gray-100">
              <button 
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  viewMode === 'list' ? "bg-white shadow-sm text-brand-teal" : "text-gray-400 hover:text-brand-dark"
                )}
              >
                <List className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('kanban')}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  viewMode === 'kanban' ? "bg-white shadow-sm text-brand-teal" : "text-gray-400 hover:text-brand-dark"
                )}
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-gray-400 font-medium italic">Kelola dan tugaskan pekerjaan untuk <span className="text-brand-teal font-black uppercase text-xs tracking-widest">{activeOrg.name}</span></p>
        </div>
        
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center justify-center gap-3 bg-brand-dark hover:bg-brand-dark/95 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-brand-dark/20 transition-all active:scale-95"
        >
          {isAdding ? 'Batal' : '+ Tugas Baru'}
        </button>
      </header>

      {/* Search & Filter Bar */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6">
        <div className="flex-1 relative">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
           <input 
             type="text" 
             placeholder="Cari tugas atau deskripsi..."
             className="w-full bg-brand-grey border border-gray-100 rounded-2xl pl-12 pr-6 py-3.5 focus:ring-2 focus:ring-brand-teal outline-none transition-all font-medium text-sm"
             value={searchQuery}
             onChange={e => setSearchQuery(e.target.value)}
           />
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-brand-grey rounded-2xl border border-gray-100">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select 
              className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none border-none"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
            >
              <option value="all">Semua Status</option>
              <option value="not_started">Belum Mulai</option>
              <option value="in_progress">Sedang Berjalan</option>
              <option value="pending_approval">Menunggu Persetujuan</option>
              <option value="done">Selesai</option>
            </select>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-brand-grey rounded-2xl border border-gray-100">
            <User className="w-3.5 h-3.5 text-gray-400" />
            <select 
              className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none border-none max-w-[150px]"
              value={assigneeFilter}
              onChange={e => setAssigneeFilter(e.target.value)}
            >
              <option value="all">Semua Anggota</option>
              {activeOrg.members.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-2xl space-y-10"
          >
            <div className="flex items-center justify-between border-b border-gray-50 pb-8">
              <div>
                <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight">New Task</h2>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Fill in the details below</p>
              </div>
              {suggestedMember && (
                <div className="flex items-center gap-3 bg-brand-teal/5 text-brand-teal px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-brand-teal/10">
                  <Zap className="w-4 h-4 fill-brand-teal" />
                  Recommended: {suggestedMember.name}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Task Name</label>
                  <input 
                    autoFocus
                    required
                    type="text" 
                    placeholder="e.g. Design Homepage"
                    className="w-full bg-brand-grey border border-gray-100 rounded-2xl px-6 py-5 focus:ring-2 focus:ring-brand-teal outline-none transition-all font-bold placeholder:text-gray-300"
                    value={formData.name}
                    onChange={e => setFormData(s => ({ ...s, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Task Description</label>
                  <textarea 
                    rows={4}
                    placeholder="What needs to be done?"
                    className="w-full bg-brand-grey border border-gray-100 rounded-2xl px-6 py-5 focus:ring-2 focus:ring-brand-teal outline-none transition-all resize-none font-medium placeholder:text-gray-300"
                    value={formData.description}
                    onChange={e => setFormData(s => ({ ...s, description: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Tenggat Waktu</label>
                    <input 
                      required
                      type="datetime-local" 
                      className="w-full bg-brand-grey border border-gray-100 rounded-2xl px-6 py-5 focus:ring-2 focus:ring-brand-teal outline-none transition-all font-black"
                      value={formData.deadline}
                      onChange={e => setFormData(s => ({ ...s, deadline: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Kategori</label>
                    <select 
                      className="w-full bg-brand-grey border border-gray-100 rounded-2xl px-6 py-5 focus:ring-2 focus:ring-brand-teal outline-none transition-all font-black uppercase text-xs"
                      value={formData.category}
                      onChange={e => setFormData(s => ({ ...s, category: e.target.value }))}
                    >
                      {categories.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Prioritas</label>
                    <select 
                      className="w-full bg-brand-grey border border-gray-100 rounded-2xl px-6 py-5 focus:ring-2 focus:ring-brand-teal outline-none transition-all font-black uppercase text-xs"
                      value={formData.difficulty}
                      onChange={e => setFormData(s => ({ ...s, difficulty: e.target.value as Difficulty }))}
                    >
                      <option value="easy">Mudah (1pt)</option>
                      <option value="medium">Sedang (2pt)</option>
                      <option value="hard">Sulit (3pt)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Assign To</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <select 
                      required
                      className="w-full bg-brand-grey border border-gray-100 rounded-2xl px-6 py-5 focus:ring-2 focus:ring-brand-teal outline-none transition-all font-black uppercase text-xs"
                      value={formData.assigneeId}
                      onChange={e => setFormData(s => ({ ...s, assigneeId: e.target.value }))}
                    >
                      <option value="">Select member...</option>
                      {activeOrg.members.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.name} - {m.expertise || m.role} ({Math.round((workload[m.id] || 0) * 10)}%)
                        </option>
                      ))}
                    </select>

                    <div className="space-y-4">
                       <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-300 ml-1">AI Smart Recommendations</p>
                       <AIRecommendations 
                        isCreating
                        newTaskData={formData}
                        selectedId={formData.assigneeId}
                        onSelect={(mid) => setFormData(s => ({ ...s, assigneeId: mid }))}
                       />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-gray-50">
                  <button 
                    type="button" 
                    onClick={() => setIsAdding(false)} 
                    className="px-8 py-5 font-black uppercase text-[10px] tracking-widest text-gray-400 hover:text-brand-dark transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="bg-brand-dark hover:bg-black text-white px-12 py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-brand-dark/20 transition-all active:scale-95"
                  >
                    Create Task
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-[600px]">
        {tasks.filter(t => t.orgId === activeOrgId).length > 0 ? (
          orgTasks.length > 0 ? (
            viewMode === 'list' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {orgTasks.map((task) => {
                  const assignee = activeOrg.members.find(m => m.id === task.assigneeId);
                  return (
                    <motion.div 
                      layout
                      key={task.id}
                      className="bg-white rounded-[2.5rem] border border-gray-100 p-8 hover:shadow-2xl transition-all group relative border-l-8 border-l-brand-teal shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex gap-2">
                          <span className={cn(
                            "px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest",
                            task.difficulty === 'hard' ? 'bg-red-50 text-red-500 border border-red-100' : task.difficulty === 'medium' ? 'bg-brand-yellow/10 text-brand-dark border border-brand-yellow/20' : 'bg-brand-teal/5 text-brand-teal border border-brand-teal/10'
                          )}>
                            {task.difficulty}
                          </span>
                          {(task.comments?.length > 0 || task.attachments?.length > 0) && (
                            <div className="flex gap-2">
                              {task.comments?.length > 0 && (
                                <span className="flex items-center gap-1 text-[9px] font-black text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                                  <MessageSquare className="w-3 h-3" /> {task.comments.length}
                                </span>
                              )}
                              {task.attachments?.length > 0 && (
                                <span className="flex items-center gap-1 text-[9px] font-black text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                                  <Paperclip className="w-3 h-3" /> {task.attachments.length}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTaskId(task.id);
                            }}
                            className="text-brand-teal hover:bg-brand-teal/10 p-2 rounded-xl transition-all"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                          {isPrivileged && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteTask(task.id);
                              }}
                              className="text-gray-200 hover:text-red-500 transition-colors p-2"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div 
                        onClick={() => setSelectedTaskId(task.id)}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <h3 className="text-xl font-black text-brand-dark uppercase tracking-tight leading-tight group-hover:text-brand-teal transition-colors truncate">{task.name}</h3>
                          {task.status === 'pending_approval' && (
                             <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-yellow/20 text-brand-yellow text-[8px] font-black uppercase tracking-widest border border-brand-yellow/10 shrink-0">
                               <AlertCircle className="w-2.5 h-2.5" /> Verifikasi
                             </span>
                           )}
                        </div>
                        <p className="text-[11px] font-medium text-gray-400 line-clamp-2 mb-8 italic">"{task.description || 'No description provided.'}"</p>
                      </div>

                      <div className="space-y-4 pt-6 border-t border-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-brand-grey text-brand-dark border border-gray-100 flex items-center justify-center text-[10px] font-black">
                              {assignee?.name.charAt(0)}
                            </div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{assignee?.name || 'Unassigned'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-300">
                            <CalendarIcon className="w-3.5 h-3.5" />
                            <span className="text-[9px] font-black uppercase tracking-widest">{new Date(task.deadline).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-6">
                           <div className="flex items-center gap-2">
                             <div className={cn(
                               "w-2 h-2 rounded-full",
                               task.status === 'done' ? 'bg-green-500' : task.status === 'in_progress' ? 'bg-brand-teal animate-pulse' : 'bg-gray-200'
                             )} />
                             <span className="text-[9px] font-black uppercase text-gray-400 tracking-[0.2em]">
                               {task.status.replace('_', ' ')}
                             </span>
                           </div>
                           
                           <div className="relative group/menu">
                              <button className="text-[9px] font-black uppercase text-brand-teal tracking-widest hover:underline flex items-center gap-1">
                                Status <ChevronRight className="w-3 h-3" />
                              </button>
                              <div className="absolute right-0 bottom-6 w-40 bg-white border border-gray-100 rounded-2xl shadow-2xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-20 overflow-hidden divide-y divide-gray-50">
                                {columns.filter(c => {
                                  if (c.id === task.status) return false;
                                  if (c.id === 'done') return false; // Fixed flow
                                  return true;
                                }).map(c => (
                                  <button
                                    key={c.id}
                                    onClick={() => updateTaskStatus(task.id, c.id)}
                                    className="w-full text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-dark hover:bg-brand-grey transition-colors"
                                  >
                                    {c.label}
                                  </button>
                                ))}
                              </div>
                           </div>
                        </div>

                        {/* Approval Actions */}
                        {isPrivileged && task.status === 'pending_approval' && (
                          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
                            <button 
                              onClick={() => updateTaskStatus(task.id, 'done')}
                              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => updateTaskStatus(task.id, 'in_progress')}
                              className="flex-1 bg-brand-yellow hover:bg-brand-yellow/90 text-brand-dark py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all"
                            >
                              Revision
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {columns.map((column) => (
                  <div key={column.id} className="flex flex-col bg-brand-grey rounded-[3rem] border border-gray-100 overflow-hidden">
                    <div className="p-8 flex items-center justify-between bg-white border-b border-gray-50">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-2 h-2 rounded-full", 
                          column.id === 'done' ? 'bg-green-500' : column.id === 'in_progress' ? 'bg-brand-teal animate-pulse' : 'bg-gray-300'
                        )} />
                        <h3 className="font-black text-xs text-brand-dark uppercase tracking-[0.2em]">{column.label}</h3>
                      </div>
                      <span className="text-[10px] font-black text-gray-400 bg-brand-grey px-4 py-1.5 rounded-xl border border-gray-100">
                        {orgTasks.filter(t => t.status === column.id).length}
                      </span>
                    </div>

                    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                      {orgTasks
                        .filter(t => t.status === column.id)
                        .map((task) => {
                          const assignee = activeOrg.members.find(m => m.id === task.assigneeId);
                          return (
                            <motion.div
                              layoutId={task.id}
                              key={task.id}
                              className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative border-l-4 border-l-brand-teal"
                            >
                              <div className="flex justify-between items-start mb-4">
                                <span className={cn(
                                  "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                                  task.difficulty === 'hard' ? 'bg-red-50 text-red-600' : task.difficulty === 'medium' ? 'bg-brand-yellow/20 text-brand-dark' : 'bg-brand-teal/10 text-brand-teal'
                                )}>
                                  {task.difficulty}
                                </span>
                                
                                <div className="relative group/menu">
                                  <button className="text-gray-200 hover:text-brand-teal transition-colors">
                                    <ChevronRight className="w-4 h-4" />
                                  </button>
                                  <div className="absolute right-0 top-6 w-48 bg-white border border-gray-100 rounded-2xl shadow-2xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-20 overflow-hidden divide-y divide-gray-50">
                                    {columns.filter(c => {
                                      if (c.id === task.status) return false;
                                      if (c.id === 'done') return false; // Enforce approval
                                      return true;
                                    }).map(c => (
                                      <button
                                        key={c.id}
                                        onClick={() => updateTaskStatus(task.id, c.id)}
                                        className="w-full text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-dark hover:bg-brand-grey transition-colors"
                                      >
                                        {c.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              <h4 className="font-black text-brand-dark uppercase tracking-tight mb-6 line-clamp-2 leading-tight">{task.name}</h4>

                              {/* Kanban Approval Actions */}
                              {isPrivileged && task.status === 'pending_approval' && (
                                <div className="flex gap-2 mb-6 p-3 bg-brand-grey rounded-2xl border border-gray-100 shadow-inner">
                                   <button 
                                    onClick={() => updateTaskStatus(task.id, 'done')}
                                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all"
                                  >
                                    Approve
                                  </button>
                                  <button 
                                    onClick={() => updateTaskStatus(task.id, 'in_progress')}
                                    className="flex-1 bg-brand-yellow hover:bg-brand-yellow/90 text-brand-dark py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all"
                                  >
                                    Revision
                                  </button>
                                </div>
                              )}

                              <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                <div className="flex items-center gap-3">
                                   <div className="w-7 h-7 rounded-lg bg-brand-teal text-white flex items-center justify-center text-[10px] font-black">
                                    {assignee?.name.charAt(0)}
                                  </div>
                                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate max-w-[90px]">{assignee?.name}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-gray-300">
                                  <CalendarIcon className="w-3.5 h-3.5" />
                                  <span className="text-[10px] font-black tracking-widest uppercase">{new Date(task.deadline).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="py-32 bg-white rounded-[3rem] border border-dashed border-gray-200 text-center space-y-6">
              <div className="w-24 h-24 bg-brand-grey rounded-[2rem] flex items-center justify-center mx-auto border border-gray-100 shadow-inner">
                <Search className="w-10 h-10 text-gray-200" />
              </div>
              <div className="space-y-2">
                <p className="text-brand-dark font-black text-2xl uppercase tracking-tight">Tidak Ada Hasil</p>
                <p className="text-gray-400 font-medium italic max-w-xs mx-auto">Tidak ada tugas yang sesuai dengan pencarian atau filter Anda.</p>
              </div>
              <button 
                onClick={() => {
                   setSearchQuery('');
                   setStatusFilter('all');
                   setAssigneeFilter('all');
                }}
                className="px-8 py-3 bg-brand-teal text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:shadow-xl hover:shadow-brand-teal/20 transition-all active:scale-95"
              >
                Reset Filter
              </button>
            </div>
          )
        ) : (
          <div className="col-span-full py-32 bg-white rounded-[3rem] border border-dashed border-gray-200 text-center space-y-6">
            <div className="w-24 h-24 bg-brand-grey rounded-[2rem] flex items-center justify-center mx-auto border border-gray-100 shadow-inner">
              <ClipboardList className="w-10 h-10 text-gray-200" />
            </div>
            <div className="space-y-2">
              <p className="text-brand-dark font-black text-2xl uppercase tracking-tight">Belum Ada Tugas</p>
              <p className="text-gray-400 font-medium italic max-w-xs mx-auto">Belum ada tugas di workspace ini. Buat tugas pertama Anda untuk memulai.</p>
            </div>
            <button 
              onClick={() => setIsAdding(true)}
              className="px-8 py-3 bg-brand-teal text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:shadow-xl hover:shadow-brand-teal/20 transition-all active:scale-95"
            >
              + Buat Tugas Pertama
            </button>
          </div>
        )}
      </div>
      <TaskDetailModal 
        task={selectedTask} 
        onClose={() => setSelectedTaskId(null)} 
        activeOrg={activeOrg}
        addComment={addComment}
        addAttachment={addAttachment}
      />
    </div>
  );
};

const TaskDetailModal: React.FC<{
  task?: Task;
  onClose: () => void;
  activeOrg: any;
  addComment: (taskId: string, text: string) => void;
  addAttachment: (taskId: string, attachment: Omit<Attachment, 'id' | 'createdAt'>) => void;
}> = ({ task, onClose, activeOrg, addComment, addAttachment }) => {
  const [newComment, setNewComment] = useState('');
  const [isAddingAttachment, setIsAddingAttachment] = useState(false);
  const [editingAttachmentId, setEditingAttachmentId] = useState<string | null>(null);
  const [attachmentForm, setAttachmentForm] = useState({ name: '', url: '', type: 'link' as 'link' | 'file' });
  const { currentUser, updateAttachment, updateTaskStatus } = useApp();
  const currentUserMember = activeOrg.members?.find((m: any) => m.userId === currentUser?.id);
  const isPrivileged = !!currentUserMember && ['owner','leader','coordinator'].includes(currentUserMember.roleType);

  if (!task) return null;

  const assignee = activeOrg.members.find((m: any) => m.id === task.assigneeId);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      addComment(task.id, newComment);
      setNewComment('');
    }
  };

  const handleAttachmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (attachmentForm.name && attachmentForm.url) {
      if (editingAttachmentId) {
        updateAttachment(task.id, editingAttachmentId, attachmentForm);
      } else {
        addAttachment(task.id, {
          ...attachmentForm,
          uploadedBy: currentUser?.name || 'Anonim'
        });
      }
      setAttachmentForm({ name: '', url: '', type: 'link' });
      setIsAddingAttachment(false);
      setEditingAttachmentId(null);
    }
  };

  const startEdit = (attachment: Attachment) => {
    setAttachmentForm({ name: attachment.name, url: attachment.url, type: attachment.type });
    setEditingAttachmentId(attachment.id);
    setIsAddingAttachment(true);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm" 
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white w-full max-w-4xl h-full max-h-[85vh] rounded-[3rem] shadow-2xl relative z-60 overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-8 md:p-12 border-b border-gray-50 flex justify-between items-start">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <span className={cn(
                  "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest",
                  task.difficulty === 'hard' ? 'bg-red-50 text-red-500 border border-red-100' : task.difficulty === 'medium' ? 'bg-brand-yellow/10 text-brand-dark border border-brand-yellow/20' : 'bg-brand-teal/5 text-brand-teal border border-brand-teal/10'
                )}>
                  Prioritas {task.difficulty === 'hard' ? 'Tinggi' : task.difficulty === 'medium' ? 'Sedang' : 'Rendah'}
                </span>
                {task.category && (
                  <span className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-brand-teal/5 text-brand-teal border border-brand-teal/10">
                    {task.category}
                  </span>
                )}
                <span className={cn(
                   "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-gray-50 text-gray-400"
                )}>
                  {task.status === 'not_started' ? 'Belum Mulai' : 
                   task.status === 'in_progress' ? 'Sedang Berjalan' : 
                   task.status === 'pending_approval' ? 'Menunggu Persetujuan' : 'Selesai'}
                </span>
              </div>
              <h2 className="text-4xl font-black text-brand-dark uppercase tracking-tight leading-none">{task.name}</h2>
              <div className="flex items-center gap-4 text-gray-400 font-medium italic">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-widest font-black text-brand-teal">{assignee?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-widest font-black text-gray-400">{new Date(task.deadline).toLocaleString()}</span>
                </div>
              </div>
              
              {/* Approval Row in Modal */}
              {isPrivileged && task.status === 'pending_approval' && (
                <div className="flex gap-4 p-4 bg-brand-teal/5 rounded-2xl border border-brand-teal/10 mt-6 slide-in-bottom">
                  <div className="flex-1 space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-teal">Verifikasi Diperlukan</p>
                    <p className="text-[11px] font-medium text-gray-400">Tinjau penyelesaian tugas ini untuk memverifikasi kualitas kerja.</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        updateTaskStatus(task.id, 'done');
                        onClose();
                      }}
                      className="px-6 py-2 bg-green-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:shadow-lg transition-all"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => {
                        updateTaskStatus(task.id, 'in_progress');
                        onClose();
                      }}
                      className="px-6 py-2 bg-brand-yellow text-brand-dark rounded-xl text-[10px] font-black uppercase tracking-widest hover:shadow-lg transition-all"
                    >
                      Request Revision
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button onClick={onClose} className="p-4 bg-brand-grey hover:bg-gray-200 transition-all rounded-2xl">
              <X className="w-6 h-6 text-brand-dark" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 md:p-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Description & Recommendations */}
            <div className="space-y-12">
              <section>
                <div className="flex items-center justify-between mb-4">
                   <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Detail Tugas</h3>
                   {isPrivileged && (
                     <div className="flex items-center gap-2 text-brand-yellow bg-brand-yellow/5 px-2 py-1 rounded border border-brand-yellow/10">
                        <Zap className="w-3 h-3 fill-brand-yellow" />
                        <span className="text-[8px] font-black uppercase">Editor Mode</span>
                     </div>
                   )}
                </div>
                <p className="text-brand-dark font-medium leading-relaxed italic border-l-4 border-brand-teal/20 pl-6 py-2 bg-brand-grey/30 rounded-r-2xl">
                  "{task.description || 'Tidak ada instruksi detail.'}"
                </p>
              </section>

              {isPrivileged && task.status !== 'done' && (
                <AIRecommendations 
                  taskId={task.id} 
                  selectedId={task.assigneeId}
                  onSelect={(mid) => {
                    // Quick reassign logic if needed, but for now just visual
                    console.log("Selected member for task", mid);
                  }}
                />
              )}

              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Aset Operasional</h3>
                  <button 
                    onClick={() => setIsAddingAttachment(true)}
                    className="text-brand-teal text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" /> Lampirkan Sumber
                  </button>
                </div>

                <AnimatePresence>
                  {isAddingAttachment && (
                    <motion.form 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      onSubmit={handleAttachmentSubmit}
                      className="bg-brand-grey p-6 rounded-3xl space-y-4 mb-4 overflow-hidden"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <input 
                          required
                          placeholder="NAMA SUMBER"
                          className="bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest outline-none"
                          value={attachmentForm.name}
                          onChange={e => setAttachmentForm(s => ({ ...s, name: e.target.value }))}
                        />
                         <select 
                          className="bg-white border border-gray-100 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none"
                          value={attachmentForm.type}
                          onChange={e => setAttachmentForm(s => ({ ...s, type: e.target.value as any }))}
                        >
                          <option value="link">Tautan</option>
                          <option value="file">File (Mock)</option>
                        </select>
                      </div>
                      <input 
                        required
                        placeholder="URL SUMBER"
                        className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest outline-none"
                        value={attachmentForm.url}
                        onChange={e => setAttachmentForm(s => ({ ...s, url: e.target.value }))}
                      />
                      <div className="flex gap-2">
                        <button type="submit" className="flex-1 py-3 bg-brand-teal text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:shadow-lg transition-all">
                          {editingAttachmentId ? 'Perbarui Aset' : 'Daftarkan Aset'}
                        </button>
                        <button type="button" onClick={() => { setIsAddingAttachment(false); setEditingAttachmentId(null); }} className="px-6 py-3 text-gray-400 text-[9px] font-black uppercase tracking-widest">Batal</button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

                <div className="space-y-3">
                  {task.attachments?.map((attachment) => {
                    const isLink = attachment.type === 'link';
                    return (
                      <div 
                        key={attachment.id}
                        className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl hover:border-brand-teal transition-all group shadow-sm"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-brand-grey rounded-xl flex items-center justify-center text-brand-dark border border-gray-50">
                            {isLink ? <LinkIcon className="w-4 h-4" /> : <Paperclip className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-brand-dark uppercase tracking-tight leading-none mb-1">{attachment.name}</p>
                            <p className="text-[9px] font-medium text-gray-400 uppercase tracking-widest italic">
                              Diunggah oleh {attachment.uploadedBy}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => startEdit(attachment)}
                            className="text-[9px] font-black uppercase text-brand-teal hover:underline opacity-0 group-hover:opacity-100 transition-all"
                          >
                            Edit
                          </button>
                          <a 
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-4 h-4 text-gray-200 group-hover:text-brand-teal transition-colors" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                  {(!task.attachments || task.attachments.length === 0) && (
                    <div className="py-12 border border-dashed border-gray-100 rounded-[2rem] text-center">
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-300">Belum ada sumber tertaut.</p>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Discussion */}
            <div className="flex flex-col h-full bg-brand-grey p-8 md:p-10 rounded-[2.5rem]">
               <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                 <MessageSquare className="w-4 h-4" /> Alur Diskusi
               </h3>

               <div className="flex-1 space-y-6 overflow-y-auto mb-8 pr-2">
                 {task.comments?.map((comment) => (
                   <div key={comment.id} className={cn(
                     "flex flex-col gap-2 max-w-[85%]",
                     comment.userId === currentUser?.id ? "ml-auto items-end" : "items-start"
                   )}>
                     <div className="flex items-baseline gap-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">{comment.userName}</span>
                        <span className="text-[8px] font-medium text-gray-300">
                          {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                     </div>
                     <div className={cn(
                       "px-6 py-4 rounded-3xl text-xs font-medium leading-relaxed shadow-sm",
                       comment.userId === currentUser?.id ? "bg-brand-dark text-white rounded-tr-none" : "bg-white text-brand-dark rounded-tl-none border border-gray-50"
                     )}>
                       {comment.text}
                     </div>
                   </div>
                 ))}
                 {(!task.comments || task.comments.length === 0) && (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-20">
                       <MessageSquare className="w-12 h-12 text-gray-300 mb-4" />
                       <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Inisialisasi saluran sinkronisasi.</p>
                    </div>
                 )}
               </div>

               <form onSubmit={handleAddComment} className="flex gap-2">
                 <input 
                   placeholder="TULIS KOMENTAR..."
                   className="flex-1 bg-white border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 ring-brand-teal transition-all text-xs font-medium"
                   value={newComment}
                   onChange={e => setNewComment(e.target.value)}
                 />
                 <button 
                   type="submit"
                   className="w-14 h-14 bg-brand-teal text-white flex items-center justify-center rounded-2xl hover:bg-brand-teal/90 transition-all active:scale-95 shadow-lg shadow-brand-teal/20"
                 >
                   <Send className="w-5 h-5" />
                 </button>
               </form>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
