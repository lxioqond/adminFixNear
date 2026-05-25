import './css/barraInferior.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

function Navbar() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const [verificado, setVerificado] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    getDoc(doc(db, 'usuarios', user.uid)).then(snap => {
      if (snap.exists()) setVerificado(snap.data().verificado === true);
    });
  }, []);

  const items = [
    {
      path: '/home',
      label: 'Inicio',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
          <path d="M9 21V12h6v9"/>
        </svg>
      ),
    },
    {
      path: '/solicitudes',
      label: 'Pedidos',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
      ),
    },
    {
      path: '/chat',
      label: 'Chat',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      ),
    },
    {
      path: '/cercanos',
      label: 'Cercanos',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
          <circle cx="12" cy="12" r="9" strokeDasharray="2 4"/>
        </svg>
      ),
    },
    {
      path: '/perfil',
      label: 'Perfil',
      icon: (
        <div style={{ position: 'relative', display: 'inline-flex' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          {verificado && (
            <span style={{
              position: 'absolute',
              top: -2,
              right: -3,
              width: 8,
              height: 8,
              background: '#22c55e',
              borderRadius: '50%',
              border: '1.5px solid var(--bg-primary, #0a0a0a)',
            }} />
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="navbar">
      {items.map((item) => (
        <div
          key={item.path}
          className={location.pathname === item.path ? 'active' : ''}
          onClick={() => navigate(item.path)}
        >
          {item.icon}
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export default Navbar;