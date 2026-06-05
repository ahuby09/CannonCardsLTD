import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/orders/new-orders', label: 'New orders' },
  { to: '/admin/orders/to-ship', label: 'Orders to ship' },
  { to: '/admin/orders', label: 'All orders', end: true },
  { to: '/admin/products', label: 'Products', end: true },
  { to: '/admin/products/new', label: 'New product' },
  { to: '/admin/singles/new', label: 'New single' },
  { to: '/admin/code-cards/new', label: 'New code card' }
];

function navClass({ isActive }) {
  return isActive ? 'active' : undefined;
}

export default function AdminLayout({ children }) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__title">
          <span>Admin</span>
          <strong>Cannon Cards TCG</strong>
        </div>
        <nav aria-label="Admin navigation">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={navClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="admin-main">
        {children}
      </div>
    </div>
  );
}
