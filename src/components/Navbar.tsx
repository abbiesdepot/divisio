import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../AppContext';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  LogOut, 
  User, 
  ChevronDown, 
  Plus, 
  LogIn,
  Check
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Logo } from './Logo';

type Page = 'dashboard' | 'tasks' | 'team' | 'profile';

interface NavbarProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activePage, setActivePage }) => {
  const { 
    organizations, 
    activeOrgId, 
    setActiveOrg, 
    currentUser, 
    logout,
    addOrganization,
    joinOrganization 
  } = useApp();
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [joinRole, setJoinRole] = useState('');
  const [joinDivision, setJoinDivision] = useState('');

  const workspaceRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const activeOrg = organizations.find(o => o.id === activeOrgId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (workspaceRef.current && !workspaceRef.current.contains(event.target as Node)) {
        setIsWorkspaceOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tugas', icon: ClipboardList },
    { id: 'team', label: 'Tim', icon: Users },
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newOrgName.trim()) {
      addOrganization(newOrgName.trim());
      setNewOrgName('');
      setIsAdding(false);
      setIsWorkspaceOpen(false);
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.trim() && joinRole.trim() && joinDivision.trim()) {
      const success = joinOrganization(joinCode.trim(), joinRole.trim(), joinDivision.trim());
      if (success) {
        setJoinCode('');
        setJoinRole('');
        setJoinDivision('');
        setIsJoining(false);
        setIsWorkspaceOpen(false);
      } else {
        alert('Kode Ruang Kerja Tidak Valid');
      }
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-20 bg-white border-b border-gray-100 z-50 px-4 md:px-8 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <button 
          onClick={() => setActivePage('dashboard')}
          className="flex flex-col items-start hover:opacity-80 transition-opacity"
        >
          <Logo className="items-start" />
        </button>

        <div className="h-8 w-px bg-gray-100 mx-2 hidden lg:block" />

        {/* Workspace Selector */}
        <div className="relative" ref={workspaceRef}>
          <button
            onClick={() => setIsWorkspaceOpen(!isWorkspaceOpen)}
            className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-brand-grey border border-gray-100 hover:border-brand-teal transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-brand-dark text-brand-yellow flex items-center justify-center font-black text-xs">
              {activeOrg?.name.charAt(0)}
            </div>
            <div className="flex flex-col items-start min-w-[120px]">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ruang Kerja</span>
              <span className="text-xs font-black text-brand-dark uppercase tracking-tight truncate max-w-[150px]">
                {activeOrg?.name || 'Pilih Tim'}
              </span>
            </div>
            <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform", isWorkspaceOpen && "rotate-180")} />
          </button>

          {isWorkspaceOpen && (
            <div className="absolute top-14 left-0 w-80 bg-white border border-gray-100 rounded-[2rem] shadow-2xl overflow-hidden py-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-6 py-2 mb-4 border-b border-gray-50 pb-4">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Tim Anda</h3>
              </div>
              
              <div className="max-h-[300px] overflow-y-auto px-2 space-y-1">
                {organizations.map(org => (
                  <button
                    key={org.id}
                    onClick={() => {
                      setActiveOrg(org.id);
                      setIsWorkspaceOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all group",
                      activeOrgId === org.id ? "bg-brand-teal/5 text-brand-teal" : "hover:bg-brand-grey text-brand-dark"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs",
                        activeOrgId === org.id ? "bg-brand-teal text-white" : "bg-gray-100 text-gray-400"
                      )}>
                        {org.name.charAt(0)}
                      </div>
                      <span className="text-xs font-black uppercase tracking-tight">{org.name}</span>
                    </div>
                    {activeOrgId === org.id && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-50 px-4 space-y-2">
                {!isAdding && !isJoining ? (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setIsAdding(true)}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-dark text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all"
                    >
                      <Plus className="w-3 h-3" /> Buat Tim
                    </button>
                    <button
                      onClick={() => setIsJoining(true)}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-grey text-brand-dark border border-gray-100 text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
                    >
                      <LogIn className="w-3 h-3" /> Gabung Tim
                    </button>
                  </div>
                ) : isAdding ? (
                  <form onSubmit={handleCreate} className="space-y-3 p-2 bg-brand-grey rounded-2xl">
                    <input 
                      autoFocus
                      className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-1 ring-brand-teal"
                      placeholder="NAMA TIM"
                      value={newOrgName}
                      onChange={e => setNewOrgName(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <button type="submit" className="flex-1 py-2 bg-brand-teal text-white text-[9px] font-black uppercase tracking-widest rounded-lg">Buat</button>
                      <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-gray-400 text-[9px] font-black uppercase tracking-widest">Batal</button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleJoin} className="space-y-3 p-4 bg-brand-grey rounded-2xl">
                    <input 
                      autoFocus
                      className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2 text-[9px] font-black uppercase tracking-widest outline-none mb-2"
                      placeholder="KODE BERGABUNG"
                      value={joinCode}
                      onChange={e => setJoinCode(e.target.value)}
                    />
                    <select 
                      className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2 text-[9px] font-black uppercase tracking-widest outline-none mb-2"
                      value={joinRole}
                      onChange={e => setJoinRole(e.target.value)}
                      required
                    >
                      <option value="">PILIH PERAN</option>
                      <option value="Pemimpin Tim">Pemimpin Tim</option>
                      <option value="Bendahara">Bendahara</option>
                      <option value="Sekretaris">Sekretaris</option>
                      <option value="Koordinator">Koordinator</option>
                      <option value="PIC">PIC</option>
                      <option value="Anggota">Anggota</option>
                    </select>
                    <input 
                      className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2 text-[9px] font-black uppercase tracking-widest outline-none"
                      placeholder="DIVISI"
                      value={joinDivision}
                      onChange={e => setJoinDivision(e.target.value)}
                    />
                    <div className="flex gap-2 mt-3">
                      <button type="submit" className="flex-1 py-2 bg-brand-teal text-white text-[9px] font-black uppercase tracking-widest rounded-lg">Gabung Sekarang</button>
                      <button type="button" onClick={() => setIsJoining(false)} className="px-4 py-2 text-gray-400 text-[9px] font-black uppercase tracking-widest">Batal</button>
                    </div>
                  </form>
                )}
                {activeOrg?.joinCode && (
                  <div className="mt-3 text-[10px] text-gray-500 flex items-center gap-2">
                    <span className="font-black uppercase">Kode Bergabung:</span>
                    <input readOnly value={activeOrg.joinCode} className="bg-white border border-gray-100 rounded px-2 py-1 text-xs" />
                    <button onClick={() => { navigator.clipboard?.writeText(activeOrg.joinCode); }} className="px-2 py-1 bg-brand-teal text-white rounded text-[10px] font-black">Salin</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-1">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id as Page)}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-2xl transition-all text-xs font-black uppercase tracking-widest",
              activePage === item.id 
                ? "bg-brand-dark text-white shadow-lg shadow-brand-dark/10" 
                : "text-gray-400 hover:bg-brand-grey hover:text-brand-dark"
            )}
          >
            <item.icon className="w-3.5 h-3.5" />
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        {currentUser && (
          <div className="relative" ref={profileRef}>
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 group"
            >
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-[10px] font-black text-brand-dark uppercase tracking-widest">{currentUser.name}</span>
                <span className="text-[9px] text-gray-400 font-mono tracking-tighter">{currentUser.email}</span>
              </div>
              <div className="w-11 h-11 rounded-[1.25rem] bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center group-hover:bg-brand-teal/20 transition-all">
                <User className="w-5 h-5 text-brand-dark" />
              </div>
            </button>

            {isProfileOpen && (
              <div className="absolute top-14 right-0 w-56 bg-white border border-gray-100 rounded-[2rem] shadow-2xl overflow-hidden py-2 z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-6 py-4 border-b border-gray-50 mb-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Profil Pengguna</p>
                  <p className="text-xs font-black text-brand-dark uppercase truncate mt-1">{currentUser.name}</p>
                </div>
                <button 
                  onClick={() => {
                    setActivePage('profile');
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-6 py-4 text-brand-dark hover:bg-brand-grey transition-colors text-[10px] font-black uppercase tracking-widest"
                >
                  <User className="w-4 h-4" /> Pengaturan Profil
                </button>
                <button 
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-6 py-4 text-red-500 hover:bg-red-50 transition-colors text-[10px] font-black uppercase tracking-widest"
                >
                  <LogOut className="w-4 h-4" /> Keluar
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

