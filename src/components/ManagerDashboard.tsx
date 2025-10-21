import React, { useState, useEffect } from 'react';
import TeamManagement from './TeamManagement';
import TransactionReports from './TransactionReports';
import CustomerAccounts from './CustomerAccounts';

interface ManagerDashboardProps {
  sidebarCollapsed: boolean;
}

const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ sidebarCollapsed }) => {
  const [activeSection, setActiveSection] = useState<string>(() => {
    const saved = localStorage.getItem('managerDashboard.activeSection');
      // Map any old 'overview' saved value to 'customers'
      if (!saved || saved === 'overview') return 'customers';
      return saved;
  });

  useEffect(() => {
    localStorage.setItem('managerDashboard.activeSection', activeSection);
  }, [activeSection]);

  const menuItems = [
    {
      id: 'team',
      label: 'Team Management',
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
      id: 'transactions',
      label: 'Transaction Summary',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23"></line>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
      )
    },
    {
      id: 'customers',
      label: 'Customer Accounts',
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
          
          {activeSection === 'customers' && <CustomerAccounts />}
          {activeSection === 'team' && <TeamManagement />}
          {activeSection === 'transactions' && <TransactionReports />}
          
        </div>
      </div>
    </>
  );
};

export default ManagerDashboard;