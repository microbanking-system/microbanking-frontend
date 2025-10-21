import React from 'react';
import bankLogo from '../assets/imgs/B_Trust_logo_white.png';

const AgentOverview: React.FC = () => {
  // Performance metrics data
  const performanceData = {
    totalCustomers: 15420,
    totalAccounts: 18650,
    totalDeposits: 12550000000, // ₹125.5 Cr
    totalWithdrawals: 8750000000, // ₹87.5 Cr
    activeAccounts: 16890,
    inactiveAccounts: 1760,
    savingsPlans: [
      { type: 'Basic Savings', count: 8500 },
      { type: 'Premium Savings', count: 4200 },
      { type: 'Senior Citizen', count: 2100 }
    ],
    fdPlans: {
      active: 3450,
      matured: 890,
      totalBalance: 4850000000 // ₹48.5 Cr
    },
    monthlyTransactions: [
      { month: 'Jan', deposits: 850, withdrawals: 620 },
      { month: 'Feb', deposits: 920, withdrawals: 680 },
      { month: 'Mar', deposits: 880, withdrawals: 710 },
      { month: 'Apr', deposits: 1050, withdrawals: 750 },
      { month: 'May', deposits: 1120, withdrawals: 820 },
      { month: 'Jun', deposits: 1200, withdrawals: 890 }
    ],
    branchPerformance: [
      { branch: 'Main', accounts: 5200, deposits: 4500 },
      { branch: 'East', accounts: 4100, deposits: 3200 },
      { branch: 'West', accounts: 3800, deposits: 2900 },
      { branch: 'North', accounts: 3500, deposits: 2400 }
    ],
    newCustomers: [
      { month: 'Jan', count: 320 },
      { month: 'Feb', count: 380 },
      { month: 'Mar', count: 420 },
      { month: 'Apr', count: 510 },
      { month: 'May', count: 580 },
      { month: 'Jun', count: 650 }
    ],
    genderDistribution: {
      male: 58,
      female: 40,
      other: 2
    },
    topDepositors: [
      { name: 'Rajesh Kumar', amount: 8500000 },
      { name: 'Priya Sharma', amount: 7200000 },
      { name: 'Amit Patel', amount: 6800000 },
      { name: 'Sneha Reddy', amount: 5900000 },
      { name: 'Vikram Singh', amount: 5400000 }
    ]
  };

  // Quick access services for agents
  const quickServices = [
    { 
      icon: '👤', 
      title: 'Register Customer', 
      desc: 'Onboard new customers quickly and efficiently',
      action: 'register'
    },
    { 
      icon: '💰', 
      title: 'Savings Account', 
      desc: 'Open new savings accounts for customers',
      action: 'account'
    },
    { 
      icon: '📈', 
      title: 'Fixed Deposit', 
      desc: 'Create fixed deposit accounts with competitive rates',
      action: 'fixed-deposit'
    },
    { 
      icon: '🔍', 
      title: 'View Accounts', 
      desc: 'Access detailed customer account information',
      action: 'view-accounts'
    },
    { 
      icon: '💳', 
      title: 'Transactions', 
      desc: 'Process deposits, withdrawals, and transfers',
      action: 'transactions'
    },
    { 
      icon: '📊', 
      title: 'My Performance', 
      desc: 'Track your performance metrics and achievements',
      action: 'performance'
    }
  ];

  const aboutBank = {
    vision: 'To be the most trusted microbanking institution, empowering financial inclusion through innovative solutions.',
    mission: 'Providing accessible, secure, and customer-centric banking services that transform lives and strengthen communities.',
    values: ['Customer First', 'Integrity', 'Innovation', 'Excellence', 'Teamwork']
  };

  const supportInfo = [
    { 
      icon: '📞', 
      title: 'Call Support', 
      detail: '+91 123-456-7890',
      subtext: 'Available Mon-Sat: 9 AM - 6 PM'
    },
    { 
      icon: '✉️', 
      title: 'Email Support', 
      detail: 'support@microbank.com',
      subtext: '24/7 Support Available'
    },
    { 
      icon: '💬', 
      title: 'Live Chat', 
      detail: 'Quick Assistance',
      subtext: 'Connect with our team instantly'
    }
  ];

  return (
    <div className="agent-overview">
      {/* Bank Branding Section */}
      <section className="overview-hero">
        <div className="bank-branding-compact">
          <div className="bank-logo-small">
            <img src={bankLogo} alt='Bank Trust Logo'/>
          </div>
          <div className="bank-info-compact">
            <h1>Microbanking System</h1>
            <p className="tagline">Agent Portal - Empowering Customer Service Excellence</p>
          </div>
        </div>
      </section>

      {/* Current Overview Details
      <section className="overview-stats">
        <h2>Your Overview</h2>
        <div className="overview-grid">
          <div className="overview-card">
            <div className="overview-icon">👥</div>
            <div className="overview-content">
              <h3>Welcome Back!</h3>
              <p>Ready to serve our customers</p>
            </div>
          </div>
          <div className="overview-card">
            <div className="overview-icon">🎯</div>
            <div className="overview-content">
              <h3>Today's Tasks</h3>
              <p>Check your performance metrics</p>
            </div>
          </div>
          <div className="overview-card">
            <div className="overview-icon">⚡</div>
            <div className="overview-content">
              <h3>Quick Actions</h3>
              <p>Access frequently used services</p>
            </div>
          </div>
        </div>
      </section> */}

      {/* Performance Metrics Dashboard */}
      <section className="performance-metrics-section">
        <h2>Performance Metrics & Analytics</h2>
        <p className="section-subtitle">Comprehensive system insights at a glance</p>
        
        <div className="metrics-container">
          {/* Key Metrics Row */}
          <div className="key-metrics-row">
            <div className="metric-box">
              {/* <div className="metric-icon">👥</div> */}
              <div className="metric-data">
                <h3>{performanceData.totalCustomers.toLocaleString()}</h3>
                <p>Total Customers</p>
              </div>
            </div>
            <div className="metric-box">
              {/* <div className="metric-icon">🏦</div> */}
              <div className="metric-data">
                <h3>{performanceData.totalAccounts.toLocaleString()}</h3>
                <p>Total Accounts</p>
              </div>
            </div>
            <div className="metric-box">
              {/* <div className="metric-icon">💰</div> */}
              <div className="metric-data">
                <h3>₹{(performanceData.totalDeposits / 10000000).toFixed(1)} Cr</h3>
                <p>Total Deposits</p>
              </div>
            </div>
            <div className="metric-box">
              {/* <div className="metric-icon">💸</div> */}
              <div className="metric-data">
                <h3>₹{(performanceData.totalWithdrawals / 10000000).toFixed(1)} Cr</h3>
                <p>Total Withdrawals</p>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="charts-row">
            {/* Active vs Inactive Accounts */}
            <div className="chart-box">
              <h4>Active vs Inactive Accounts</h4>
              <div className="donut-chart">
                <svg viewBox="0 0 160 160" className="donut-svg">
                  <circle cx="80" cy="80" r="60" fill="none" stroke="#1a365d" strokeWidth="30"
                    strokeDasharray={`${(performanceData.activeAccounts / (performanceData.activeAccounts + performanceData.inactiveAccounts)) * 377} 377`} 
                    transform="rotate(-90 80 80)" />
                  <circle cx="80" cy="80" r="60" fill="none" stroke="#e9ecef" strokeWidth="30"
                    strokeDasharray={`${(performanceData.inactiveAccounts / (performanceData.activeAccounts + performanceData.inactiveAccounts)) * 377} 377`}
                    strokeDashoffset={`-${(performanceData.activeAccounts / (performanceData.activeAccounts + performanceData.inactiveAccounts)) * 377}`}
                    transform="rotate(-90 80 80)" />
                  <text x="80" y="75" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#1a365d">
                    {Math.round((performanceData.activeAccounts / (performanceData.activeAccounts + performanceData.inactiveAccounts)) * 100)}%
                  </text>
                  <text x="80" y="95" textAnchor="middle" fontSize="10" fill="#666">Active</text>
                </svg>
                <div className="chart-mini-legend">
                  <span><strong>{performanceData.activeAccounts.toLocaleString()}</strong> Active</span>
                  <span><strong>{performanceData.inactiveAccounts.toLocaleString()}</strong> Inactive</span>
                </div>
              </div>
            </div>

            {/* Gender Distribution */}
            <div className="chart-box">
              <h4>Gender Distribution</h4>
              <div className="pie-chart-mini">
                <svg viewBox="0 0 160 160" className="pie-svg">
                  <circle cx="80" cy="80" r="60" fill="none" stroke="#1a365d" strokeWidth="30"
                    strokeDasharray={`${performanceData.genderDistribution.male * 3.77} 377`} 
                    transform="rotate(-90 80 80)" />
                  <circle cx="80" cy="80" r="60" fill="none" stroke="#2d4a7c" strokeWidth="30"
                    strokeDasharray={`${performanceData.genderDistribution.female * 3.77} 377`}
                    strokeDashoffset={`-${performanceData.genderDistribution.male * 3.77}`}
                    transform="rotate(-90 80 80)" />
                  <circle cx="80" cy="80" r="60" fill="none" stroke="#e9ecef" strokeWidth="30"
                    strokeDasharray={`${performanceData.genderDistribution.other * 3.77} 377`}
                    strokeDashoffset={`-${(performanceData.genderDistribution.male + performanceData.genderDistribution.female) * 3.77}`}
                    transform="rotate(-90 80 80)" />
                </svg>
                <div className="chart-mini-legend">
                  <span><strong>{performanceData.genderDistribution.male}%</strong> Male</span>
                  <span><strong>{performanceData.genderDistribution.female}%</strong> Female</span>
                  <span><strong>{performanceData.genderDistribution.other}%</strong> Other</span>
                </div>
              </div>
            </div>

            {/* Savings Plans Distribution */}
            <div className="chart-box">
              <h4>Savings Plans Summary</h4>
              <div className="bar-chart-mini">
                {performanceData.savingsPlans.map((plan, idx) => (
                  <div key={idx} className="bar-item">
                    <div className="bar-label">{plan.type}</div>
                    <div className="bar-wrapper">
                      <div className="bar-fill" style={{width: `${(plan.count / 8500) * 100}%`}}>
                        <span className="bar-value">{plan.count.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FD Plans Summary */}
            <div className="chart-box">
              <h4>FD Plans Summary</h4>
              <div className="fd-summary">
                <div className="fd-stat">
                  <span className="fd-label">Active FDs</span>
                  <span className="fd-value">{performanceData.fdPlans.active.toLocaleString()}</span>
                </div>
                <div className="fd-stat">
                  <span className="fd-label">Matured FDs</span>
                  <span className="fd-value">{performanceData.fdPlans.matured.toLocaleString()}</span>
                </div>
                <div className="fd-stat highlight">
                  <span className="fd-label">Total Balance</span>
                  <span className="fd-value">₹{(performanceData.fdPlans.totalBalance / 10000000).toFixed(1)} Cr</span>
                </div>
              </div>
            </div>
          </div>

          {/* Growth Charts */}
          <div className="growth-charts-row">
            {/* Monthly Transactions */}
            <div className="chart-box wide">
              <h4>Monthly Transaction Volume</h4>
              <div className="line-chart">
                <div className="line-chart-bars">
                  {performanceData.monthlyTransactions.map((data, idx) => (
                    <div key={idx} className="transaction-group">
                      <div className="transaction-bars">
                        <div className="t-bar deposits" style={{height: `${(data.deposits / 1200) * 100}%`}}>
                          <span className="t-value">{data.deposits}</span>
                        </div>
                        <div className="t-bar withdrawals" style={{height: `${(data.withdrawals / 1200) * 100}%`}}>
                          <span className="t-value">{data.withdrawals}</span>
                        </div>
                      </div>
                      <div className="t-label">{data.month}</div>
                    </div>
                  ))}
                </div>
                <div className="chart-legend-inline">
                  <span><div className="legend-dot deposits"></div> Deposits</span>
                  <span><div className="legend-dot withdrawals"></div> Withdrawals</span>
                </div>
              </div>
            </div>

            {/* New Customers Growth */}
            <div className="chart-box">
              <h4>New Customers per Month</h4>
              <div className="growth-chart">
                {performanceData.newCustomers.map((data, idx) => (
                  <div key={idx} className="growth-bar">
                    <div className="growth-fill" style={{height: `${(data.count / 650) * 100}%`}}>
                      <span className="growth-value">{data.count}</span>
                    </div>
                    <span className="growth-label">{data.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="bottom-metrics-row">
            {/* Branch Performance
            <div className="chart-box">
              <h4>Branch Performance</h4>
              <div className="branch-performance">
                {performanceData.branchPerformance.map((branch, idx) => (
                  <div key={idx} className="branch-item">
                    <div className="branch-name">{branch.branch} Branch</div>
                    <div className="branch-stats">
                      <span className="b-stat">
                        <strong>{branch.accounts.toLocaleString()}</strong> accounts
                      </span>
                      <span className="b-stat">
                        <strong>₹{branch.deposits.toLocaleString()}</strong>M deposits
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div> */}

            {/* Top Depositors Leaderboard */}
            {/* <div className="chart-box">
              <h4>🏆 Top Depositors</h4>
              <div className="leaderboard">
                {performanceData.topDepositors.map((depositor, idx) => (
                  <div key={idx} className="leaderboard-item">
                    <div className="rank">#{idx + 1}</div>
                    <div className="depositor-info">
                      <span className="depositor-name">{depositor.name}</span>
                      <span className="depositor-amount">₹{(depositor.amount / 100000).toFixed(1)} L</span>
                    </div>
                  </div>
                ))}
              </div>
            </div> */}
          </div>
        </div>
      </section>

      {/* About the Bank */}
      <section className="about-bank-section">
        <h2>About Our Bank</h2>
        <div className="about-bank-content">
          <div className="vision-mission-grid">
            <div className="vision-card">
              <h3>Vision</h3>
              <p>{aboutBank.vision}</p>
            </div>
            <div className="mission-card">
              <h3>Mission</h3>
              <p>{aboutBank.mission}</p>
            </div>
          </div>
          <div className="core-values">
            
          </div>
        </div>
      </section>

      

      {/* Contact & Support
      <section className="support-section">
        <h2>Contact & Support</h2>
        <p className="section-subtitle">We're here to help you serve better</p>
        <div className="support-grid">
          {supportInfo.map((support, index) => (
            <div key={index} className="support-card">
              <div className="support-icon">{support.icon}</div>
              <h3>{support.title}</h3>
              <p className="support-detail">{support.detail}</p>
              <p className="support-subtext">{support.subtext}</p>
            </div>
          ))}
        </div>
        
        
      </section> */}
    </div>
  );
};

export default AgentOverview;
