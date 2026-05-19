import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppState, Organization, Task, Member, User, Attachment, RoleType, TaskComment, Recommendation } from './types';

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
  register: (name: string, email: string, password: string) => void;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  joinOrganization: (orgId: string, role: string, division: string, roleType?: RoleType) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'teamsync_data_v4'; // Bump version

const INITIAL_DATA: AppState = {
  users: [],
  currentUser: null,
  organizations: [
    {
      id: 'default-org',
      name: 'Workspace Global',
      memberEmails: [], // Nobody in by default, need to join or be created
      members: [
        { id: 'd1', name: 'Budi Santoso', role: 'Pemimpin Tim', roleType: 'leader', division: 'Desain', orgId: 'default-org', expertise: 'UI/UX Design', skills: ['Figma', 'Adobe XD', 'Prototyping', 'Creative Direction'] },
        { id: 'd2', name: 'Ani Wijaya', role: 'Pengembang Senior', roleType: 'member', division: 'Teknik', orgId: 'default-org', expertise: 'Fullstack Development', skills: ['React', 'TypeScript', 'Node.js', 'System Architecture'] },
        { id: 'd3', name: 'Siti Aminah', role: 'Ketua Pemasaran', roleType: 'member', division: 'Pemasaran', orgId: 'default-org', expertise: 'Growth Marketing', skills: ['SEO', 'Content Strategy', 'Social Media', 'Data Analytics'] },
        { id: 'd4', name: 'Rudi Hermawan', role: 'Penasihat Hukum', roleType: 'member', division: 'Legal', orgId: 'default-org', expertise: 'Legal Documentation', skills: ['Legal Writing', 'Compliance', 'Risk Assessment', 'Contracts'] },
        { id: 'd5', name: 'Dewi Lestari', role: 'Asisten Legal', roleType: 'member', division: 'Legal', orgId: 'default-org', expertise: 'Administrative Legal', skills: ['Documentation', 'Research', 'Case Archiving'] },
        { id: 'd6', name: 'Bambang Subiakto', role: 'Sekretaris', roleType: 'leader', division: 'Manajemen', orgId: 'default-org', expertise: 'Event Planning', skills: ['Scheduling', 'Event Management', 'Public Relations', 'Logistics'] },
        { id: 'd7', name: 'Indah Permata', role: 'Bendahara', roleType: 'leader', division: 'Manajemen', orgId: 'default-org', expertise: 'Finance Control', skills: ['Budgeting', 'Financial Reporting', 'Excel', 'Taxes'] },
        { id: 'd8', name: 'Lukman Hakim', role: 'Koordinator Keuangan', roleType: 'member', division: 'Keuangan', orgId: 'default-org', expertise: 'Accounting', skills: ['Bookkeeping', 'Invoicing', 'Expense Tracking'] },
        { id: 'd9', name: 'Siska Putri', role: 'PIC Operasional', roleType: 'leader', division: 'Manajemen', orgId: 'default-org', expertise: 'Operational Management', skills: ['Workflow Optimization', 'Quality Control', 'Team Coordination'] },
        { id: 'd10', name: 'Eko Prasetyo', role: 'Multimedia Specialist', roleType: 'member', division: 'Media', orgId: 'default-org', expertise: 'Photography & Video', skills: ['Adobe Premiere', 'After Effects', 'Studio Lighting', 'Video Editing'] },
      ],
    },
  ],
  tasks: [],
  activeOrgId: null,
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure dummy data exists even if we have saved data (migration)
        if (!parsed.organizations.find((o: any) => o.id === 'default-org')) {
          parsed.organizations.push(INITIAL_DATA.organizations[0]);
        }
        return parsed;
      } catch (e) {
        return INITIAL_DATA;
      }
    }
    return INITIAL_DATA;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const register = (name: string, email: string, password: string) => {
    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      email,
      password,
    };
    setState(s => ({
      ...s,
      users: [...s.users, newUser],
      currentUser: newUser,
      activeOrgId: null, // New user has no orgs yet
    }));
  };

  const login = (email: string, password: string) => {
    const user = state.users.find(u => u.email === email && u.password === password);
    if (user) {
      // Find first org for this user
      const firstOrg = state.organizations.find(o => o.memberEmails.includes(email));
      setState(s => ({ ...s, currentUser: user, activeOrgId: firstOrg?.id || null }));
      return true;
    }
    return false;
  };

  const logout = () => {
    setState(s => ({ ...s, currentUser: null, activeOrgId: null }));
  };

  const joinOrganization = (orgId: string, role: string, division: string, roleType: RoleType = 'member') => {
    const org = state.organizations.find(o => o.id === orgId);
    if (org && state.currentUser) {
      if (org.memberEmails.includes(state.currentUser.email)) {
        setState(s => ({ ...s, activeOrgId: orgId }));
        return true;
      }
      
      const newMember: Member = {
        id: crypto.randomUUID(),
        userId: state.currentUser.id,
        name: state.currentUser.name,
        role,
        roleType,
        division,
        orgId
      };

      setState(s => ({
        ...s,
        organizations: s.organizations.map(o => 
          o.id === orgId ? { 
            ...o, 
            memberEmails: [...o.memberEmails, state.currentUser!.email],
            members: [...o.members, newMember]
          } : o
        ),
        activeOrgId: orgId
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
      roleType: 'leader',
      division: 'Management',
       orgId
    };

    const newOrg: Organization = {
      id: orgId,
      name,
      members: [creatorMember],
      memberEmails: state.currentUser ? [state.currentUser.email] : [],
    };
    setState(s => ({
      ...s,
      organizations: [...s.organizations, newOrg],
      activeOrgId: newOrg.id,
    }));
  };

  const addMember = (orgId: string, member: Omit<Member, 'id' | 'orgId'>) => {
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
    setState(s => ({
      ...s,
      tasks: s.tasks.map(t => (t.id === taskId ? { ...t, status } : t)),
    }));
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
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: {
            name: task.name,
            description: task.description,
            category: task.category,
            difficulty: task.difficulty,
            deadline: task.deadline
          },
          members: org.members,
          history: state.tasks.filter(t => t.orgId === org.id && t.status === 'done').slice(-5)
        })
      });
      return await response.json();
    } catch (error) {
      console.error("Failed to get AI recommendations", error);
      return [];
    }
  };

  const getAIWorkloadInsights = async (orgId: string) => {
    const org = state.organizations.find(o => o.id === orgId);
    const orgTasks = state.tasks.filter(t => t.orgId === orgId);
    if (!org) return { overallStatus: 'Unknown', insights: [] };

    try {
      const response = await fetch('/api/workload-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          members: org.members,
          tasks: orgTasks
        })
      });
      return await response.json();
    } catch (error) {
      console.error("Failed to get AI workload insights", error);
      return { overallStatus: 'Error', insights: [] };
    }
  };

  const getOrgWorkload = (orgId: string) => {
    const workloadMap: Record<string, number> = {};
    const orgTasks = state.tasks.filter(t => t.orgId === orgId && t.status !== 'done');
    
    // Total Capacity logic: 10 points = 100% workload for estimation purposes
    orgTasks.forEach(t => {
      let points = t.difficulty === 'easy' ? 2 : t.difficulty === 'medium' ? 5 : 8;
      
      // Deadline pressure factor
      if (t.deadline) {
        const now = new Date();
        const due = new Date(t.deadline);
        const diffDays = (due.getTime() - now.getTime()) / (1000 * 3600 * 24);
        if (diffDays < 1) points *= 1.5; // Urgent
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
        getOrgWorkload,
        getAIRecommendations,
        getAIWorkloadInsights,
        updateProfile,
        register,
        login,
        logout,
        joinOrganization,
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
