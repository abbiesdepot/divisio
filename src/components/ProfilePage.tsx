import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { User, Sparkles, Save, ShieldCheck, Cpu } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export const ProfilePage: React.FC = () => {
  const { currentUser, updateProfile } = useApp();
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    expertise: currentUser?.expertise || '',
    experience: currentUser?.experience || '',
    skills: currentUser?.skills?.join(', ') || ''
  });
  const [isSaved, setIsSaved] = useState(false);

  if (!currentUser) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: formData.name,
      expertise: formData.expertise,
      experience: formData.experience,
      skills: formData.skills.split(',').map(s => s.trim()).filter(s => s !== '')
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <header className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-black text-brand-dark uppercase tracking-tight">Profil Pengguna</h1>
            <div className="h-6 w-px bg-gray-100 mx-2" />
            <div className="flex items-center gap-2 px-3 py-1 bg-brand-teal/5 rounded-full border border-brand-teal/10">
              <Cpu className="w-3 h-3 text-brand-teal" />
              <span className="text-[10px] font-black text-brand-teal uppercase tracking-widest">AI Enabled Profile</span>
            </div>
          </div>
          <p className="text-gray-400 font-medium italic">Optimalkan profil Anda agar <span className="text-brand-teal font-black uppercase text-xs tracking-widest">DIVISIO AI</span> dapat memberikan rekomendasi yang tepat.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="md:col-span-1 space-y-8">
           <div className="aspect-square bg-brand-grey rounded-[3rem] border border-gray-100 flex items-center justify-center relative overflow-hidden group">
              <User className="w-16 h-16 text-gray-200" />
              <div className="absolute inset-0 bg-brand-dark/0 group-hover:bg-brand-dark/5 transition-colors cursor-pointer flex items-center justify-center">
                 <p className="text-[10px] font-black uppercase text-white opacity-0 group-hover:opacity-100 tracking-widest">Ganti Foto</p>
              </div>
           </div>

           <div className="p-8 bg-brand-dark rounded-[2.5rem] text-white space-y-6">
              <div className="flex items-center gap-3">
                 <Sparkles className="w-5 h-5 text-brand-yellow" />
                 <h3 className="text-sm font-black uppercase tracking-tight">Informasi AI</h3>
              </div>
              <p className="text-xs text-brand-grey font-medium leading-relaxed italic opacity-70">
                Data di bawah ini akan dianalisis oleh AI untuk membantu Pemimpin Tim dalam mendistribusikan tugas secara adil dan efisien.
              </p>
              <div className="pt-4 border-t border-white/10 flex items-center gap-2">
                 <ShieldCheck className="w-4 h-4 text-brand-teal" />
                 <span className="text-[9px] font-black uppercase tracking-widest">Data Anda Aman</span>
              </div>
           </div>
        </div>

        <form onSubmit={handleSave} className="md:col-span-2 space-y-8 bg-brand-grey/30 p-10 rounded-[3.5rem] border border-gray-50">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Nama Lengkap</label>
              <input 
                required
                className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-teal outline-none transition-all font-black"
                value={formData.name}
                onChange={e => setFormData(s => ({ ...s, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Spesialisasi / Expertise</label>
              <input 
                placeholder="Contoh: UI/UX Designer, Laravel Developer"
                className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-teal outline-none transition-all font-black"
                value={formData.expertise}
                onChange={e => setFormData(s => ({ ...s, expertise: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Keahlian / Skills</label>
              <input 
                placeholder="Pisahkan dengan koma (misal: React, TypeScript, Figma)"
                className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-teal outline-none transition-all font-black"
                value={formData.skills}
                onChange={e => setFormData(s => ({ ...s, skills: e.target.value }))}
              />
              <p className="text-[9px] text-gray-400 font-medium italic mt-1 ml-1">* AI akan mencocokkan kata kunci ini dengan kebutuhan tugas.</p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Pengalaman Relevan</label>
              <textarea 
                rows={4}
                placeholder="Ceritakan proyek atau pengalaman yang menonjol..."
                className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-teal outline-none transition-all font-medium text-sm leading-relaxed"
                value={formData.experience}
                onChange={e => setFormData(s => ({ ...s, experience: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-4">
             {isSaved && (
               <motion.span 
                 initial={{ opacity: 0, x: 10 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="text-brand-teal text-[10px] font-black uppercase tracking-widest"
               >
                 Tersimpan Sempurna!
               </motion.span>
             )}
             <button 
              type="submit"
              className="flex items-center gap-3 bg-brand-dark hover:bg-brand-dark/95 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-brand-dark/20 transition-all active:scale-95"
             >
                <Save className="w-4 h-4" /> Simpan Profil
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};
