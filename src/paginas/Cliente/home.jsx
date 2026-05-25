import '../css/home.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../barraInferior';
import { auth, db } from '../../firebase';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';

const OFICIOS = [
  'Todos','Electricista','Plomero','Pintor','Carpintero',
  'Limpieza','Jardinero','Albañil','Cerrajero',
  'Técnico en refrigeración','Técnico en electrodomésticos'
];

const DEPARTAMENTOS = [
  'Todos','Ahuachapán','Cabañas','Chalatenango','Cuscatlán',
  'La Libertad','La Paz','La Unión','Morazán','San Miguel',
  'San Salvador','San Vicente','Santa Ana','Sonsonate','Usulután'
];

function Index() {
  const [nombre,       setNombre]       = useState('');
  const [userData,     setUserData]     = useState(null);
  const [cargando,     setCargando]     = useState(true);
  const [tecnicos,     setTecnicos]     = useState([]);
  const [busqueda,     setBusqueda]     = useState('');
  const [oficio,       setOficio]       = useState('Todos');
  const [departamento, setDepartamento] = useState('Todos');
  const [precioMax,    setPrecioMax]    = useState('');
  const [calMin,       setCalMin]       = useState(0);
  const [filtrosOpen,  setFiltrosOpen]  = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const obtenerUsuario = async () => {
      const user = auth.currentUser;
      if (!user) { navigate('/login'); return; }
      const snap = await getDoc(doc(db, 'usuarios', user.uid));
      if (snap.exists()) {
        const data = snap.data();
        setNombre(data.nombre || '');
        setUserData(data);
      }
      setCargando(false);
    };
    obtenerUsuario();
  }, [navigate]);

  useEffect(() => {
    const q = query(
      collection(db, 'usuarios'),
      where('verificado', '==', true),
      where('registroCompletado', '==', true)
    );
    const unsub = onSnapshot(q, snap => {
      setTecnicos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const esVerificado       = userData?.verificado === true;
  const registroCompletado = userData?.registroCompletado === true;

  const tecnicosFiltrados = tecnicos.filter(t => {
    const nombreCompleto = `${t.nombre || ''} ${t.apellido || ''}`.toLowerCase();
    const matchBusqueda  = !busqueda || nombreCompleto.includes(busqueda.toLowerCase()) || (t.oficio || '').toLowerCase().includes(busqueda.toLowerCase());
    const matchOficio    = oficio === 'Todos' || t.oficio === oficio;
    const matchDepto     = departamento === 'Todos' || t.departamento === departamento;
    const matchPrecio    = !precioMax || Number(t.precioPorHora) <= Number(precioMax);
    const matchCal       = Number(t.calificacion || 0) >= calMin;
    return matchBusqueda && matchOficio && matchDepto && matchPrecio && matchCal;
  });

  const limpiarFiltros = () => {
    setBusqueda(''); setOficio('Todos'); setDepartamento('Todos');
    setPrecioMax(''); setCalMin(0); setFiltrosOpen(false);
  };

  const hayFiltros = oficio !== 'Todos' || departamento !== 'Todos' || precioMax || calMin > 0;

  if (cargando) return null;

  return (
    <>
      <div className="page">

        <div className="header">
          <div>
            <p className="header__welcome">Bienvenido de nuevo</p>
            <h2 className="header__name">{nombre || 'Usuario'}</h2>
          </div>
          <button className="header__btn" onClick={() => navigate('/notificaciones')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </button>
        </div>

        {esVerificado && (
          <div className="verified-banner" onClick={() => navigate('/trabajador/home')}>
            <div className="verified-banner__icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                <p className="verified-banner__title">Mi perfil de trabajador</p>
                <span className="verified-banner__badge">Verificado</span>
              </div>
              <p className="verified-banner__sub">{userData?.oficio} · {userData?.departamento}</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        )}

        {!esVerificado && registroCompletado && (
          <div className="pending-banner">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <p>Tu registro como trabajador está <strong>pendiente de aprobación</strong></p>
          </div>
        )}

        {!esVerificado && !registroCompletado && (
          <div className="worker-banner" onClick={() => navigate('../RegistroTrabajador')}>
            <div className="worker-banner__icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2"/>
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="worker-banner__title">¿Eres técnico o profesional?</p>
              <p className="worker-banner__sub">Únete como trabajador y consigue clientes</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        )}

        <div className="promo" style={{ marginBottom: 20 }}>
          <div>
            <p className="promo__label">Oferta especial</p>
            <p className="promo__title">20% OFF en tu primer servicio</p>
            <span className="promo__code">FIXNEAR20</span>
          </div>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8, flexShrink: 0 }}>
            <rect x="2" y="7" width="20" height="14" rx="2"/>
            <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
          </svg>
        </div>

        <div className="search-advanced">

          <div className="search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Busca por nombre u oficio..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
            {busqueda && (
              <button onClick={() => setBusqueda('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, display: 'flex' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
            <button
              className={`filtros-toggle ${filtrosOpen ? 'open' : ''} ${hayFiltros ? 'activo' : ''}`}
              onClick={() => setFiltrosOpen(f => !f)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="6" x2="20" y2="6"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
                <line x1="11" y1="18" x2="13" y2="18"/>
              </svg>
              {hayFiltros && <span className="filtros-dot" />}
            </button>
          </div>

          {filtrosOpen && (
            <div className="filtros-panel">

              <div className="filtro-grupo">
                <label className="filtro-label">Oficio</label>
                <div className="filtro-chips">
                  {OFICIOS.map(o => (
                    <button
                      key={o}
                      className={`filtro-chip ${oficio === o ? 'activo' : ''}`}
                      onClick={() => setOficio(o)}
                    >{o}</button>
                  ))}
                </div>
              </div>

              <div className="filtro-grupo">
                <label className="filtro-label">Departamento</label>
                <select
                  className="filtro-select"
                  value={departamento}
                  onChange={e => setDepartamento(e.target.value)}
                >
                  {DEPARTAMENTOS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className="filtro-row">
                <div className="filtro-grupo" style={{ flex: 1 }}>
                  <label className="filtro-label">Precio máximo/hora</label>
                  <div className="filtro-precio">
                    <span>$</span>
                    <input
                      type="number"
                      placeholder="Sin límite"
                      value={precioMax}
                      onChange={e => setPrecioMax(e.target.value)}
                      className="filtro-input"
                    />
                  </div>
                </div>

                <div className="filtro-grupo" style={{ flex: 1 }}>
                  <label className="filtro-label">Calificación mínima</label>
                  <div className="filtro-estrellas">
                    {[0,1,2,3,4,5].map(n => (
                      <button
                        key={n}
                        className={`filtro-estrella ${calMin === n ? 'activo' : ''}`}
                        onClick={() => setCalMin(n)}
                      >
                        {n === 0 ? 'Todas' : `${n}+`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button className="filtro-limpiar" onClick={limpiarFiltros}>
                Limpiar filtros
              </button>
            </div>
          )}
        </div>

        <div className="sec-header" style={{ marginBottom: 14, marginTop: 8 }}>
          <h3>Técnicos disponibles</h3>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {tecnicosFiltrados.length} resultado{tecnicosFiltrados.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div>
          {tecnicosFiltrados.length === 0 ? (
            <div className="empty-state" style={{ padding: '48px 0' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)', marginBottom: 12 }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                {busqueda || hayFiltros ? 'Sin resultados para los filtros aplicados' : 'Aún no hay técnicos disponibles'}
              </p>
              {(busqueda || hayFiltros) && (
                <button onClick={limpiarFiltros} style={{ marginTop: 12, background: 'none', border: '1px solid var(--border-color)', color: 'var(--accent)', borderRadius: 10, padding: '7px 16px', fontSize: 13, cursor: 'pointer' }}>
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : (
            tecnicosFiltrados.map(t => {
              const nombre = `${t.nombre || ''} ${t.apellido || ''}`.trim();
              const inicial = nombre.charAt(0).toUpperCase();
              const colores = ['#60a5fa','#c084fc','#34d399','#fb923c','#f472b6'];
              const color   = colores[nombre.charCodeAt(0) % colores.length];
              return (
                <div key={t.id} className="tech-card">
                  <div className="tech-card__avatar" style={{ background: color + '25', color }}>
                    {inicial}
                  </div>
                  <div className="tech-card__info">
                    <p className="tech-card__name">{nombre}</p>
                    <p className="tech-card__role">{t.oficio}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        {t.calificacion > 0 ? t.calificacion.toFixed(1) : 'Nuevo'} · {t.departamento}
                      </span>
                    </div>
                    <div className="tech-card__tags">
                      {(t.servicios || []).slice(0, 2).map(s => (
                        <span key={s} className="tech-card__tag">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="tech-card__right">
                    <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent)', marginBottom: 4 }}>
                      ${t.precioPorHora}<span style={{ fontSize: 10, fontWeight: 400, color: 'var(--text-muted)' }}>/h</span>
                    </p>
                    <button className="tech-card__btn" onClick={() => navigate('./contrato')}>solicitar servicio</button>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
      <Navbar />
    </>
  );
}

export default Index;