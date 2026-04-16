import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: 'grid' },
  { to: '/meals', label: 'Meals', icon: 'list' },
  { to: '/workouts', label: 'Workouts', icon: 'lightning' },
  { to: '/progress', label: 'Progress', icon: 'activity' },
  { to: '/goals', label: 'Goals', icon: 'clock' },
];

function IconGrid() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}
function IconList() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}
function IconLightning() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
function IconActivity() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}
function IconClock() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

const iconMap: Record<string, React.ReactElement> = {
  grid: <IconGrid />,
  list: <IconList />,
  lightning: <IconLightning />,
  activity: <IconActivity />,
  clock: <IconClock />,
};

function NavItem({
  label,
  icon,
  isActive,
  onClick,
}: {
  label: string;
  icon: React.ReactElement;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = '#1e293b';
          e.currentTarget.style.color = '#cbd5e1';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = '#64748b';
        }
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '9px',
        width: '100%',
        padding: '8px 10px',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: isActive ? 500 : 400,
        background: isActive ? '#1e293b' : 'transparent',
        color: isActive ? '#e2e8f0' : '#64748b',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        marginBottom: '1px',
      }}
    >
      <span style={{ color: isActive ? '#93c5fd' : '#475569', display: 'flex' }}>{icon}</span>
      {label}
    </button>
  );
}

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const fullName = localStorage.getItem('fullName') || 'User';
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div
      style={{
        width: '210px',
        minWidth: '210px',
        height: '100vh',
        background: '#0f172a',
        borderRight: '1px solid #1e293b',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
      }}
    >
      {/* Logo */}
      <div style={{ padding: '22px 18px 16px', borderBottom: '1px solid #1e293b' }}>
        <p style={{ fontSize: '16px', fontWeight: 500, color: '#f1f5f9', margin: '0 0 2px' }}>ApexFit</p>
        <p style={{ fontSize: '11px', color: '#475569', margin: 0 }}>Fitness tracker</p>
      </div>

      {/* Nav */}
      <nav style={{ padding: '10px 8px', flex: 1 }}>
        <p
          style={{
            fontSize: '10px',
            color: '#334155',
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
            padding: '10px 10px 5px',
            margin: 0,
          }}
        >
          MENU
        </p>
        {navItems.map(({ to, label, icon }) => (
          <NavItem
            key={to}
            label={label}
            icon={iconMap[icon]}
            isActive={location.pathname === to}
            onClick={() => navigate(to)}
          />
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', marginBottom: '6px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: '#1e3a5f',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 500,
              color: '#93c5fd',
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                color: '#e2e8f0',
                fontSize: '13px',
                fontWeight: 500,
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {fullName}
            </p>
            <p style={{ color: '#475569', fontSize: '11px', margin: 0 }}>Member</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            border: '1px solid #1e293b',
            background: 'transparent',
            color: '#475569',
            borderRadius: '6px',
            padding: '7px 10px',
            fontSize: '12px',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
