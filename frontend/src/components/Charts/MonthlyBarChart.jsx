import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function MonthlyBarChart({ transactions }) {
  // Group transactions by month
  const monthlyData = {};
  transactions.forEach(t => {
    const month = new Date(t.date).toLocaleString('default', { month: 'short', year: '2-digit' });
    if (!monthlyData[month]) monthlyData[month] = { month, income: 0, expense: 0 };
    if (t.type === 'income') monthlyData[month].income += t.amount;
    else monthlyData[month].expense += t.amount;
  });

  const data = Object.values(monthlyData).slice(-6);

  return (
    <div className="chart-card">
      <h3>Income vs Expense (Last 6 Months)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(value) => `₹${value}`} />
          <Legend />
          <Bar dataKey="income" fill="#00C49F" name="Income" />
          <Bar dataKey="expense" fill="#FF8042" name="Expense" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}