import React, { useState, useEffect } from 'react';
import CustomerRegistration from './CustomerRegistration';
import AccountCreation from './AccountCreation';
import FixedDepositCreation from './FixedDepositCreation';
import AccountDetailsView from './AccountDetailsView';
import TransactionProcessing from './TransactionProcessing';
import AgentPerformance from './AgentPerformance';

interface AgentDashboardProps {
  sidebarCollapsed: boolean;
}

const AgentDashboard: React.FC<AgentDashboardProps> = ({ sidebarCollapsed }) => {
  const [activeSection, setActiveSection] = useState<string>(() => {
    const saved = localStorage.getItem('agentDashboard.activeSection');
    return saved || 'performance';
  });

  useEffect(() => {
    localStorage.setItem('agentDashboard.activeSection', activeSection);
  }, [activeSection]);

  const menuItems = [
    {
      id: 'performance',
      label: 'My Performance',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
        </svg>
      )
    },
    {
      id: 'register',
      label: 'Register Customer',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="8.5" cy="7" r="4"></circle>
          <line x1="20" y1="8" x2="20" y2="14"></line>
          <line x1="23" y1="11" x2="17" y2="11"></line>
        </svg>
      )
    },
    {
      id: 'account',
      label: 'Savings Account',
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
      id: 'fixed-deposit',
      label: 'Fixed Deposit',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23"></line>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
      )
    },
    {
      id: 'view-accounts',
      label: 'View Account Details',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      )
    },
    {
      id: 'transactions',
      label: 'Process Transaction',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23"></line>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
      )
    }
  ];

  const getSectionTitle = () => {
    const item = menuItems.find(item => item.id === activeSection);
    return item ? item.label : 'Dashboard';
  };

  // Render navigation in sidebar and content in main area using React Fragment
  return (
    <>
      {/* This part renders in the sidebar */}
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

      {/* This part renders in the main content area via portal-like effect */}
      {/* We'll need to render this via a different mechanism */}
    </>
  );
};

// Export a separate function to render the content
export const AgentDashboardContent: React.FC<{ activeSection: string }> = ({ activeSection }) => {
  const menuItems = [
    { id: 'performance', label: 'My Performance' },
    { id: 'register', label: 'Register Customer' },
    { id: 'account', label: 'Savings Account' },
    { id: 'fixed-deposit', label: 'Fixed Deposit' },
    { id: 'view-accounts', label: 'View Account Details' },
    { id: 'transactions', label: 'Process Transaction' }
  ];

  const getSectionTitle = () => {
    const item = menuItems.find(item => item.id === activeSection);
    return item ? item.label : 'Dashboard';
  };

  return (
    <div className="dashboard-content-wrapper">
      <header className="content-header">
        <h1>{getSectionTitle()}</h1>
      </header>

      <div className="content-body">
        {activeSection === 'register' && <CustomerRegistration />}
        {activeSection === 'account' && <AccountCreation />}
        {activeSection === 'fixed-deposit' && <FixedDepositCreation />}
        {activeSection === 'view-accounts' && <AccountDetailsView />}
        {activeSection === 'transactions' && <TransactionProcessing />}
        {activeSection === 'performance' && <AgentPerformance />}
      </div>
    </div>
  );
};

export default AgentDashboard;