import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Customer {
  customer_id: number;
  first_name: string;
  last_name: string;
  nic: string;
  date_of_birth: string;
}

interface FdPlan {
  fd_plan_id: number;
  fd_options: string;
  interest: number;
}

interface Account {
  account_id: number;
  balance: number;
  customer_names: string;
  fd_id: number | null;
  min_balance: number;
  interest: number;
  plan_type: string; // Add plan_type to identify joint accounts
  customer_count: number; // Add customer count
}

interface FdFormData {
  customer_id: number;
  account_id: number;
  fd_plan_id: number;
  principal_amount: number;
  auto_renewal_status: string;
}

interface FormErrors {
  [key: string]: string;
}

interface ExistingFD {
  fd_id: number;
  fd_balance: number;
  fd_status: string;
  open_date: string;
  maturity_date: string;
  auto_renewal_status: string;
  fd_options: string;
  interest: number;
  account_id: number;
  customer_names: string;
  customer_nics?: string;
}

const FixedDepositCreation: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [fdPlans, setFdPlans] = useState<FdPlan[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<FdPlan | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  
  // New state for FD management
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>(() => {
    const saved = localStorage.getItem('fixedDepositCreation.activeTab') as 'create' | 'manage' | null;
    return saved === 'manage' ? 'manage' : 'create';
  });
  const [existingFDs, setExistingFDs] = useState<ExistingFD[]>([]);
  const [searchFdId, setSearchFdId] = useState('');
  const [searchResults, setSearchResults] = useState<ExistingFD[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Customer search state
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [customerSearchResult, setCustomerSearchResult] = useState<Customer | null>(null);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  
  // Stepper state
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [createdFdId, setCreatedFdId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState<FdFormData>({
    customer_id: 0,
    account_id: 0,
    fd_plan_id: 0,
    principal_amount: 0,
    auto_renewal_status: 'False'
  });

  // Define stepper steps
  const steps = [
    { number: 1, label: 'info 01' },
    { number: 2, label: 'info 02' },
    { number: 3, label: 'Done' }
  ];

  // Check icon for completed steps
  const CheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 13l4 4L19 7"></path>
    </svg>
  );

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Load existing FDs when switching to manage tab
  useEffect(() => {
    if (activeTab === 'manage') {
      loadExistingFDs();
    }
  }, [activeTab]);

  // Persist activeTab
  useEffect(() => {
    localStorage.setItem('fixedDepositCreation.activeTab', activeTab);
  }, [activeTab]);

  // Sync search results with existing FDs (keep data fresh, but UI only shows after search)
  useEffect(() => {
    if (hasSearched && !searchFdId.trim()) {
      // If user cleared the term after a search, keep results empty
      setSearchResults([]);
    }
  }, [existingFDs, hasSearched, searchFdId]);

  // Exact NIC/BC lookup for customer selection
  const lookupCustomerByNic = async () => {
    const nic = customerSearchTerm.trim().toUpperCase();
    if (!nic) return;

    // Validate client-side: 12 digits or 9 digits + V
    if (!/^([0-9]{12}|[0-9]{9}V)$/.test(nic)) {
      alert('Enter a valid NIC/Birth Certificate number: 12 digits or 9 digits followed by V');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/agent/customers/by-nic/${nic}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const c: Customer = res.data.customer;
      setCustomerSearchResult(c);
    } catch (err: any) {
      setCustomerSearchResult(null);
      const msg = err?.response?.data?.message || 'Customer not found';
      alert(msg);
    }
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [customersRes, plansRes, accountsRes] = await Promise.all([
        axios.get('/api/agent/customers', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/public/fd-plans', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/agent/accounts-with-fd', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setCustomers(customersRes.data.customers || []);
      setFdPlans(plansRes.data.fd_plans || plansRes.data || []);
      setAccounts(accountsRes.data.accounts || []);
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      alert('Failed to load required data');
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadExistingFDs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/agent/fixed-deposits', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExistingFDs(response.data.fixed_deposits);
    } catch (error: any) {
      console.error('Failed to load existing FDs:', error);
      alert('Failed to load existing fixed deposits');
    }
  };

  const searchFD = async () => {
    setHasSearched(true);
    const term = searchFdId.trim().toUpperCase();
    if (!term) {
      setSearchResults([]);
      return;
    }

    // Exact FD ID: numeric and not a 12-digit NIC
    const isAllDigits = /^[0-9]+$/.test(term);
    const isTwelveDigitNic = /^[0-9]{12}$/.test(term);
    const isOldNic = /^[0-9]{9}V$/.test(term);

    if (isAllDigits && !isTwelveDigitNic) {
      // Filter client-side by exact FD ID if we have them cached
      const results = existingFDs.filter(fd => fd.fd_id.toString() === term);
      setSearchResults(results);
      return;
    }

    if (!isTwelveDigitNic && !isOldNic) {
      alert('Enter a valid NIC/Birth Certificate number: 12 digits or 9 digits followed by V');
      return;
    }

    try {
      setIsSearching(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/agent/fixed-deposits/by-nic/${term}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSearchResults(response.data.fixed_deposits || []);
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to search fixed deposits';
      alert(msg);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };
  
  const deactivateFD = async (fdId: number, principalAmount: number, accountId: number) => {
  if (!window.confirm(
    `Are you sure you want to deactivate Fixed Deposit ${fdId}?\n\n` +
    `• Principal Amount: LKR ${principalAmount.toLocaleString()}\n` +
    `• Linked Account: ${accountId}\n\n` +
    `This will return the principal amount to the savings account and close the FD.`
  )) {
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const response = await axios.post('/api/agent/fixed-deposits/deactivate', 
      { fd_id: fdId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    alert(response.data.message); // This will now show the success message with details
    // Refresh the list
    loadExistingFDs();
    setSearchResults(searchResults.filter(fd => fd.fd_id !== fdId));
  } catch (error: any) {
    alert(error.response?.data?.message || 'Failed to deactivate fixed deposit');
  }
  };

  const calculateAge = (dateOfBirth: string): number => {
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  // Get eligible accounts for the selected customer
  const getEligibleAccounts = (): Account[] => {
    if (!selectedCustomer) return [];

    return accounts.filter(account => {
      // Debug logging to see what's happening
      console.log('Checking account:', account.account_id, {
        customer_names: account.customer_names,
        selected_customer: `${selectedCustomer.first_name} ${selectedCustomer.last_name}`,
        has_fd: account.fd_id,
        plan_type: account.plan_type,
        customer_count: account.customer_count,
        balance: account.balance
      });

      // Check if account belongs to selected customer (more flexible matching)
      const customerFullName = `${selectedCustomer.first_name} ${selectedCustomer.last_name}`;
      const belongsToCustomer = account.customer_names.includes(customerFullName);
      
      if (!belongsToCustomer) {
        console.log('Account does not belong to customer');
        return false;
      }

      // Check if account already has an FD
      if (account.fd_id) {
        console.log('Account already has FD:', account.fd_id);
        return false;
      }

      // Exclude accounts for under-18 plans (Children, Teen)
      if (account.plan_type === 'Children' || account.plan_type === 'Teen') {
        console.log('Account is Child/Teen plan; excluded');
        return false;
      }

      // Check if account is joint account
      if (account.plan_type === 'Joint') {
        console.log('Account is joint account');
        return false;
      }

      // Check if account has multiple customers (joint account)
      if (account.customer_count > 1) {
        console.log('Account has multiple customers');
        return false;
      }

      // Check if account has sufficient balance
      if (account.balance <= 0) {
        console.log('Account has insufficient balance');
        return false;
      }

      console.log('Account is eligible');
      return true;
    });
  };

  // Step 1 validation - Customer & Account Selection
  const validateStep1 = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.customer_id) {
      newErrors.customer_id = 'Please select a customer';
    } else if (selectedCustomer && calculateAge(selectedCustomer.date_of_birth) < 18) {
      newErrors.customer_id = 'Customer must be at least 18 years old for Fixed Deposit';
    }
    
    if (!formData.account_id) {
      newErrors.account_id = 'Please select a savings account';
    } else {
      const selectedAcc = accounts.find(acc => acc.account_id === formData.account_id);
      if (selectedAcc?.fd_id) {
        newErrors.account_id = 'This savings account already has a fixed deposit. One FD per savings account is allowed.';
      }
      if (selectedAcc?.plan_type === 'Joint') {
        newErrors.account_id = 'Joint accounts are not eligible for fixed deposits.';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 2 validation - FD Details
  const validateStep2 = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.fd_plan_id) {
      newErrors.fd_plan_id = 'Please select a FD plan';
    }
    
    if (formData.principal_amount <= 0) {
      newErrors.principal_amount = 'Principal amount must be greater than 0';
    } else if (selectedAccount) {
      // Get the minimum balance from the selected account's saving plan
      const savingPlan = accounts.find(acc => acc.account_id === formData.account_id);
      if (savingPlan) {
        const minBalance = savingPlan.min_balance || 0;
        const availableForFD = selectedAccount.balance - minBalance;
        
        if (formData.principal_amount > availableForFD) {
          newErrors.principal_amount = `Insufficient balance. Maximum FD amount: LKR ${availableForFD.toLocaleString()} (Minimum balance of LKR ${minBalance.toLocaleString()} must remain in savings account for ${savingPlan.plan_type} plan)`;
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = (): boolean => {
    return validateStep1() && validateStep2();
  };

  const calculateMaturityDate = (planOption: string): Date => {
    const today = new Date();
    const maturityDate = new Date(today);
    
    switch (planOption) {
      case '6 months':
        maturityDate.setMonth(today.getMonth() + 6);
        break;
      case '1 year':
        maturityDate.setFullYear(today.getFullYear() + 1);
        break;
      case '3 years':
        maturityDate.setFullYear(today.getFullYear() + 3);
        break;
      default:
        maturityDate.setMonth(today.getMonth() + 6);
    }
    
    return maturityDate;
  };

  const calculateMaturityAmount = (principal: number, interestRate: number, planOption: string): number => {
    let years = 0.5; // Default 6 months
    
    switch (planOption) {
      case '6 months':
        years = 0.5;
        break;
      case '1 year':
        years = 1;
        break;
      case '3 years':
        years = 3;
        break;
    }
    
    let m_principal: number = principal * (1 + (interestRate / 100) * years);
    return m_principal;
  };

  // Step navigation handlers
  const handleNextStep = async () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      // Create FD when moving from step 2 to step 3
      await createFixedDeposit();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3);
      setErrors({});
    }
  };

  const createFixedDeposit = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const submitData = {
        ...formData,
        principal_amount: parseFloat(formData.principal_amount.toString())
      };

      const response = await axios.post('/api/agent/fixed-deposits/create', submitData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setCreatedFdId(response.data.fd_id);
      setSuccessMessage(`Fixed Deposit created successfully! FD Account: ${response.data.fd_id}`);
      setCurrentStep(3);
      
      // Refresh accounts data to update balances
      fetchData();
      
      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create fixed deposit');
      setCurrentStep(2); // Stay on step 2 if error
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // This is no longer needed as FD is created in step 2
  };

  const resetForm = () => {
    setFormData({
      customer_id: 0,
      account_id: 0,
      fd_plan_id: 0,
      principal_amount: 0,
      auto_renewal_status: 'False'
    });
    setSelectedCustomer(null);
    setSelectedPlan(null);
    setSelectedAccount(null);
  setCustomerSearchTerm('');
  setCustomerSearchResult(null);
    setShowCustomerSearch(false);
    setErrors({});
    setCurrentStep(1);
    setCreatedFdId(null);
    setSuccessMessage('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Update selected items when they change
    if (name === 'fd_plan_id') {
      const plan = fdPlans.find(p => p.fd_plan_id === parseInt(value));
      setSelectedPlan(plan || null);
    } else if (name === 'account_id') {
      const account = accounts.find(a => a.account_id === parseInt(value));
      setSelectedAccount(account || null);
    }
  };

  const selectCustomer = (customer: Customer) => {
    setFormData(prev => ({
      ...prev,
      customer_id: customer.customer_id,
      account_id: 0 // Reset account selection when customer changes
    }));
    setSelectedCustomer(customer);
    setSelectedAccount(null);
    setCustomerSearchTerm('');
    setCustomerSearchResult(null);
    setShowCustomerSearch(false);
    
    // Clear customer selection error
    if (errors.customer_id) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.customer_id;
        return newErrors;
      });
    }
  };

  const removeSelectedCustomer = () => {
    setFormData(prev => ({
      ...prev,
      customer_id: 0,
      account_id: 0
    }));
    setSelectedCustomer(null);
    setSelectedAccount(null);
    setCustomerSearchTerm('');
  };

  const getPlanDescription = (plan: FdPlan) => {
    return `${plan.fd_options} - ${plan.interest}% interest`;
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'Active': 'success',
      'Matured': 'warning',
      'Closed': 'danger'
    };
    
    const color = statusColors[status as keyof typeof statusColors] || 'secondary';
    return <span className={`badge badge-${color}`}>{status}</span>;
  };

  if (isLoadingData) {
    return (
      <div className="customer-registration">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading fixed deposit data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed-deposit-creation">
      <div className="section-header">
        <div>
          {/* <h4>Fixed Deposit Management</h4>
          <p className="section-subtitle">Create and manage fixed deposit accounts</p> */}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          Create New FD
        </button>
        <button 
          className={`tab-btn ${activeTab === 'manage' ? 'active' : ''}`}
          onClick={() => setActiveTab('manage')}
        >
          Manage Existing FDs
        </button>
      </div>

      {successMessage && (
        <div className="success-message">
          <span className="success-icon">✓</span>
          {successMessage}
          <button 
            className="close-btn"
            onClick={() => setSuccessMessage('')}
          >
            ×
          </button>
        </div>
      )}

      {activeTab === 'create' ? (
        <div className="wizard-container">
          {/* Form Header with Icon */}
          <div className="wizard-header">
            <div className="wizard-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1>Create Fixed Deposit</h1>
            <p>Open a new fixed deposit account for customers</p>
          </div>

          {/* Stepper */}
          <div className="stepper">
            <div className="stepper-line-container">
              {steps.map((step, index) => (
                <React.Fragment key={step.number}>
                  <div className="step-item">
                    <div className={`step-circle ${
                      currentStep > step.number || (currentStep === 3 && step.number === 3) ? 'step-completed' :
                      currentStep === step.number ? 'step-active' : 'step-inactive'
                    }`}>
                      {currentStep > step.number || (currentStep === 3 && step.number === 3) ? <CheckIcon /> : step.number}
                    </div>
                    <span className={`step-label ${
                      currentStep >= step.number ? 'step-label-active' : 'step-label-inactive'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`step-line ${
                      currentStep > step.number ? 'step-line-completed' : 'step-line-incomplete'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="wizard-form-container">
            <form onSubmit={handleSubmit}>
              {/* Step 1: Customer & Account Selection */}
              {currentStep === 1 && (
              <div className="form-step">
                <h2 className="step-title">Customer & Account Selection</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>Select Customer *</label>
                  
                  {selectedCustomer ? (
                    <div className="selected-customer-card">
                      <div className="customer-info">
                        <strong>{selectedCustomer.first_name} {selectedCustomer.last_name}</strong>
                        <span>ID: {selectedCustomer.customer_id} | NIC: {selectedCustomer.nic} | Age: {calculateAge(selectedCustomer.date_of_birth)}</span>
                      </div>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={removeSelectedCustomer}
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <div className="customer-search-section">
                      {!showCustomerSearch ? (
                        <button
                          type="button"
                          className="btn btn-secondary btn-block"
                          onClick={() => setShowCustomerSearch(true)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px', verticalAlign: 'middle'}}>
                          <circle cx="11" cy="11" r="8"></circle>
                          <path d="m21 21-4.35-4.35"></path>
                        </svg>
                          Search Customer
                        </button>
                      ) : (
                          <div className="search-customer">
                            <div className="search-box">
                              <input
                                type="text"
                                placeholder="Enter NIC/Birth Certificate (exact): 123456789V or 12 digits"
                                value={customerSearchTerm}
                                onChange={(e) => setCustomerSearchTerm(e.target.value)}
                                className="search-input"
                                autoFocus
                              />
                              <button
                                type="button"
                                className="btn-next"
                                onClick={lookupCustomerByNic}
                                disabled={!customerSearchTerm.trim()}
                              >
                                Find
                              </button>
                              <button
                                type="button"
                                className="btn-back"
                                onClick={() => {
                                  setShowCustomerSearch(false);
                                  setCustomerSearchTerm('');
                                  setCustomerSearchResult(null);
                                }}
                              >
                                Cancel
                              </button>
                            </div>

                            {customerSearchResult && (
                              <div className="search-results">
                                <div 
                                  key={customerSearchResult.customer_id} 
                                  className="search-result-item"
                                  onClick={() => selectCustomer(customerSearchResult)}
                                >
                                  <div className="customer-info">
                                    <strong>{customerSearchResult.first_name} {customerSearchResult.last_name}</strong>
                                    <span>ID: {customerSearchResult.customer_id} | NIC: {customerSearchResult.nic} | Age: {calculateAge(customerSearchResult.date_of_birth)}</span>
                                  </div>
                                  <button
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                  >
                                    Select
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                      )}
                    </div>
                  )}
                  
                  {errors.customer_id && <span className="error-text">{errors.customer_id}</span>}
                </div>

                <div className="form-group">
                  <label>Select Savings Account *</label>
                  <select
                    name="account_id"
                    value={formData.account_id}
                    onChange={handleInputChange}
                    required
                    className={errors.account_id ? 'error' : ''}
                    disabled={!selectedCustomer}
                  >
                    <option value="">
                      {selectedCustomer ? 'Choose a savings account...' : 'Select customer first...'}
                    </option>
                    {getEligibleAccounts().map(account => (
                      <option key={account.account_id} value={account.account_id}>
                        {account.account_id} - LKR {account.balance.toLocaleString()} - {account.plan_type}
                      </option>
                    ))}
                  </select>
                  {errors.account_id && <span className="error-text">{errors.account_id}</span>}
                  
                  {selectedCustomer && (
                    <div className="account-selection-info">
                      {getEligibleAccounts().length === 0 ? (
                        <small className="form-help text-warning">
                          No eligible savings accounts found for {selectedCustomer.first_name} {selectedCustomer.last_name}. 
                          Customer must be 18+ and needs an individual savings account with positive balance and no existing FD.
                        </small>
                      ) : (
                        <small className="form-help">
                          {getEligibleAccounts().length} eligible account(s) found
                        </small>
                      )}
                    </div>
                  )}
                  
                  {selectedAccount && (
                    <small className="form-help">
                      Available balance: LKR {selectedAccount.balance.toLocaleString()}
                    </small>
                  )}
                </div>
              </div>

              {selectedCustomer && (
                <div className="customer-info-card">
                  <h5>Customer Information</h5>
                  <p><strong>Name:</strong> {selectedCustomer.first_name} {selectedCustomer.last_name}</p>
                  <p><strong>Customer ID:</strong> {selectedCustomer.customer_id}</p>
                  <p><strong>NIC:</strong> {selectedCustomer.nic}</p>
                  <p><strong>Age:</strong> {calculateAge(selectedCustomer.date_of_birth)} years</p>
                </div>
              )}

              {/* Step 1 Navigation */}
              <div className="form-actions stepper-actions">
                <button 
                  type="button" 
                  className="btn-back"
                  disabled={currentStep === 1}
                  // style={{ visibility: 'hidden' }}
                >
                  Back
                </button>
                <button 
                  type="button" 
                  className="btn-back"
                  onClick={resetForm}
                  disabled={currentStep === 1}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn-next"
                  onClick={handleNextStep}
                >
                  Next
                </button>
              </div>
              </div>
              )}

              {/* Step 2: Fixed Deposit Details */}
              {currentStep === 2 && (
              <div className="form-step">
                <h2 className="step-title">Fixed Deposit Details</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>FD Plan *</label>
                  <select
                    name="fd_plan_id"
                    value={formData.fd_plan_id}
                    onChange={handleInputChange}
                    required
                    className={errors.fd_plan_id ? 'error' : ''}
                  >
                    <option value="">Choose a FD plan...</option>
                    {fdPlans.map(plan => (
                      <option key={plan.fd_plan_id} value={plan.fd_plan_id}>
                        {getPlanDescription(plan)}
                      </option>
                    ))}
                  </select>
                  {errors.fd_plan_id && <span className="error-text">{errors.fd_plan_id}</span>}
                </div>

                <div className="form-group">
                  <label>Auto Renewal</label>
                  <select
                    name="auto_renewal_status"
                    value={formData.auto_renewal_status}
                    onChange={handleInputChange}
                  >
                    <option value="False">No Auto Renewal</option>
                    <option value="True">Auto Renewal</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Principal Amount (LKR) *</label>
                <input
                  type="number"
                  name="principal_amount"
                  value={formData.principal_amount === 0 ? '' : formData.principal_amount}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="Enter principal amount"
                  className={errors.principal_amount ? 'error' : ''}
                />
                {errors.principal_amount && <span className="error-text">{errors.principal_amount}</span>}
                {selectedAccount && (
                  <small className="form-help">
                    Maximum amount: LKR {(selectedAccount.balance-selectedAccount.min_balance).toLocaleString()}
                  </small>
                )}
              </div>

              {selectedPlan && formData.principal_amount > 0 && (
                <div className="fd-summary">
                  <h5>Fixed Deposit Summary</h5>
                  <div className="summary-grid">
                    <div className="summary-item">
                      <span>Plan Duration:</span>
                      <strong>{selectedPlan.fd_options}</strong>
                    </div>
                    <div className="summary-item">
                      <span>Interest Rate:</span>
                      <strong>{selectedPlan.interest}%</strong>
                    </div>
                    <div className="summary-item">
                      <span>Principal Amount:</span>
                      <strong>LKR {formData.principal_amount.toLocaleString()}</strong>
                    </div>
                    <div className="summary-item">
                      <span>Maturity Date:</span>
                      <strong>{calculateMaturityDate(selectedPlan.fd_options).toLocaleDateString()}</strong>
                    </div>
                    <div className="summary-item">
                      <span>Expected Maturity Amount:</span>
                      <strong>LKR {calculateMaturityAmount(
                        formData.principal_amount, 
                        selectedPlan.interest, 
                        selectedPlan.fd_options
                      ).toLocaleString()}</strong>
                    </div>
                    <div className="summary-item">
                      <span>Auto Renewal:</span>
                      <strong>{formData.auto_renewal_status === 'True' ? 'Yes' : 'No'}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2 Navigation */}
              <div className="form-actions stepper-actions">
                <button 
                  type="button" 
                  className="btn-back"
                  onClick={handlePrevStep}
                  disabled={isLoading}
                >
                  Back
                </button>
                <button 
                  type="button" 
                  className="btn-back"
                  onClick={resetForm}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn-next btn-success"
                  onClick={handleNextStep}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="loading-spinner"></span>
                      Creating...
                    </>
                  ) : (
                    'Create Fixed Deposit'
                  )}
                </button>
              </div>
              </div>
              )}

              {/* Step 3: FD Created Successfully */}
              {currentStep === 3 && (
              <div className="form-step">
                <div className="success-container">
                  <div className="success-icon-large">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  </div>
                  <h2 className="step-title" style={{textAlign: 'center', color: 'var(--success-color)'}}>Fixed Deposit Created Successfully!</h2>
                  <p className="section-subtitle" style={{textAlign: 'center'}}>The new fixed deposit account has been opened</p>
                </div>

              <div className="confirmation-summary">
                {/* FD Account Number - Highlighted */}
                {createdFdId && (
                  <div className="confirmation-section" style={{background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', padding: 'var(--spacing-lg)', borderRadius: 'var(--border-radius-lg)', marginBottom: 'var(--spacing-lg)'}}>
                    <div className="detail-row" style={{justifyContent: 'center', fontSize: '1.2rem'}}>
                      <span className="detail-label" style={{fontSize: '1.1rem'}}>FD Account Number:</span>
                      <span className="detail-value"><strong style={{color: 'var(--primary-color)', fontSize: '1.3rem'}}>{createdFdId}</strong></span>
                    </div>
                  </div>
                )}

                {/* Customer Information */}
                <div className="confirmation-section">
                  <h5>Account Holder Information</h5>
                  {selectedCustomer && (
                    <div className="confirmation-details">
                      <div className="detail-row">
                        <span className="detail-label">Customer Name:</span>
                        <span className="detail-value"><strong>{selectedCustomer.first_name} {selectedCustomer.last_name}</strong></span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Customer ID:</span>
                        <span className="detail-value">{selectedCustomer.customer_id}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">NIC:</span>
                        <span className="detail-value">{selectedCustomer.nic}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Age:</span>
                        <span className="detail-value">{calculateAge(selectedCustomer.date_of_birth)} years</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Linked Account */}
                {selectedAccount && (
                  <div className="confirmation-section">
                    <h5>Linked Savings Account</h5>
                    <div className="confirmation-details">
                      <div className="detail-row">
                        <span className="detail-label">Account Number:</span>
                        <span className="detail-value"><strong>{formData.account_id}</strong></span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Account Type:</span>
                        <span className="detail-value">{selectedAccount.plan_type}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* FD Details */}
                {selectedPlan && (
                  <div className="confirmation-section">
                    <h5>Fixed Deposit Details</h5>
                    <div className="confirmation-details">
                      <div className="detail-row">
                        <span className="detail-label">Plan Duration:</span>
                        <span className="detail-value"><strong>{selectedPlan.fd_options}</strong></span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Interest Rate:</span>
                        <span className="detail-value">{selectedPlan.interest}% per annum</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Principal Amount:</span>
                        <span className="detail-value"><strong className="text-success">LKR {formData.principal_amount.toLocaleString()}</strong></span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Maturity Date:</span>
                        <span className="detail-value">{calculateMaturityDate(selectedPlan.fd_options).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Expected Maturity Amount:</span>
                        <span className="detail-value"><strong className="text-success">LKR {calculateMaturityAmount(formData.principal_amount, selectedPlan.interest, selectedPlan.fd_options).toLocaleString()}</strong></span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Auto Renewal:</span>
                        <span className="detail-value">{formData.auto_renewal_status === 'True' ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Status */}
                <div className="confirmation-section">
                  <h5>FD Status</h5>
                  <div className="confirmation-details">
                    <div className="detail-row">
                      <span className="detail-label">Status:</span>
                      <span className="detail-value"><span className="badge badge-success">Active</span></span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Created Date:</span>
                      <span className="detail-value">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 Navigation - Only "Create Another FD" button */}
              <div className="form-actions stepper-actions" style={{justifyContent: 'center'}}>
                <button 
                  type="button" 
                  className="btn-next"
                  onClick={resetForm}
                  style={{minWidth: '200px'}}
                >
                  Create Another Fixed Deposit
                </button>
              </div>
              </div>
              )}
            </form>
          </div>
        </div>
      ) : (
        
        // Manage Existing FDs Tab
        <div className="fd-management">
          <div className="search-section">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search by FD Account ID or exact NIC/Birth Certificate (e.g., 123456789V or 12 digits)"
                value={searchFdId}
                onChange={(e) => setSearchFdId(e.target.value)}
                className="search-input"
              />
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={searchFD}
                disabled={isSearching}
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => {
                  setSearchFdId('');
                  setSearchResults([]);
                  setHasSearched(false);
                }}
              >
                Clear
              </button>
            </div>
          </div>

          {/* Minimal results area: only show after a search */}
          {hasSearched && (
            <div className="fd-list">
              {searchResults.length === 0 ? (
                <div className="no-data">
                  {searchFdId
                    ? `No fixed deposits found matching "${searchFdId}"`
                    : 'Enter a term above and click Search.'}
                </div>
              ) : (
                <div className="fd-grid">
                  {searchResults.map(fd => (
                    <div key={fd.fd_id} className="fd-card">
                      <div className="fd-header">
                        <h6>FD Account: {fd.fd_id}</h6>
                        {getStatusBadge(fd.fd_status)}
                      </div>
                      <div className="fd-details">
                        <div className="fd-detail">
                          <span>Linked Savings Account:</span>
                          <strong>{fd.account_id}</strong>
                        </div>
                        <div className="fd-detail">
                          <span>Customer:</span>
                          <strong>{fd.customer_names}</strong>
                        </div>
                        <div className="fd-detail">
                          <span>Principal Amount:</span>
                          <strong>LKR {fd.fd_balance.toLocaleString()}</strong>
                        </div>
                        <div className="fd-detail">
                          <span>Plan:</span>
                          <strong>{fd.fd_options} ({fd.interest}%)</strong>
                        </div>
                        <div className="fd-detail">
                          <span>Open Date:</span>
                          <strong>{new Date(fd.open_date).toLocaleDateString()}</strong>
                        </div>
                        <div className="fd-detail">
                          <span>Maturity Date:</span>
                          <strong>{new Date(fd.maturity_date).toLocaleDateString()}</strong>
                        </div>
                        <div className="fd-detail">
                          <span>Auto Renewal:</span>
                          <strong>{fd.auto_renewal_status === 'True' ? 'Yes' : 'No'}</strong>
                        </div>
                      </div>
                      <div className="fd-actions">
                        {fd.fd_status === 'Active' && (
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => deactivateFD(fd.fd_id, fd.fd_balance, fd.account_id)}
                          >
                            Deactivate FD
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FixedDepositCreation;