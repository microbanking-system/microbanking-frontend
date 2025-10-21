import React, { useState, useEffect } from 'react';
import UserManagement from './UserManagement';
import BranchManagement from './BranchManagement';
import FDInterestManagement from './FDInterestManagement';
import SavingsInterestManagement from './SavingsInterestManagement';
import Reports from './Reports';

interface AdminDashboardProps {
  sidebarCollapsed: boolean;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ sidebarCollapsed }) => {
  const [activeSection, setActiveSection] = useState<string>(() => {
    const saved = localStorage.getItem('adminDashboard.activeSection');
    return saved || 'users';
  });

  useEffect(() => {
    localStorage.setItem('adminDashboard.activeSection', activeSection);
  }, [activeSection]);

  const menuItems = [
    {
      id: 'users',
      label: 'User Management',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      )
    },
    {
      id: 'branches',
      label: 'Branch Management',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 21h18"></path>
          <path d="M3 10h18"></path>
          <path d="M5 6l7-3 7 3"></path>
          <path d="M4 10v11"></path>
          <path d="M20 10v11"></path>
          <path d="M8 14v3"></path>
          <path d="M12 14v3"></path>
          <path d="M16 14v3"></path>
        </svg>
      )
    },
    {
      id: 'fd-interest',
      label: 'FD Interest',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23"></line>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
      )
    },
    {
      id: 'savings-interest',
      label: 'Savings Interest',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path>
          <path d="M12 18V6"></path>
        </svg>
      )
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      )
    }
  ];

  const getSectionTitle = () => {
    const item = menuItems.find(item => item.id === activeSection);
    return item ? item.label : 'Dashboard';
  };

  return (
    <>
      {/* Sidebar Navigation */}
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => (
            <li key={item.id}>
              <button 
                className={activeSection === item.id ? 'active' : ''}
                onClick={() => setActiveSection(item.id)}
                title={sidebarCollapsed ? item.label : ''}
              >
                <span className="menu-icon">{item.icon}</span>
                {!sidebarCollapsed && <span className="menu-label">{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Main Content Area */}
      <div className="dashboard-content-wrapper">
        <header className="content-header">
          <h1>{getSectionTitle()}</h1>
        </header>

        <div className="content-body">
          {activeSection === 'users' && <UserManagement />}
          {activeSection === 'branches' && <BranchManagement />}
          {activeSection === 'fd-interest' && <FDInterestManagement />}
          {activeSection === 'savings-interest' && <SavingsInterestManagement />}
          {activeSection === 'reports' && <Reports />}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;