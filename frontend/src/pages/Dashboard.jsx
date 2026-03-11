import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import SpendingPieChart from '../components/Charts/SpendingPieChart';
import MonthlyBarChart from '../components/Charts/MonthlyBarChart';
import BudgetAlert from '../components/BudgetAlert';
import BudgetSettings from '../components/BudgetSettings';
import Insights from '../components/Insights';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [transactions, setTransactions] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, categoryTotals: {}, alerts: [] });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const fetchData = async (p = page) => {
    try {
      const [txRes, allTxRes, sumRes] = await Promise.all([
        api.get(`/transactions?page=${p}&limit=10`),
        api.get('/transactions?page=1&limit=50'),
        api.get('/summary/monthly')
      ]);
      setTransactions(txRes.data.transactions);
      setTotalPages(txRes.data.totalPages);
      setPage(txRes.data.page);
      setAllTransactions(allTxRes.data.transactions);
      setSummary(sumRes.data);
    } catch (err) {
      toast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdd = (tx) => { fetchData(1); toast('Transaction added'); };
  const handleDelete = (id) => { setTransactions(prev => prev.filter(t => t._id !== id)); fetchData(page); toast('Transaction deleted'); };
  const handleExport = async () => {
    try {
      const res = await api.get('/summary/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'transactions.csv';
      a.click();
      window.URL.revokeObjectURL(url);
      toast('CSV exported');
    } catch (err) {
      toast('Export failed', 'error');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading your finances...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <nav className="navbar">
        <h1>💰 FinanceTracker</h1>
        <div>
          <span>Hello, {user?.name}</span>
          <button onClick={handleExport}>📥 Export CSV</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="stats-bar">
        <div className="stat income">Income: ₹{summary.totalIncome}</div>
        <div className="stat expense">Expense: ₹{summary.totalExpense}</div>
        <div className={`stat balance ${summary.balance >= 0 ? 'positive' : 'negative'}`}>
          Balance: ₹{summary.totalIncome - summary.totalExpense}
        </div>
      </div>

      <div className="main-grid">
        <div className="left-panel">
          <TransactionForm onAdd={handleAdd} />
          <BudgetSettings onUpdate={fetchData} />
          <TransactionList
            transactions={transactions}
            onDelete={handleDelete}
            onEdit={() => fetchData(page)}
            page={page}
            totalPages={totalPages}
            onPageChange={(p) => fetchData(p)}
          />
        </div>
        <div className="right-panel">
          <BudgetAlert alerts={summary.alerts} />
          <Insights transactions={allTransactions} />
          <SpendingPieChart categoryTotals={summary.categoryTotals} />
          <MonthlyBarChart transactions={allTransactions} />
        </div>
      </div>
    </div>
  );
}