export default function BudgetAlert({ alerts }) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="alerts-section">
      <h3>⚠️ Budget Alerts</h3>
      {alerts.map((alert, i) => (
        <div key={i} className={`alert-item ${alert.overage ? 'danger' : 'warning'}`}>
          {alert.overage
            ? `🔴 You exceeded your ${alert.category} budget by ₹${alert.overage}! (Spent ₹${alert.spent} / Limit ₹${alert.budget})`
            : `🟡 You've used ${Math.round((alert.spent / alert.budget) * 100)}% of your ${alert.category} budget (₹${alert.spent} / ₹${alert.budget})`
          }
        </div>
      ))}
    </div>
  );
}