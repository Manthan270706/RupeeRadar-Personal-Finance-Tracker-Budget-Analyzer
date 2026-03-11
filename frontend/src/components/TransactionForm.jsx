import { useState } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';

const CATEGORIES = {
  income: ['salary', 'freelance', 'other'],
  expense: ['food', 'transport', 'entertainment', 'shopping', 'health', 'other']
};

export default function TransactionForm({ onAdd }) {
  const toast = useToast();
  const [form, setForm] = useState({
    type: 'expense', amount: '', category: 'food', description: '', date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/transactions', { ...form, amount: Number(form.amount) });
      onAdd(res.data);
      setForm({ type: 'expense', amount: '', category: 'food', description: '', date: new Date().toISOString().split('T')[0] });
    } catch (err) {
      toast(err.response?.data?.msg || 'Failed to add transaction', 'error');
    }
  };

  return (
    <div className="form-card">
      <h3>Add Transaction</h3>
      <form onSubmit={handleSubmit}>
        <select value={form.type} onChange={e => setForm({...form, type: e.target.value, category: CATEGORIES[e.target.value][0]})}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <input type="number" placeholder="Amount (₹)" value={form.amount}
          onChange={e => setForm({...form, amount: e.target.value})} required />
        <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
          {CATEGORIES[form.type].map(cat => (
            <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
          ))}
        </select>
        <input type="text" placeholder="Description" value={form.description}
          onChange={e => setForm({...form, description: e.target.value})} required />
        <input type="date" value={form.date} max={new Date().toISOString().split('T')[0]}
          onChange={e => setForm({...form, date: e.target.value})} />
        <button type="submit">Add</button>
      </form>
    </div>
  );
}