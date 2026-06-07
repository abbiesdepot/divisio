import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppState, Organization, Task, Member, User, Attachment, RoleType, TaskComment, Recommendation } from './types';

import { GoogleGenerativeAI } from '@google/generative-ai';

interface AppContextType extends AppState {
  setActiveOrg: (id: string) => void;
  addOrganization: (name: string) => void;
  addMember: (orgId: string, member: Omit<Member, 'id' | 'orgId'>) => void;
  addTask: (task: Omit<Task, 'id' | 'status' | 'comments' | 'attachments'>) => void;
  updateTaskStatus: (taskId: string, status: Task['status']) => void;
  deleteTask: (taskId: string) => void;
  addComment: (taskId: string, text: string) => void;
  addAttachment: (taskId: string, attachment: Omit<Attachment, 'id' | 'createdAt'>) => void;
  updateAttachment: (taskId: string, attachmentId: string, updates: Partial<Attachment>) => void;
  getOrgWorkload: (orgId: string) => Record<string, number>;
  getAIRecommendations: (taskId: string) => Promise<Recommendation[]>;
  getAIWorkloadInsights: (orgId: string) => Promise<{ overallStatus: string; insights: any[] }>;
  updateProfile: (updates: Partial<User>) => void;
  updateMemberRole: (orgId: string, memberId: string, newRole: string) => void;
  removeMember: (orgId: string, memberId: string) => void;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  joinOrganization: (joinCodeOrOrgId: string, role: string, division: string, roleType?: RoleType) => boolean;
  chargeAdditionalMember: (orgId: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);
const STORAGE_KEY = 'teamsync_data_v4'; // shared data
const SESSION_KEY = 'teamsync_session_v4'; // per-window session

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY || "");

  const generateJoinCode = (name: string) => {
    const base = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 20);

    return base || `team-${Math.random().toString(36).slice(2, 8)}`;
  };

  const getSubscriptionDefaults = (tier: 'free' | 'silver' | 'gold' | 'diamond') => {
    switch (tier) {
      case 'silver': return { tier, expiresAt: null, maxProjects: 5, maxMembers: 50 };
      case 'gold': return { tier, expiresAt: null, maxProjects: 20, maxMembers: 150 };
      case 'diamond': return { tier, expiresAt: null, maxProjects: 100, maxMembers: 1000 };
      default: return { tier: 'free' as const, expiresAt: null, maxProjects: 1, maxMembers: 20 };
    }
  };

  const INITIAL_DATA: AppState = {
  users: [
    { id: 'd1', name: 'Budi Santoso', email: 'budi@divisio.com', password: 'password123' },
    { id: 'd2', name: 'Ani Wijaya', email: 'ani@divisio.com', password: 'password123' },
    { id: 'd3', name: 'Siti Aminah', email: 'siti@divisio.com', password: 'password123' },
  ],
  currentUser: null,
  organizations: [
    {
      id: 'default-org',
      name: 'Workspace Global',
      memberEmails: ['budi@divisio.com', 'ani@divisio.com', 'siti@divisio.com'],
      joinCode: 'global-001',
      subscription: getSubscriptionDefaults('free'),
      members: [
        { id: 'd1', userId: 'd1', name: 'Budi Santoso', role: 'Pemimpin Tim', roleType: 'leader', division: 'Desain', orgId: 'default-org', expertise: 'UI/UX Design', skills: ['Figma', 'Adobe XD', 'Prototyping', 'Creative Direction'] },
        { id: 'd2', userId: 'd2', name: 'Ani Wijaya', role: 'Pengembang Senior', roleType: 'member', division: 'Teknik', orgId: 'default-org', expertise: 'Fullstack Development', skills: ['React', 'TypeScript', 'Node.js', 'System Architecture'] },
        { id: 'd3', userId: 'd3', name: 'Siti Aminah', role: 'Ketua Pemasaran', roleType: 'member', division: 'Pemasaran', orgId: 'default-org', expertise: 'Growth Marketing', skills: ['SEO', 'Content Strategy', 'Social Media', 'Data Analytics'] },
        { id: 'd4', name: 'Rudi Hermawan', role: 'Penasihat Hukum', roleType: 'member', division: 'Legal', orgId: 'default-org', expertise: 'Legal Documentation', skills: ['Legal Writing', 'Compliance', 'Risk Assessment', 'Contracts'] },
        { id: 'd5', userId: 'd5', name: 'Dewi Lestari', role: 'Asisten Legal', roleType: 'member', division: 'Legal', orgId: 'default-org', expertise: 'Administrative Legal', skills: ['Documentation', 'Research', 'Case Archiving'] },
        { id: 'd6', userId: 'd6', name: 'Bambang Subiakto', role: 'Sekretaris', roleType: 'leader', division: 'Manajemen', orgId: 'default-org', expertise: 'Event Planning', skills: ['Scheduling', 'Event Management', 'Public Relations', 'Logistics'] },
        { id: 'd7', userId: 'd7', name: 'Indah Permata', role: 'Bendahara', roleType: 'leader', division: 'Manajemen', orgId: 'default-org', expertise: 'Finance Control', skills: ['Budgeting', 'Financial Reporting', 'Excel', 'Taxes'] },
        { id: 'd8', userId: 'd8', name: 'Lukman Hakim', role: 'Koordinator Keuangan', roleType: 'member', division: 'Keuangan', orgId: 'default-org', expertise: 'Accounting', skills: ['Bookkeeping', 'Invoicing', 'Expense Tracking'] },
        { id: 'd9', userId: 'd9', name: 'Siska Putri', role: 'PIC Operasional', roleType: 'leader', division: 'Manajemen', orgId: 'default-org', expertise: 'Operational Management', skills: ['Workflow Optimization', 'Quality Control', 'Team Coordination'] },
        { id: 'd10', userId: 'd10', name: 'Eko Prasetyo', role: 'Multimedia Specialist', roleType: 'member', division: 'Media', orgId: 'default-org', expertise: 'Photography & Video', skills: ['Adobe Premiere', 'After Effects', 'Studio Lighting', 'Video Editing'] },
      ],
    },
  ],
  tasks: [],
  activeOrgId: null,
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const sessionValue = sessionStorage.getItem(SESSION_KEY);

    let shared: Partial<AppState> = {};
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as AppState;
        shared = parsed;
        if (!parsed.organizations?.find((o: any) => o.id === 'default-org')) {
          shared.organizations = [...(parsed.organizations || []), INITIAL_DATA.organizations[0]];
        }
      } catch (e) {
        shared = { organizations: INITIAL_DATA.organizations, tasks: INITIAL_DATA.tasks, users: INITIAL_DATA.users };
      }
    } else {
      shared = { organizations: INITIAL_DATA.organizations, tasks: INITIAL_DATA.tasks, users: INITIAL_DATA.users };
    }

    let session: Partial<AppState> = {};
    if (sessionValue) {
      try {
        session = JSON.parse(sessionValue) as Partial<AppState>;
      } catch (e) {
        session = {};
      }
    }

    return {
      ...INITIAL_DATA,
      users: shared.users ?? INITIAL_DATA.users,
      organizations: shared.organizations ?? INITIAL_DATA.organizations,
      tasks: shared.tasks ?? INITIAL_DATA.tasks,
      currentUser: session.currentUser ?? null,
      activeOrgId: session.activeOrgId ?? null,
    };
  });

  useEffect(() => {
    const sharedState = {
      users: state.users,
      organizations: state.organizations,
      tasks: state.tasks,
      // Do not store currentUser or activeOrgId globally
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sharedState));
  }, [state.organizations, state.tasks, state.users]);

  useEffect(() => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      currentUser: state.currentUser,
      activeOrgId: state.activeOrgId,
    }));
  }, [state.currentUser, state.activeOrgId]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue) as Partial<AppState>;
          setState(s => ({
            ...s,
            users: parsed.users ?? s.users,
            organizations: parsed.organizations ?? s.organizations,
            tasks: parsed.tasks ?? s.tasks,
          }));
        } catch (error) {
          console.error('Failed to sync state across windows:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const register = async (name: string, email: string, password: string) => {
    // Local registration: store in app state so login works without a backend.
    if (state.users.some(user => user.email === email)) {
      return false;
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      email,
      password,
    };

    setState(s => ({
      ...s,
      users: [...s.users, newUser],
      currentUser: { ...newUser, password: undefined },
      activeOrgId: null,
    }));

    return true;
  };

  const login = async (email: string, password: string) => {
    // Local login using stored users in application state.
    const user = state.users.find(u => u.email === email && u.password === password);
    if (!user) {
      return false;
    }

    const membershipOrg = state.organizations.find(org => org.memberEmails.includes(email) || org.members.some(member => member.userId === user.id));
    setState(s => ({
      ...s,
      currentUser: { ...user, password: undefined },
      activeOrgId: membershipOrg ? membershipOrg.id : null,
    }));

    return true;
  };

  const logout = () => {
    setState(s => ({ ...s, currentUser: null, activeOrgId: null }));
  };

  const joinOrganization = (joinCodeOrOrgId: string, role: string, division: string, roleType: RoleType = 'member') => {
    const normalizedKey = joinCodeOrOrgId.trim().toLowerCase();
    const org = state.organizations.find(o =>
      o.id === joinCodeOrOrgId ||
      o.joinCode?.trim().toLowerCase() === normalizedKey
    );
    if (org && state.currentUser) {
      if (org.memberEmails.includes(state.currentUser.email)) {
        setState(s => ({ ...s, activeOrgId: org.id }));
        return true;
      }

      const max = org.subscription?.maxMembers ?? 20;
      if (org.members.length >= max) {
        return false;
      }

      const newMember: Member = {
        id: crypto.randomUUID(),
        userId: state.currentUser.id,
        name: state.currentUser.name,
        role,
        roleType,
        division,
        orgId: org.id
      };

      setState(s => ({
        ...s,
        organizations: s.organizations.map(o => 
          o.id === org.id ? { 
            ...o, 
            memberEmails: [...o.memberEmails, state.currentUser!.email],
            members: [...o.members, newMember]
          } : o
        ),
        activeOrgId: org.id
      }));
      return true;
    }
    return false;
  };

  const setActiveOrg = (id: string) => setState(s => ({ ...s, activeOrgId: id }));

  const addOrganization = (name: string) => {
    const orgId = crypto.randomUUID();
    const creatorMember: Member = {
      id: crypto.randomUUID(),
      userId: state.currentUser?.id,
      name: state.currentUser ? state.currentUser.name : 'Unknown User',
      role: 'Founding Member',
      roleType: 'owner',
      division: 'Management',
       orgId
    };

    const newOrg: Organization = {
      id: orgId,
      name,
      members: [creatorMember],
      memberEmails: state.currentUser ? [state.currentUser.email] : [],
      joinCode: generateJoinCode(name),
      subscription: getSubscriptionDefaults('free')
    };
    setState(s => ({
      ...s,
      organizations: [...s.organizations, newOrg],
      activeOrgId: newOrg.id,
    }));
  };

  const addMember = (orgId: string, member: Omit<Member, 'id' | 'orgId'>) => {
    const org = state.organizations.find(o => o.id === orgId);
    if (!org) return;
    const max = org.subscription?.maxMembers ?? 20;
    if (org.members.length >= max) {
      // In a real app, charge or prompt for upgrade. For now block.
      return;
    }
    const newMember: Member = { ...member, id: crypto.randomUUID(), orgId };
    setState(s => ({
      ...s,
      organizations: s.organizations.map(org =>
        org.id === orgId ? { ...org, members: [...org.members, newMember] } : org
      ),
    }));
  };

  const addTask = (task: Omit<Task, 'id' | 'status' | 'comments' | 'attachments'>) => {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      status: 'not_started',
      comments: [],
      attachments: [],
    };
    setState(s => ({
      ...s,
      tasks: [...s.tasks, newTask],
    }));
  };

  const addComment = (taskId: string, text: string) => {
    if (!state.currentUser) return;
    const comment: TaskComment = {
      id: crypto.randomUUID(),
      userId: state.currentUser.id,
      userName: state.currentUser.name,
      text,
      createdAt: new Date().toISOString(),
    };
    setState(s => ({
      ...s,
      tasks: s.tasks.map(t => t.id === taskId ? { ...t, comments: [...t.comments, comment] } : t)
    }));
  };

  const addAttachment = (taskId: string, attachment: Omit<Attachment, 'id' | 'createdAt'>) => {
    const newAttachment: Attachment = {
      ...attachment,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setState(s => ({
      ...s,
      tasks: s.tasks.map(t => t.id === taskId ? { ...t, attachments: [...t.attachments, newAttachment] } : t)
    }));
  };

  const updateAttachment = (taskId: string, attachmentId: string, updates: Partial<Attachment>) => {
    setState(s => ({
      ...s,
      tasks: s.tasks.map(t => t.id === taskId ? {
        ...t,
        attachments: t.attachments.map(a => a.id === attachmentId ? { ...a, ...updates } : a)
      } : t)
    }));
  };

  const updateTaskStatus = (taskId: string, status: Task['status']) => {
    setState(s => {
      const task = s.tasks.find(t => t.id === taskId);
      if (!task) return s;

      const org = s.organizations.find(o => o.id === task.orgId || o.id === s.activeOrgId);
      const currentUserMember = org && s.currentUser ? org.members.find(m => m.userId === s.currentUser!.id) : undefined;
      const isPrivileged = currentUserMember && ['owner','leader','coordinator'].includes(currentUserMember.roleType);

      // Enforce approval flow: non-privileged users cannot set to 'done' directly
      let newStatus = status;
      if (status === 'done' && !isPrivileged) {
        newStatus = 'pending_approval';
      }

      return {
        ...s,
        tasks: s.tasks.map(t => (t.id === taskId ? { ...t, status: newStatus } : t)),
      };
    });
  };

  const updateMemberRole = (orgId: string, memberId: string, newRole: string) => {
    setState(s => ({
      ...s,
      organizations: s.organizations.map(org =>
        org.id === orgId ? {
          ...org,
          members: org.members.map(m => m.id === memberId ? { ...m, role: newRole } : m)
        } : org
      ),
    }));
  };

  const removeMember = (orgId: string, memberId: string) => {
    setState(s => ({
      ...s,
      organizations: s.organizations.map(org =>
        org.id === orgId ? {
          ...org,
          members: org.members.filter(m => m.id !== memberId),
          // Note: If you want to also remove their email from memberEmails, you'd filter it here too.
        } : org
      ),
    }));
  };

  const chargeAdditionalMember = (orgId: string) => {
    // Placeholder: integrate payment provider here. Return true if charged.
    console.warn('chargeAdditionalMember called for', orgId);
    return true;
  };

  const deleteTask = (taskId: string) => {
    setState(s => ({
      ...s,
      tasks: s.tasks.filter(t => t.id !== taskId),
    }));
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!state.currentUser) return;
    const updatedUser = { ...state.currentUser, ...updates };
    setState(s => ({
      ...s,
      currentUser: updatedUser,
      users: s.users.map(u => u.id === updatedUser.id ? updatedUser : u)
    }));
  };

