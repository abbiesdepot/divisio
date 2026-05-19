import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { motion } from 'motion/react';
import { LogIn, UserPlus, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { Logo } from './Logo';

export const AuthPage: React.FC = () => {
  const { login, register } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      const success = login(formData.email, formData.password);
      if (!success) {
        setError('Kredensial tidak valid. Periksa inputan Anda.');
      }
    } else {
      if (!formData.name || !formData.email || !formData.password) {
        setError('Semua kolom wajib diisi.');
        return;
      }
      register(formData.name, formData.email, formData.password);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-grey p-4 text-brand-dark">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Logo showTagline className="mb-6" />
        </div>

        <motion.div 
          layout
          className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-2xl relative overflow-hidden"
        >
          <div className="flex bg-gray-50 p-1.5 rounded-2xl mb-8">
            <button 
              onClick={() => setIsLogin(true)}
              className={cn(
                "flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all",
                isLogin ? "bg-brand-dark text-white shadow-xl shadow-brand-dark/20" : "text-gray-400 hover:text-gray-600"
              )}
            >
              Masuk
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={cn(
                "flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all",
                !isLogin ? "bg-brand-dark text-white shadow-xl shadow-brand-dark/20" : "text-gray-400 hover:text-gray-600"
              )}
            >
              Daftar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] pl-1">Nama Lengkap</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input 
                    type="text" 
                    required
                    placeholder="Masukkan nama Anda"
                    className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-12 py-4 focus:ring-2 focus:ring-brand-teal focus:border-brand-teal outline-none transition-all placeholder:text-gray-300"
                    value={formData.name}
                    onChange={e => setFormData(s => ({ ...s, name: e.target.value }))}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] pl-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input 
                  type="email" 
                  required
                  placeholder="nama@perusahaan.com"
                  className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-12 py-4 focus:ring-2 focus:ring-brand-teal focus:border-brand-teal outline-none transition-all placeholder:text-gray-300"
                  value={formData.email}
                  onChange={e => setFormData(s => ({ ...s, email: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] pl-1">Kata Sandi</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-12 py-4 focus:ring-2 focus:ring-brand-teal focus:border-brand-teal outline-none transition-all placeholder:text-gray-300"
                  value={formData.password}
                  onChange={e => setFormData(s => ({ ...s, password: e.target.value }))}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-[10px] font-black bg-red-50 p-2.5 rounded-lg border border-red-100">
                <AlertCircle className="w-3.5 h-3.5" />
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className="w-full bg-brand-dark hover:bg-brand-dark/95 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-brand-dark/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] mt-4"
            >
              {isLogin ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              {isLogin ? 'Masuk' : 'Buat Akun'}
            </button>
          </form>

          <p className="mt-8 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            Bagi kerja, <span className="text-brand-teal">Hasil lebih baik.</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
};
