import React, { useState } from 'react';
import { AppProvider, useApp } from './AppContext';
import { AuthPage } from './components/AuthPage';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { TeamManagement } from './components/TeamManagement';
import { TasksPage } from './components/TasksPage';
import { ProfilePage } from './components/ProfilePage';

type Page = 'dashboard' | 'tasks' | 'team' | 'profile';

function AppContent() {
  const { currentUser } = useApp();
  const [activePage, setActivePage] = useState<Page>('dashboard');

  if (!currentUser) {
    return <AuthPage />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard onNavigate={setActivePage} />;
    case 'team':
  return <TeamManagement onNavigate={setActivePage} />;
      case 'tasks':
        return <TasksPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <Dashboard onNavigate={setActivePage} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans selection:bg-brand-teal selection:text-white">
      <Navbar activePage={activePage} setActivePage={setActivePage} />
      <main className="pt-24 pb-12 px-4 md:px-8 max-w-[1600px] mx-auto min-h-[calc(100vh-80px)] overflow-x-hidden">
        {renderPage()}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