const callAIEndpoint = async <T,>(path: string, payload: object, fallback: T): Promise<T> => {
    try {
      const response = await fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI endpoint error', path, response.status, errorText);
        return fallback;
      }

      return (await response.json()) as T;
    } catch (error) {
      console.error('AI fetch failed:', error);
      return fallback;
    }
  };

  // HELPER: Pembersih format AI agar JSON.parse tidak pernah crash
  const parseAIJSON = (text: string) => {
    try {
      let cleanText = text.replace(/```json/gi, '').replace(/```/gi, '').trim();
      const firstBrace = cleanText.indexOf('{');
      const firstBracket = cleanText.indexOf('[');
      let startIndex = 0;
      if (firstBrace !== -1 && firstBracket !== -1) startIndex = Math.min(firstBrace, firstBracket);
      else if (firstBrace !== -1) startIndex = firstBrace;
      else if (firstBracket !== -1) startIndex = firstBracket;

      const lastBrace = cleanText.lastIndexOf('}');
      const lastBracket = cleanText.lastIndexOf(']');
      let endIndex = cleanText.length;
      if (lastBrace !== -1 && lastBracket !== -1) endIndex = Math.max(lastBrace, lastBracket) + 1;
      else if (lastBrace !== -1) endIndex = lastBrace + 1;
      else if (lastBracket !== -1) endIndex = lastBracket + 1;

      return JSON.parse(cleanText.substring(startIndex, endIndex));
    } catch (err) {
      console.error("Gagal Parsing AI JSON. Teks asli:", text);
      throw new Error("Format AI tidak valid.");
    }
  };

  const getAIRecommendations = async (taskOrId: string | Partial<Task>) => {
    let task: Partial<Task> | undefined;
    if (typeof taskOrId === 'string') {
      task = state.tasks.find(t => t.id === taskOrId);
    } else {
      task = taskOrId;
    }

    const org = state.organizations.find(o => o.id === (task?.orgId || state.activeOrgId));
    if (!task || !org) return [];

    try {
      const apiKey = process.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Key Hilang di file .env");

      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });
      const currentWorkload = getOrgWorkload(org.id);
      
      const membersData = org.members.map(m => ({
        id: m.id,
        nama: m.name,
        keahlian: m.expertise || m.role,
        beban_kerja: currentWorkload[m.id] || 0
      }));

      const prompt = `
        Tugas baru: ${task.name} 
        Kesulitan: ${task.difficulty || 'medium'}
        Daftar Anggota: ${JSON.stringify(membersData)}
        
        Pilih 3 anggota paling cocok berdasarkan keahlian dan beban kerja (prioritaskan beban terendah).
        OUTPUT WAJIB ARRAY JSON MURNI TANPA MARKDOWN: 
        [{"memberId": "id_anggota", "memberName": "nama_anggota", "score": 90, "explanation": "alasan spesifik 1 kalimat"}]
      `;

      const result = await model.generateContent(prompt);
      return parseAIJSON(result.response.text());
    } catch (error: any) {
      console.error("AI Error (Rekomen):", error);
      return [];
    }
  };

  const getAIWorkloadInsights = async (orgId: string) => {
    const org = state.organizations.find(o => o.id === orgId);
    const orgTasks = state.tasks.filter(t => t.orgId === orgId && t.status !== 'done');
    if (!org) return { overallStatus: 'Unknown', insights: [] };

    try {
      const apiKey = process.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Key Hilang di file .env");

      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });
      const currentWorkload = getOrgWorkload(org.id);
      
      const membersData = org.members.map(m => ({
        id: m.id,
        nama: m.name,
        poin_beban: currentWorkload[m.id] || 0
      }));

      const prompt = `
        Daftar Beban Kerja: ${JSON.stringify(membersData)}
        Total Tugas Aktif: ${orgTasks.length}
        
        Evaluasi apakah tim ini sehat, ada yang overload, atau terlalu santai.
        OUTPUT WAJIB OBJECT JSON MURNI TANPA MARKDOWN:
        {
          "overallStatus": "Sehat / Kritis / Perlu Perhatian",
          "insights": [
            {"memberId": "id_anggota", "status": "Normal / Sibuk / Santai", "message": "pesan evaluasi singkat"}
          ]
        }
      `;

      const result = await model.generateContent(prompt);
      return parseAIJSON(result.response.text());
    } catch (error: any) {
      console.error("AI Error (Workload):", error);
      return { 
        overallStatus: 'Error API', 
        insights: [{"memberId": "error", "status": "Error", "message": error.message || "Gagal menghubungi Gemini."}] 
      };
    }
  };

  
 

  const getOrgWorkload = (orgId: string) => {
    const workloadMap: Record<string, number> = {};
    const orgTasks = state.tasks.filter(t => t.orgId === orgId && (t.status === 'in_progress' || t.status === 'not_started'));
    orgTasks.forEach(t => {
      // FIX: Cegah tugas kosong agar tidak merusak sistem Workload
      if (!t.assigneeId) return; 

      let points = t.difficulty === 'easy' ? 2 : t.difficulty === 'medium' ? 5 : 8;
      
      if (t.deadline) {
        const now = new Date();
        const due = new Date(t.deadline);
        const diffDays = (due.getTime() - now.getTime()) / (1000 * 3600 * 24);
        if (diffDays < 1) points *= 1.5; 
        else if (diffDays < 3) points *= 1.2;
      }

      workloadMap[t.assigneeId] = (workloadMap[t.assigneeId] || 0) + points;
    });

    return workloadMap;
  };

  const userOrganizations = state.currentUser 
    ? state.organizations.filter(org => org.memberEmails.includes(state.currentUser!.email))
    : [];

  const userTasks = state.tasks.filter(t => userOrganizations.some(o => o.id === t.orgId));

  return (
    <AppContext.Provider
      value={{
        ...state,
        organizations: userOrganizations,
        tasks: userTasks,
        setActiveOrg,
        addOrganization,
        addMember,
        addTask,
        updateTaskStatus,
        deleteTask,
        addComment,
        addAttachment,
        updateAttachment,
        getOrgWorkload,
        getAIRecommendations,
        getAIWorkloadInsights,
        updateProfile,
        register,
        login,
        logout,
        joinOrganization,
        updateMemberRole,
        removeMember,
        chargeAdditionalMember,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
