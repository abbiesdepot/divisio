export type Difficulty = 'easy' | 'medium' | 'hard';
export type TaskStatus = 'not_started' | 'in_progress' | 'pending_approval' | 'done';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  skills?: string[];
  expertise?: string;
  experience?: string;
}

export type RoleType = 'owner' | 'leader' | 'coordinator' | 'member';

export interface Member {
  id: string;
  userId?: string;
  name: string;
  role: string; // This is the job title (e.g. "Designer")
  roleType: RoleType; // This is the permission level
  division?: string;
  orgId: string;
  skills?: string[];
  expertise?: string;
}

export interface TaskComment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: 'file' | 'link';
  uploadedBy: string;
  createdAt: string;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  deadline: string;
  difficulty: Difficulty;
  category?: string;
  assigneeId: string;
  status: TaskStatus;
  orgId: string;
  comments: TaskComment[];
  attachments: Attachment[];
}

export interface Organization {
  id: string;
  name: string;
  members: Member[];
  memberEmails: string[];
  joinCode?: string; // short code to allow joining
  subscription?: {
    tier: 'free' | 'silver' | 'gold' | 'diamond';
    expiresAt?: string | null;
    maxProjects: number;
    maxMembers: number;
  };
}

export interface Recommendation {
  memberId: string;
  memberName: string;
  score: number;
  explanation: string;
}

export interface AppState {
  users: User[];
  currentUser: User | null;
  organizations: Organization[];
  tasks: Task[];
  activeOrgId: string | null;
}
