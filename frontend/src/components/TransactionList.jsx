import { useState } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';

const CATEGORIES = {
  income: ['salary', 'freelance', 'other'],
  expense: ['food', 'transport', 'entertainment', 'shopping', 'health', 'other']
};

export default function TransactionList({ transactions, onDelete, onEdit, page, totalPages, onPageChange }) {
  const toast = useToast();
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    await api.delete(`/transactions/${id}`);
    onDelete(id);
  };

  const startEdit = (t) => {
    setEditingId(t._id);
    setEditForm({
      type: t.type,
      amount: t.amount,
      category: t.category,
      description: t.description,
      date: new Date(t.date).toISOString().split('T')[0]
    });
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async (id) => {
    try {
      await api.put(`/transactions/${id}`, { ...editForm, amount: Number(editForm.amount) });
      setEditingId(null);
      onEdit();
      toast('Transaction updated');
    } catch (err) {
      toast(err.response?.data?.msg || 'Update failed', 'error');
    }
  };

  return (
    <div className="transaction-list">
      <h3>Recent Transactions</h3>
      {transactions.length === 0 && <p>No transactions yet. Add one above!</p>}
      {transactions.map(t => (
        editingId === t._id ? (
          <div key={t._id} className="transaction-item editing">
            <div className="edit-form">
              <div className="edit-row">
                <select value={editForm.type} onChange={e => setEditForm({...editForm, type: e.target.value, category: CATEGORIES[e.target.value][0]})}>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
                <input type="number" value={editForm.amount} onChange={e => setEditForm({...editForm, amount: e.target.value})} />
              </div>
              <div className="edit-row">
                <select value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})}>
                  {CATEGORIES[editForm.type].map(cat => (
                    <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                  ))}
                </select>
                <input type="date" value={editForm.date} max={new Date().toISOString().split('T')[0]} onChange={e => setEditForm({...editForm, date: e.target.value})} />
              </div>
              <input type="text" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} />
              <div className="edit-actions">
                <button className="save-btn" onClick={() => saveEdit(t._id)}>Save</button>
                <button className="cancel-btn" onClick={cancelEdit}>Cancel</button>
              </div>
            </div>
          </div>
        ) : (
          <div key={t._id} className={`transaction-item ${t.type}`}>
            <div className="t-info">
              <span className="t-desc">{t.description}</span>
              <span className="t-category">{t.category} • {new Date(t.date).toLocaleDateString()}</span>
            </div>
            <div className="t-right">
              <span className="t-amount">{t.type === 'income' ? '+' : '-'}₹{t.amount}</span>
              <button onClick={() => startEdit(t)} className="edit-btn" title="Edit">✎</button>
              <button onClick={() => handleDelete(t._id)} className="delete-btn" title="Delete">✕</button>
            </div>
          </div>
        )
      ))}
      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => onPageChange(page - 1)}>← Prev</button>
          <span>Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
}