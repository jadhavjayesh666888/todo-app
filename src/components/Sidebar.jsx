import { NavLink, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ListTodo, FileText, CheckCircle2, Link, Wallet, X, Package } from 'lucide-react';

const Sidebar = ({ isCollapsed, setIsCollapsed, onNavClick, onCloseMobile }) => {
  const navigate = useNavigate();

  const navItems = [
    { to: '/todos', icon: ListTodo, label: 'Todos' },
    { to: '/notes', icon: FileText, label: 'Notes' },
    { to: '/links', icon: Link, label: 'Links' },
    { to: '/expenses', icon: Wallet, label: 'Expenses' },
  ];

  return (
    <aside style={{
      width: isCollapsed ? '72px' : '260px',
      backgroundColor: 'var(--surface-card)',
      height: '100%',
      position: 'relative',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      transition: 'width 0.35s cubic-bezier(0.4,0,0.2,1)',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'visible'
    }}>


      {/* Inner clip wrapper so content doesn't overflow */}
      <div style={{ overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Header — clickable logo */}
        <div
          onClick={() => navigate('/todos')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: isCollapsed ? '0 0' : '0 1.25rem',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            height: '68px',
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          <div style={{
            width: '32px', height: '32px', borderRadius: '10px',
            backgroundColor: 'var(--accent-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(129, 140, 248, 0.4)', flexShrink: 0
          }}>
            <Package size={20} color="white" />
          </div>
          {!isCollapsed && (
            <span style={{
              fontWeight: 900, fontSize: '1.4rem', letterSpacing: '-0.03em',
              color: 'var(--text-primary)', fontFamily: 'Roboto, sans-serif',
              whiteSpace: 'nowrap'
            }}>MineBox</span>
          )}
        </div>


        {/* Nav links */}
        <nav style={{ flex: 1, padding: isCollapsed ? '1rem 0.75rem' : '0.25rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              title={isCollapsed ? label : undefined}
              onClick={onNavClick}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: isCollapsed ? '0.8rem' : '0.75rem 1rem',
                borderRadius: '10px',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'rgba(99,102,241,0.1)' : 'transparent',
                border: isActive ? '1px solid rgba(99,102,241,0.18)' : '1px solid transparent',
                transition: 'all 0.2s ease',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                  {!isCollapsed && <span>{label}</span>}
                  {isActive && !isCollapsed && (
                    <div className="active-dot" style={{
                      marginLeft: 'auto',
                      width: '6px', height: '6px', borderRadius: '50%',
                      backgroundColor: 'var(--accent-primary)',
                      boxShadow: '0 0 8px var(--accent-primary)'
                    }} />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Toggle button — floats on the right border, only on desktop (> 768px) */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="sidebar-toggle-btn mobile-hidden"
        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        style={{
          position: 'absolute',
          top: '20px',
          right: isCollapsed ? '-24px' : '0px',
          width: '24px',
          height: '40px',
          borderRadius: isCollapsed ? '0 20px 20px 0' : '20px 0 0 20px',
          border: 'none',
          backgroundColor: 'var(--accent-primary)',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isCollapsed
            ? '3px 0 12px rgba(99,102,241,0.5)'
            : '-3px 0 12px rgba(99,102,241,0.5)',
          transition: 'right 0.35s cubic-bezier(0.4,0,0.2,1), border-radius 0.35s, box-shadow 0.2s',
          zIndex: 200
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
      >
        {isCollapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
      </button>

      {/* Mobile Close Button — rendered last to be on top */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onCloseMobile ? onCloseMobile() : setIsCollapsed(true);
        }}
        className="mobile-only-flex close-x-btn"
        style={{
          position: 'absolute',
          right: '0.85rem',
          top: '0.85rem',
          background: 'var(--accent-primary)',
          border: 'none',
          color: 'white',
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          transition: 'transform 0.2s'
        }}
      >
        <X size={22} strokeWidth={2.5} />
      </button>
    </aside>
  );
};

export default Sidebar;
