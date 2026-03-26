import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <div className="min-h-screen bg-agt-base flex">

      {/* ── Backdrop (small/medium only) ────────────── */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* ── Left sidebar ────────────────────────────── */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-30 w-52 bg-agt-surface border-r border-agt-border flex flex-col',
          'transition-transform duration-200',
          'lg:sticky lg:top-0 lg:h-screen lg:shrink-0 lg:translate-x-0',
          menuOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        {/* Logo */}
        <div className="px-agt-5 py-agt-6 border-b border-agt-border flex items-center justify-between">
          <Link
            to="/"
            onClick={closeMenu}
            className="text-agt-h5 font-bold text-agt-heading font-agt-sans hover:text-agt-primary transition-colors duration-150"
          >
            ExamForge
          </Link>
          <button
            onClick={closeMenu}
            aria-label="Close menu"
            className="lg:hidden text-agt-text-muted hover:text-agt-text transition-colors duration-150 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex flex-col gap-agt-1 px-agt-3 py-agt-4 flex-1">
          <NavItem to="/" label="Dashboard" end onNavigate={closeMenu} />
          <NavItem to="/questions" label="Questions" onNavigate={closeMenu} />
          <NavItem to="/exams" label="Exams" onNavigate={closeMenu} />
          <hr className="border-agt-border my-agt-1" />
          <NavItem to="/admin" label="Admin" ghost onNavigate={closeMenu} />
          <NavItem to="/design" label="Design Preview" ghost onNavigate={closeMenu} />
        </nav>
      </aside>

      {/* ── Page content ────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (small/medium only) */}
        <header className="lg:hidden sticky top-0 z-10 bg-agt-surface border-b border-agt-border flex items-center gap-agt-4 px-agt-4 py-agt-3">
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="text-agt-text-muted hover:text-agt-text transition-colors duration-150 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <span className="text-agt-sm font-bold text-agt-heading font-agt-sans">ExamForge</span>
        </header>

        <main className="flex-1 px-agt-4 py-agt-6 sm:px-agt-6 lg:px-agt-8 lg:py-agt-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function NavItem({
  to,
  label,
  end,
  ghost,
  onNavigate,
}: {
  to: string;
  label: string;
  end?: boolean;
  ghost?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        [
          'flex items-center px-agt-3 py-agt-2 rounded-agt-md',
          'transition-colors duration-150',
          ghost
            ? 'text-agt-xs font-normal font-agt-sans text-agt-text-muted hover:text-agt-text'
            : 'text-agt-sm font-medium font-agt-sans',
          ghost && isActive
            ? 'text-agt-text'
            : !ghost && isActive
              ? 'bg-agt-elevated text-agt-primary'
              : !ghost
                ? 'text-agt-text-muted hover:bg-agt-elevated hover:text-agt-text'
                : '',
        ].join(' ')
      }
    >
      {label}
    </NavLink>
  );
}
