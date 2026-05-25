import '../css/perfil.css';
import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut, updateProfile } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import Navbar from '../barraInferior';
import { ThemeContext } from '../../ThemeContext';

const Icon = ({ name, size = 18, style = {} }) => {
  const paths = {
    user:       'M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z',
    orders:     'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z',
    heart:      'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
    payment:    'M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z',
    shop:       'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
    map:        'M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z',
    settings:   'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z',
    chevron:    'M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z',
    sun:        'M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .38-.39.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.38.39-1.03 0-1.41l-1.06-1.06zm1.06-12.37l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0zM7.05 18.36l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06c.39-.39.39-1.03 0-1.41-.38-.39-1.03-.39-1.41 0z',
    moon:       'M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z',
    logout:     'M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z',
  };
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={{ fill: 'currentColor', flexShrink: 0, ...style }}>
      <path d={paths[name]} />
    </svg>
  );
};

const MENU_ITEMS = [
  { icon: 'user',     color: 'blue',   title: 'Información personal',  subtitle: 'Nombre, correo, datos',      badge: null },
  { icon: 'orders',   color: 'green',  title: 'Mis pedidos',           subtitle: 'Historial de órdenes',        badge: null },
  { icon: 'heart',    color: 'red',    title: 'Favoritos',             subtitle: 'Productos guardados',         badge: null },
  { icon: 'payment',  color: 'amber',  title: 'Métodos de pago',       subtitle: 'Tarjetas y billeteras',       badge: null },
  { icon: 'shop',     color: 'purple', title: 'Tiendas recomendadas',  subtitle: 'Cerca de tu ubicación',       badge: null },
  { icon: 'map',      color: 'teal',   title: 'Tienda más cercana',    subtitle: 'Ver en mapa',                 badge: null },
  { icon: 'settings', color: 'blue',   title: 'Configuración',         subtitle: 'Notificaciones, privacidad',  badge: null },
];

