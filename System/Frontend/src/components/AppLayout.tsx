import { Link, NavLink, Outlet } from 'react-router-dom';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-agt-base flex">
      {/* ── Left sidebar ───────────────────────────── */}
      <aside className="w-52 shrink-0 bg-agt-surface border-r border-agt-border flex flex-col sticky top-0 h-screen">
        {/* Logo */}
        <div className="px-agt-5 py-agt-6 border-b border-agt-border">
          <Link
            to="/"
            className="text-agt-h5 font-bold text-agt-heading font-agt-sans hover:text-agt-primary transition-colors duration-150"
          >
            ExamForge
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex flex-col gap-agt-1 px-agt-3 py-agt-4 flex-1">
          <NavItem to="/" label="Dashboard" end />
          <NavItem to="/questions" label="Questions" />
          <NavItem to="/exams" label="Exams" />
          <NavItem to="/admin" label="Admin" />
          <NavItem to="/design" label="Design Preview" />
        </nav>
      </aside>

      {/* ── Page content ───────────────────────────── */}
      <main className="flex-1 min-h-screen px-agt-8 py-agt-8">
        <Outlet />
      </main>
    </div>
  );
}

function NavItem({ to, label, end }: { to: string; label: string; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          'flex items-center px-agt-3 py-agt-2 rounded-agt-md',
          'text-agt-sm font-medium font-agt-sans',
          'transition-colors duration-150',
          isActive
            ? 'bg-agt-elevated text-agt-primary'
            : 'text-agt-text-muted hover:bg-agt-elevated hover:text-agt-text',
        ].join(' ')
      }
    >
      {label}
    </NavLink>
  );
}
