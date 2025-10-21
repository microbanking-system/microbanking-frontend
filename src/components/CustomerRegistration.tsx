import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

interface CustomerFormData {
  first_name: string;
  last_name: string;
  nic: string;
  gender: string;
  date_of_birth: string;
  contact_no_1: string;
  contact_no_2: string;
  address: string;
  email: string;
}

interface FormErrors {
  [key: string]: string;
}

// Types for Edit tab
interface EditCustomerLite {
  customer_id: number;
  first_name: string;
  last_name: string;
  nic: string;
  date_of_birth: string;
}

interface EditCustomerFull {
  customer_id: number;
  first_name: string;
  last_name: string;
  gender: string;
  nic: string;
  date_of_birth: string;
  contact_id: number;
  contact_no_1: string;
  contact_no_2?: string | null;
  address: string;
  email: string;
}

const CustomerRegistration: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'register' | 'edit'>('register');
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [editSearchNIC, setEditSearchNIC] = useState('');
  // const [editSearchName, setEditSearchName] = useState('');
  
  const [formData, setFormData] = useState<CustomerFormData>({
    first_name: '',
    last_name: '',
    nic: '',
    gender: 'Male',
    date_of_birth: '',
    contact_no_1: '',
    contact_no_2: '',
    address: '',
    email: ''
  });

  // Edit tab states
  const [editCustomers, setEditCustomers] = useState<EditCustomerLite[]>([]);
  const [editFetched, setEditFetched] = useState(false);
  const [editSearch, setEditSearch] = useState('');
  const [editHasSearched, setEditHasSearched] = useState(false);
  const [editSelectedId, setEditSelectedId] = useState<number | null>(null);
  const [editDetails, setEditDetails] = useState<EditCustomerFull | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editSuccess, setEditSuccess] = useState('');
  const [editErrors, setEditErrors] = useState<FormErrors>({});

  const steps = [
    { number: 1, label: 'info 01' },
    { number: 2, label: 'info 02' },
    { number: 3, label: 'Done' }
  ];

  const validateStep1 = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    } else if (formData.first_name.length < 2) {
      newErrors.first_name = 'First name must be at least 2 characters';
    }
    
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    } else if (formData.last_name.length < 2) {
      newErrors.last_name = 'Last name must be at least 2 characters';
    }
    
    if (!formData.nic.trim()) {
      newErrors.nic = 'NIC is required';
    }
    
    if (!formData.date_of_birth) {
      newErrors.date_of_birth = 'Date of birth is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.contact_no_1.trim()) {
      newErrors.contact_no_1 = 'Primary contact number is required';
    } else if (!/^[0-9+]{10,15}$/.test(formData.contact_no_1)) {
      newErrors.contact_no_1 = 'Please enter a valid contact number';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      if (validateStep2()) {
        await handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/agent/customers/register', formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setCustomerId(response.data.customer_id);
      setIsSubmitted(true);
      setCurrentStep(3);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to register customer');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const calculateAge = (dateString: string): number => {
    const dob = new Date(dateString);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      nic: '',
      gender: 'Male',
      date_of_birth: '',
      contact_no_1: '',
      contact_no_2: '',
      address: '',
      email: ''
    });
    setErrors({});
    setCurrentStep(1);
    setIsSubmitted(false);
    setCustomerId('');
  };

  // Edit tab logic
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/agent/customers', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEditCustomers(res.data.customers || []);
        setEditFetched(true);
      } catch (e) {
        console.error('Failed to load customers', e);
      }
    };
    if (activeTab === 'edit' && !editFetched) {
      fetchCustomers();
    }
  }, [activeTab, editFetched]);

  // Replace the filteredEditCustomers useMemo:
    const filteredEditCustomers = useMemo(() => {
    if (!editHasSearched) return [];
    
    const nicQuery = editSearchNIC.trim();
    
    // Must have NIC query
    if (!nicQuery) return [];
    
    // Exact match only for security
    return editCustomers.filter(c => c.nic === nicQuery);
  }, [editCustomers, editHasSearched]);

  const loadEditDetails = async (id: number) => {
    setEditLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/agent/customers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditDetails(res.data.customer);
      setEditSelectedId(id);
      setEditErrors({});
      setEditSuccess('');
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to load customer');
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditSave = async () => {
    if (!editDetails) return;
    const newErrors: FormErrors = {};
    if (!editDetails.contact_no_1?.trim()) newErrors.contact_no_1 = 'Required';
    if (!editDetails.address?.trim()) newErrors.address = 'Required';
    if (!editDetails.email?.trim()) newErrors.email = 'Required';
    setEditErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    setEditSaving(true);
    try {
      const token = localStorage.getItem('token');
      // Send only contact fields to the new endpoint
      await axios.put(`/api/agent/customers/${editDetails.customer_id}/contact`, {
        contact_no_1: editDetails.contact_no_1,
        contact_no_2: editDetails.contact_no_2,
        address: editDetails.address,
        email: editDetails.email,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditSuccess('Contact details updated successfully');
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to update contact details');
    } finally {
      setEditSaving(false);
    }
  };

  const clearEdit = () => {
    setEditSearchNIC('');
    setEditHasSearched(false);
    setEditSelectedId(null);
    setEditDetails(null);
    setEditSuccess('');
    setEditErrors({});
  };

  // CheckIcon component
  const CheckIcon = () => (
    <svg className="step-check-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );

  return (
    <div className="customer-registration">
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`}
          onClick={() => setActiveTab('register')}
        >
          Register Customer
        </button>
        <button
          className={`tab-btn ${activeTab === 'edit' ? 'active' : ''}`}
          onClick={() => setActiveTab('edit')}
        >
          Edit Customers
        </button>
      </div>

      {activeTab === 'register' && (
        <div className="customer-registration-wizard">
          <div className="wizard-container">
            {/* Header */}
            <div className="wizard-header">
              <div className="wizard-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h1>Create a new account</h1>
              <p>Register new customers for banking services</p>
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

            {/* Form Container */}
            <div className="wizard-form-container">
              {currentStep === 1 && (
                <div className="form-step">
                  <h2 className="step-title">Personal Information</h2>
                  
                  <div className="form-grid">
                    <div className="form-group">
                      <label>First Name *</label>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        placeholder="Enter first name"
                        className={errors.first_name ? 'input-error' : ''}
                      />
                      {errors.first_name && <p className="error-message">{errors.first_name}</p>}
                    </div>

                    <div className="form-group">
                      <label>Last Name *</label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        placeholder="Enter last name"
                        className={errors.last_name ? 'input-error' : ''}
                      />
                      {errors.last_name && <p className="error-message">{errors.last_name}</p>}
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>NIC Number *</label>
                      <input
                        type="text"
                        name="nic"
                        value={formData.nic}
                        onChange={handleInputChange}
                        placeholder="e.g., 123456789V or 123456789012"
                        className={errors.nic ? 'input-error' : ''}
                      />
                      {errors.nic && <p className="error-message">{errors.nic}</p>}
                    </div>

                    <div className="form-group">
                      <label>Gender *</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Date of Birth *</label>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={formData.date_of_birth}
                      onChange={handleInputChange}
                      className={errors.date_of_birth ? 'input-error' : ''}
                    />
                    {errors.date_of_birth && <p className="error-message">{errors.date_of_birth}</p>}
                    {formData.date_of_birth && !errors.date_of_birth && calculateAge(formData.date_of_birth) >= 0 && (
                      <p className="help-text">Age: {calculateAge(formData.date_of_birth)} years</p>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="form-step">
                  <h2 className="step-title">Contact Information</h2>
                  
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Primary Contact Number *</label>
                      <input
                        type="text"
                        name="contact_no_1"
                        value={formData.contact_no_1}
                        onChange={handleInputChange}
                        placeholder="e.g., +94112345678"
                        className={errors.contact_no_1 ? 'input-error' : ''}
                      />
                      {errors.contact_no_1 && <p className="error-message">{errors.contact_no_1}</p>}
                    </div>

                    <div className="form-group">
                      <label>Secondary Contact Number</label>
                      <input
                        type="text"
                        name="contact_no_2"
                        value={formData.contact_no_2}
                        onChange={handleInputChange}
                        placeholder="e.g., +94112345679"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="e.g., customer@email.com"
                      className={errors.email ? 'input-error' : ''}
                    />
                    {errors.email && <p className="error-message">{errors.email}</p>}
                  </div>

                  <div className="form-group">
                    <label>Address *</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="e.g., 123 Main Street, Colombo 01"
                      className={errors.address ? 'input-error' : ''}
                    />
                    {errors.address && <p className="error-message">{errors.address}</p>}
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="success-step">
                  <div className="success-icon-circle">
                    <CheckIcon />
                  </div>
                  <h2>Registration Complete!</h2>
                  <p className="success-message">
                    Customer "{formData.first_name} {formData.last_name}" has been registered successfully.
                  </p>
                  <div className="customer-id-box">
                    <p className="id-label">Customer ID</p>
                    <p className="id-value">{customerId}</p>
                  </div>
                  <div></div>
                  <button onClick={resetForm} className="btn-register-another">
                    Register Another Customer
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              {currentStep < 3 && (
                <div className="wizard-actions">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={currentStep === 1}
                    className="btn-back"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={isLoading}
                    className="btn-next"
                  >
                    {isLoading ? (
                      <>
                        <div className="loading-spinner"></div>
                        Submitting...
                      </>
                    ) : currentStep === 2 ? (
                      'Submit'
                    ) : (
                      'Next'
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

     {/* code for edit customers */}
     {activeTab === 'edit' && (
        <div className="customer-edit">
          <div className="section-header">
            <div>
              <h4>Edit Customers</h4>
              <p className="section-subtitle">Search and update registered customer details</p>
            </div>
          </div>

          <div className="search-row">
            <input
              type="text"
              value={editSearchNIC}
              onChange={(e) => setEditSearchNIC(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') setEditHasSearched(true); }}
              placeholder="Enter complete NIC number (e.g., 947012345V)"
            />
            <button className="btn-next" onClick={() => {setEditHasSearched(false); setTimeout(() => setEditHasSearched(true), 0);}}>Search</button>
            <button className="btn-back" onClick={clearEdit}>Clear</button>
          </div>

          {editHasSearched && (
            <div className="results-panel">
              <div className="results-list">
                {filteredEditCustomers.length === 0 ? (
                  <div className="no-data">
                    <h5>No matching customers</h5>
                    <p>Please enter the complete NIC number</p>
                  </div>
                ) : (
                  <ul className="simple-list">
                    {filteredEditCustomers.map(c => (
                      <li key={c.customer_id} className={editSelectedId === c.customer_id ? 'active' : ''}>
                        <button onClick={() => loadEditDetails(c.customer_id)}>
                          <span className="id">{c.customer_id}</span>
                          <span className="name">{c.first_name} {c.last_name}</span>
                          <span className="nic">{c.nic}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="details-panel">
                {!editDetails ? (
                  <div className="hint">Select a customer to view and edit details</div>
                ) : (
                  <div className="edit-form">
                    {editSuccess && (
                      <div className="success-message">
                        <span className="success-icon">✓</span>
                        {editSuccess}
                        <button className="close-btn" onClick={() => setEditSuccess('')}>×</button>
                      </div>
                    )}
                    {/* Personal details are not editable here */}
                    <div className="info-message" style={{ marginBottom: '8px', color: '#555' }}>
                      Only contact details can be updated on this screen.
                    </div>

                    <div className="section-divider"><h5>Contact</h5></div>

                    <div className="form-grid">
                      <div className="form-group">
                        <label>Primary Phone *</label>
                        <input
                          type="tel"
                          value={editDetails.contact_no_1}
                          onChange={(e) => setEditDetails({ ...editDetails!, contact_no_1: e.target.value })}
                          className={editErrors.contact_no_1 ? 'input-error' : ''}
                        />
                        {editErrors.contact_no_1 && <p className="error-message">{editErrors.contact_no_1}</p>}
                      </div>

                      <div className="form-group">
                        <label>Secondary Phone</label>
                        <input
                          type="tel"
                          value={editDetails.contact_no_2 || ''}
                          onChange={(e) => setEditDetails({ ...editDetails!, contact_no_2: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Email *</label>
                      <input
                        type="email"
                        value={editDetails.email}
                        onChange={(e) => setEditDetails({ ...editDetails!, email: e.target.value })}
                        className={editErrors.email ? 'input-error' : ''}
                      />
                      {editErrors.email && <p className="error-message">{editErrors.email}</p>}
                    </div>

                    <div className="form-group">
                      <label>Address *</label>
                      <input
                        type="text"
                        value={editDetails.address}
                        onChange={(e) => setEditDetails({ ...editDetails!, address: e.target.value })}
                        className={editErrors.address ? 'input-error' : ''}
                      />
                      {editErrors.address && <p className="error-message">{editErrors.address}</p>}
                    </div>

                    <div className="wizard-actions">
                      <button
                        type="button"
                        onClick={() => { setEditDetails(null); setEditSelectedId(null); }}
                        className="btn-back"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleEditSave}
                        disabled={editSaving || editLoading}
                        className="btn-next"
                      >
                        {editSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerRegistration;
