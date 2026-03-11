export default function Insights({ transactions }) {
  const now = new Date();
  const currentMonthLabel = now.toLocaleString('default', { month: 'long', year: 'numeric' });

  const getInsights = () => {
    const insights = [];
    const monthlyByCategory = {};
    let totalThisMonth = 0;
    let totalLastMonth = 0;

    // Group last 3 months
    const monthsWithData = new Set();
    for (let m = 2; m >= 0; m--) {
      const month = new Date(now.getFullYear(), now.getMonth() - m, 1);
      transactions
        .filter(t => {
          const d = new Date(t.date);
          return t.type === 'expense' && d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear();
        })
        .forEach(t => {
          monthsWithData.add(2 - m);
          if (!monthlyByCategory[t.category]) monthlyByCategory[t.category] = [];
          monthlyByCategory[t.category][2 - m] = (monthlyByCategory[t.category][2 - m] || 0) + t.amount;
          if (m === 0) totalThisMonth += t.amount;
          if (m === 1) totalLastMonth += t.amount;
        });
    }

    // Need at least 2 months of expense data for meaningful comparison
    if (monthsWithData.size < 2) return insights;

    // Overall month-over-month comparison
    if (totalLastMonth > 0) {
      const diff = totalThisMonth - totalLastMonth;
      if (diff > 0) {
        insights.push(`📈 Overall spending is ₹${diff} more than last month (₹${totalThisMonth} vs ₹${totalLastMonth})`);
      } else if (diff < 0) {
        insights.push(`📉 Great! Spending is ₹${Math.abs(diff)} less than last month (₹${totalThisMonth} vs ₹${totalLastMonth})`);
      }
    }

    // Per-category insights
    for (const [cat, months] of Object.entries(monthlyByCategory)) {
      const lastMonth = months[1] || 0;
      const current = months[2] || 0;
      const diff = current - lastMonth;
      const label = cat.charAt(0).toUpperCase() + cat.slice(1);
      if (diff > 0 && lastMonth > 0) {
        insights.push(`🔺 ${label} spending is ₹${diff} more than previous month`);
      } else if (diff < 0 && current > 0) {
        insights.push(`✅ ${label} spending is ₹${Math.abs(diff)} less than previous month — well managed!`);
      }
    }

    // Top category this month
    const thisMonthByCategory = {};
    transactions
      .filter(t => {
        const d = new Date(t.date);
        return t.type === 'expense' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .forEach(t => {
        thisMonthByCategory[t.category] = (thisMonthByCategory[t.category] || 0) + t.amount;
      });
    const topCategory = Object.entries(thisMonthByCategory).sort((a, b) => b[1] - a[1])[0];
    if (topCategory) {
      insights.push(`💸 Top spending category this month: ${topCategory[0].charAt(0).toUpperCase() + topCategory[0].slice(1)} (₹${topCategory[1]})`);
    }

    return insights;
  };

  const insights = getInsights();
  if (insights.length === 0) return null;

  return (
    <div className="alerts-section">
      <h3>💡 Monthly Insights — {currentMonthLabel}</h3>
      {insights.map((insight, i) => (
        <div key={i} className="alert-item warning">{insight}</div>
      ))}
    </div>
  );
}