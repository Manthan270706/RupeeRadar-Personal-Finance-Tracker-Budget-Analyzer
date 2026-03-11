import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';

const CATEGORIES = ['food', 'transport', 'entertainment', 'shopping', 'health', 'other'];

export default function BudgetSettings({ onUpdate }) {
  const toast = useToast();
  const [budgets, setBudgets] = useState({});
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/auth/me').then(res => {
      if (res.data.budgets) setBudgets(res.data.budgets);
    }).catch(() => {});
  }, []);

  const handleChange = (cat, value) => {
    setBudgets(prev => ({ ...prev, [cat]: value === '' ? '' : Number(value) }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {};
      for (const cat of CATEGORIES) {
        payload[cat] = typeof budgets[cat] === 'number' && budgets[cat] >= 0 ? budgets[cat] : 0;
      }
      const res = await api.put('/summary/budgets', payload);
      setBudgets(res.data);
      setEditing(false);
      if (onUpdate) onUpdate();
      toast('Budgets saved');
    } catch (err) {
      toast('Failed to save budgets', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <div className="form-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>📊 Budget Limits</h3>
          <button onClick={() => setEditing(true)}>Edit</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
          {CATEGORIES.map(cat => (
            <div key={cat} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
              <span>₹{budgets[cat] ?? 0}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="form-card">
      <h3>📊 Edit Budget Limits</h3>
      {CATEGORIES.map(cat => (
        <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <label style={{ width: '120px' }}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</label>
          <input
            type="number"
            min="0"
            value={budgets[cat] ?? ''}
            onChange={e => handleChange(cat, e.target.value)}
            style={{ flex: 1 }}
          />
        </div>
      ))}
      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        <button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        <button onClick={() => setEditing(false)}>Cancel</button>
      </div>
    </div>
  );
}
