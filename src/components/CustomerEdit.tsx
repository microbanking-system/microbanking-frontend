import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

interface CustomerLite {
  customer_id: number;
  first_name: string;
  last_name: string;
  nic: string;
  date_of_birth: string;
}

interface CustomerFull {
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

interface FormErrors { [key: string]: string; }

const CustomerEdit: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerLite[]>([]);
  const [search, setSearch] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [details, setDetails] = useState<CustomerFull | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/agent/customers', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCustomers(res.data.customers || []);
      } catch (e) {
        console.error('Failed to load customers', e);
      }
    };
    fetchCustomers();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!hasSearched || !q) return [];
    return customers.filter(c =>
      c.customer_id.toString().includes(q) ||
      c.first_name.toLowerCase().includes(q) ||
      c.last_name.toLowerCase().includes(q) ||
      `${c.first_name} ${c.last_name}`.toLowerCase().includes(q) ||
      c.nic.toLowerCase().includes(q)
    );
  }, [customers, search, hasSearched]);

  const loadDetails = async (id: number) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/agent/customers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDetails(res.data.customer);
      setSelectedId(id);
      setErrors({});
      setSuccess('');
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to load customer');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!details) return;
    const newErrors: FormErrors = {};
    if (!details.first_name.trim()) newErrors.first_name = 'Required';
    if (!details.last_name.trim()) newErrors.last_name = 'Required';
    if (!details.nic.trim()) newErrors.nic = 'Required';
    if (!details.contact_no_1.trim()) newErrors.contact_no_1 = 'Required';
    if (!details.address.trim()) newErrors.address = 'Required';
    if (!details.email.trim()) newErrors.email = 'Required';
    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/agent/customers/${details.customer_id}`, details, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Customer updated successfully');
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to update customer');
    } finally {
      setSaving(false);
    }
  };

  const clear = () => {
    setSearch('');
    setHasSearched(false);
    setSelectedId(null);
    setDetails(null);
    setSuccess('');
    setErrors({});
  };

  return (
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
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') setHasSearched(true); }}
          placeholder="Search by Customer ID, name, or NIC"
        />
        <button className="btn btn-primary" onClick={() => setHasSearched(true)}>Search</button>
        <button className="btn btn-secondary" onClick={clear}>Clear</button>
      </div>

      {hasSearched && (
        <div className="results-panel">
          <div className="results-list">
            {filtered.length === 0 ? (
              <div className="no-data">
                <h5>No matching customers</h5>
                <p>Try a different ID, name, or NIC</p>
              </div>
            ) : (
              <ul className="simple-list">
                {filtered.map(c => (
                  <li key={c.customer_id} className={selectedId === c.customer_id ? 'active' : ''}>
                    <button onClick={() => loadDetails(c.customer_id)}>
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
            {!details ? (
              <div className="hint">Select a customer to view and edit details</div>
            ) : (
              <div className="edit-form">
                {success && (
                  <div className="success-message">
                    <span className="success-icon">✓</span>
                    {success}
                    <button className="close-btn" onClick={() => setSuccess('')}>×</button>
                  </div>
                )}

                <div className="form-grid">
                  <div className="form-group">
                    <label>First Name *</label>
                    <input
                      type="text"
                      value={details.first_name}
                      onChange={(e) => setDetails({ ...details!, first_name: e.target.value })}
                      className={errors.first_name ? 'error' : ''}
                    />
                    {errors.first_name && <span className="error-text">{errors.first_name}</span>}
                  </div>

                  <div className="form-group">
                    <label>Last Name *</label>
                    <input
                      type="text"
                      value={details.last_name}
                      onChange={(e) => setDetails({ ...details!, last_name: e.target.value })}
                      className={errors.last_name ? 'error' : ''}
                    />
                    {errors.last_name && <span className="error-text">{errors.last_name}</span>}
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>NIC *</label>
                    <input
                      type="text"
                      value={details.nic}
                      onChange={(e) => setDetails({ ...details!, nic: e.target.value })}
                      className={errors.nic ? 'error' : ''}
                    />
                    {errors.nic && <span className="error-text">{errors.nic}</span>}
                  </div>

                  <div className="form-group">
                    <label>Gender *</label>
                    <select
                      value={details.gender}
                      onChange={(e) => setDetails({ ...details!, gender: e.target.value })}
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
                    value={details.date_of_birth?.split('T')[0] || details.date_of_birth}
                    onChange={(e) => setDetails({ ...details!, date_of_birth: e.target.value })}
                  />
                </div>

                <div className="section-divider"><h5>Contact</h5></div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Primary Phone *</label>
                    <input
                      type="tel"
                      value={details.contact_no_1}
                      onChange={(e) => setDetails({ ...details!, contact_no_1: e.target.value })}
                      className={errors.contact_no_1 ? 'error' : ''}
                    />
                    {errors.contact_no_1 && <span className="error-text">{errors.contact_no_1}</span>}
                  </div>

                  <div className="form-group">
                    <label>Secondary Phone</label>
                    <input
                      type="tel"
                      value={details.contact_no_2 || ''}
                      onChange={(e) => setDetails({ ...details!, contact_no_2: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={details.email}
                    onChange={(e) => setDetails({ ...details!, email: e.target.value })}
                    className={errors.email ? 'error' : ''}
                  />
                  {errors.email && <span className="error-text">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label>Address *</label>
                  <input
                    type="text"
                    value={details.address}
                    onChange={(e) => setDetails({ ...details!, address: e.target.value })}
                    className={errors.address ? 'error' : ''}
                  />
                  {errors.address && <span className="error-text">{errors.address}</span>}
                </div>

                <div className="form-actions">
                  <button className="btn btn-secondary" onClick={() => { setDetails(null); setSelectedId(null); }}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleSave} disabled={saving || isLoading}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerEdit;
