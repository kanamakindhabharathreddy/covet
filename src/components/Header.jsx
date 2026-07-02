import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const location = useLocation();

  const links = [
    { name: 'Convert', path: '/convert' },
    { name: 'OCR', path: '/ocr' },
  ];

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      left: 0,
      right: 0,
      height: 56,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 48px',
      background: 'rgba(5,5,5,0.92)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid #1e1e1e',
      zIndex: 100,
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <div style={{
          width: 28,
          height: 28,
          background: 'linear-gradient(135deg, #d4a843, #a07c2e)',
          borderRadius: 7,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{ color: '#050505', fontWeight: 800, fontSize: 13 }}>C</span>
        </div>
        <span style={{ fontWeight: 700, fontSize: 15, color: '#fffbf5', letterSpacing: '-0.01em' }}>
          Covet
        </span>
      </Link>

      <nav style={{ display: 'flex', gap: 32 }}>
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.name}
              to={link.path}
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: isActive ? '#d4a843' : '#52525b',
                textDecoration: 'none',
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = '#fffbf5'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = isActive ? '#d4a843' : '#52525b'; }}
            >
              {link.name}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