function Perfil() {
  const navigate = useNavigate();

  const [usuario, setUsuario]   = useState(null);
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre]     = useState('');
  const [apellido, setApellido] = useState('');
  const [fotoUrl, setFotoUrl]   = useState(null);

  const { theme, setTheme } = useContext(ThemeContext);

  const cycleTheme = () => {
    const next = theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark';
    setTheme(next);
  };

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const cargarPerfil = async () => {
      if (user.photoURL) setFotoUrl(user.photoURL);
      const docRef  = doc(db, 'usuarios', user.uid);
      const docSnap = await getDoc(docRef);

      let datos;
      if (docSnap.exists()) {
        datos = docSnap.data();
      } else {
        datos = {
          nombre:   user.displayName?.split(' ')[0] || 'Usuario',
          apellido: user.displayName?.split(' ').slice(1).join(' ') || '',
          email:    user.email,
          uid:      user.uid,
        };
      }
      setUsuario(datos);
      setNombre(datos.nombre);
      setApellido(datos.apellido);
    };

    cargarPerfil();
  }, []);

  const cerrarSesion = async () => {
    try {
      navigate('/login', { replace: true });
      await signOut(auth);
    } catch (error) {
      console.error(error.message);
    }
  };

  const guardarEdicion = async () => {
    try {
      const user   = auth.currentUser;
      const docRef = doc(db, 'usuarios', user.uid);
      await updateDoc(docRef, { nombre, apellido });
      await updateProfile(user, { displayName: `${nombre} ${apellido}` });
      setUsuario(prev => ({ ...prev, nombre, apellido }));
      setEditando(false);
    } catch (error) {
      console.error(error.message);
    }
  };

  if (!usuario) {
    return (
      <>
        <div className="perfil-page">
          <p className="perfil-loading">Cargando perfil…</p>
        </div>
        <Navbar />
      </>
    );
  }

  return (
    <>
      <div className="perfil-page">

        {/* ── Top bar ── */}
        <div className="perfil-topbar">
          <span className="perfil-topbar-title">Mi Perfil</span>
          <button
            onClick={cycleTheme}
            aria-label="Cambiar tema"
            title={theme === 'dark' ? 'Modo oscuro' : theme === 'light' ? 'Modo claro' : 'Modo sistema'}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 20, padding: '5px 12px 5px 8px',
              cursor: 'pointer', color: 'var(--text-primary)',
              fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
              transition: 'all 0.2s',
            }}
          >
            {theme === 'dark'  && <><Icon name="moon" size={14} /> Oscuro</>}
            {theme === 'light' && <><Icon name="sun"  size={14} /> Claro</>}
            {theme === 'system' && (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
                Sistema
              </>
            )}
          </button>
        </div>

        <div className="perfil-header">
          <div className="perfil-avatar-wrapper">
            {fotoUrl ? (
              <img
                src={fotoUrl}
                alt="Foto de perfil"
                style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--bg-primary)', boxShadow: '0 0 0 2px var(--accent)' }}
              />
            ) : (
              <div className="perfil-avatar">
                {usuario.nombre?.charAt(0)}{usuario.apellido?.charAt(0)}
              </div>
            )}
            <div className="perfil-avatar-badge" />
          </div>
          <h2>{usuario.nombre} {usuario.apellido}</h2>
          <div className="perfil-header-role">
            <div className="perfil-header-role-dot" />
            <span>Cliente verificado</span>
          </div>
        </div>

        <div className="perfil-stats">
          <div className="perfil-stat">
            <div className="perfil-stat-value">$0.00</div>
            <div className="perfil-stat-label">Balance</div>
          </div>
          <div className="perfil-stat">
            <div className="perfil-stat-value">0</div>
            <div className="perfil-stat-label">Pedidos</div>
          </div>
          <div className="perfil-stat">
            <div className="perfil-stat-value">$0.00</div>
            <div className="perfil-stat-label">Total gastado</div>
          </div>
        </div>

        <p className="perfil-section-label">Cuenta</p>
        <div className="perfil-menu">
          {MENU_ITEMS.map((item, idx) => (
            <div
              key={idx}
              className="perfil-menu-item"
              onClick={() => {/* navegar cuando existan las páginas */}}
            >
              <div className={`perfil-menu-icon ${item.color}`}>
                <Icon name={item.icon} size={18} />
              </div>
              <div className="perfil-menu-text">
                <div className="perfil-menu-title">{item.title}</div>
                <div className="perfil-menu-subtitle">{item.subtitle}</div>
              </div>
              {item.badge && (
                <span className="perfil-menu-badge">{item.badge}</span>
              )}
              <Icon name="chevron" size={16} style={{ color: 'var(--text-muted)' }} />
            </div>
          ))}
        </div>

        <p className="perfil-section-label">Datos de la cuenta</p>
        <div className="perfil-card">
          <div className="perfil-card-header">
            <h3>Información personal</h3>
            {!editando && (
              <button
                className="btn-info"
                onClick={() => setEditando(true)}
              >
                Editar
              </button>
            )}
          </div>

          {editando ? (
            <>
              <div className="perfil-item">
                <span>Nombre</span>
                <input
                  className="perfil-edit-input"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                />
              </div>
              <div className="perfil-item">
                <span>Apellido</span>
                <input
                  className="perfil-edit-input"
                  value={apellido}
                  onChange={e => setApellido(e.target.value)}
                />
              </div>
              <div className="perfil-edit-actions">
                <button className="btn-save"   onClick={guardarEdicion}>Guardar</button>
                <button className="btn-cancel" onClick={() => setEditando(false)}>Cancelar</button>
              </div>
            </>
          ) : (
            <>
              <div className="perfil-item">
                <span>Nombre</span>
                <p>{usuario.nombre}</p>
              </div>
              <div className="perfil-item">
                <span>Apellido</span>
                <p>{usuario.apellido}</p>
              </div>
              <div className="perfil-item">
                <span>Correo electrónico</span>
                <p>{usuario.email}</p>
              </div>
            </>
          )}
        </div>

        <button className="perfil-btn" onClick={cerrarSesion}>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Icon name="logout" size={17} />
            Cerrar sesión
          </span>
        </button>

      </div>
      <Navbar />
    </>
  );
}

export default Perfil;