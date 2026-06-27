// Frontend/src/features/dashboard/components/DashboardCard.jsx
export default function DashboardCard({ title, children, className = '' }) {
  return (
    <div className={`bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition ${className}`}>
      {title && <h3 className="font-bold text-lg text-green-800 mb-3">{title}</h3>}
      {children}
    </div>
  );
}