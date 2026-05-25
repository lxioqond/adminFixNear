import '../css/homeTrabajador.css';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import NavbarTrabajador from '../barraInferiorTrabajador';

function HomeTrabajador() {
  const [trabajador, setTrabajador] = useState(null);
  const [disponible, setDisponible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [solicitudes, setSolicitudes] = useState([]);
  const [toggleCargando, setToggleCargando] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setError('No hay sesión activa');
        setLoading(false);
        return;
      }
      await cargar(user.uid);
    });
    return () => unsubscribe();
  }, []);

  const cargar = async (uid) => {
    try {
      setLoading(true);
      setError(null);

      const docSnap = await getDoc(doc(db, 'usuarios', uid));
      if (!docSnap.exists()) {
        setError('No se encontró tu perfil');
        return;
      }

      const datos = docSnap.data();
      setTrabajador(datos);
      setDisponible(datos.disponible ?? true);

      try {
        const q = query(
          collection(db, 'solicitudes'),
          where('trabajadorId', '==', uid),
          orderBy('fechaCreacion', 'desc'),
          limit(5)
        );
        const snap = await getDocs(q);
        setSolicitudes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch {
        setSolicitudes([]);
      }

    } catch (err) {
      console.error(err);
      setError('Error al cargar tu perfil. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const toggleDisponible = async () => {
    if (toggleCargando) return;
    setToggleCargando(true);
    const nuevoEstado = !disponible;
    setDisponible(nuevoEstado);
    try {
      const user = auth.currentUser;
      await updateDoc(doc(db, 'usuarios', user.uid), { disponible: nuevoEstado });
    } catch (err) {
      console.error(err);
      setDisponible(!nuevoEstado);
      alert('No se pudo actualizar tu estado. Intenta de nuevo.');
    } finally {
      setToggleCargando(false);
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'pendiente': return '#f59e0b';
      case 'aceptado': return '#3b82f6';
      case 'completado': return '#10b981';
      case 'cancelado': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getEstadoLabel = (estado) => {
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'aceptado': return 'En curso';
      case 'completado': return 'Completado';
      case 'cancelado': return 'Cancelado';
      default: return estado ?? 'Desconocido';
    }
  };

  if (loading) {
    return (
      <>
        <div className="ht-page">
          <div className="ht-loading-container">
            <div className="ht-spinner" />
            <p>Cargando tu perfil...</p>
          </div>
        </div>
        <NavbarTrabajador />
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="ht-page">
          <div className="ht-error-container">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v4M12 16h.01"/>
            </svg>
            <p>{error}</p>
            <button
              className="ht-btn-reintentar"
              onClick={() => cargar(auth.currentUser?.uid)}
            >
              Reintentar
            </button>
          </div>
        </div>
        <NavbarTrabajador />
      </>
    );
  }

  const solicitudesPendientes = solicitudes.filter(s => s.estado === 'pendiente').length;
  const gananciasEstimadas = (trabajador.trabajosCompletados ?? 0) * parseFloat(trabajador.precioPorHora ?? 0);

  return (
    <>
      <div className="ht-page">

        <div className="ht-header">
          <div>
            <p className="ht-saludo">Hola,</p>
            <h2 className="ht-nombre">
              {trabajador.nombre ?? ''} {trabajador.apellido ?? ''}
            </h2>
            <p className="ht-oficio">{trabajador.oficio ?? 'Sin oficio asignado'}</p>
          </div>
          <div className="ht-avatar">
            {trabajador.nombre?.charAt(0) ?? '?'}{trabajador.apellido?.charAt(0) ?? ''}
          </div>
        </div>

        <div className="ht-disponibilidad">
          <div>
            <p className="ht-disponibilidad-titulo">Estado</p>
            <p className="ht-disponibilidad-sub">
              {disponible ? 'Estás recibiendo solicitudes' : 'No estás recibiendo solicitudes'}
            </p>
          </div>
          <div
            className={`ht-toggle ${disponible ? 'activo' : ''} ${toggleCargando ? 'cargando' : ''}`}
            onClick={toggleDisponible}
          >
            <div className="ht-toggle-circulo" />
          </div>
        </div>

        {solicitudesPendientes > 0 && (
          <div className="ht-alerta-pendientes">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
            <span>Tienes <strong>{solicitudesPendientes}</strong> solicitud{solicitudesPendientes > 1 ? 'es' : ''} pendiente{solicitudesPendientes > 1 ? 's' : ''}</span>
          </div>
        )}

        <div className="ht-stats">
          <div className="ht-stat-card">
            <p className="ht-stat-valor">{trabajador.trabajosCompletados ?? 0}</p>
            <p className="ht-stat-label">Trabajos</p>
          </div>
          <div className="ht-stat-card">
            <p className="ht-stat-valor">{trabajador.calificacion ?? 0}</p>
            <p className="ht-stat-label">Calificación</p>
          </div>
          <div className="ht-stat-card">
            <p className="ht-stat-valor">{trabajador.totalResenas ?? 0}</p>
            <p className="ht-stat-label">Reseñas</p>
          </div>
        </div>

        <div className="ht-card">
          <h3>Estadísticas recientes</h3>
          <div className="ht-estadisticas-recientes">
            <div className="ht-estadistica-item">
              <div className="ht-estadistica-icono azul">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                </svg>
              </div>
              <div>
                <p className="ht-estadistica-valor">${gananciasEstimadas.toFixed(0)}</p>
                <p className="ht-estadistica-label">Ganancias estimadas</p>
              </div>
            </div>
            <div className="ht-estadistica-item">
              <div className="ht-estadistica-icono verde">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                  <path d="M22 4L12 14.01l-3-3"/>
                </svg>
              </div>
              <div>
                <p className="ht-estadistica-valor">{solicitudes.filter(s => s.estado === 'completado').length}</p>
                <p className="ht-estadistica-label">Completados este mes</p>
              </div>
            </div>
            <div className="ht-estadistica-item">
              <div className="ht-estadistica-icono amarillo">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
              </div>
              <div>
                <p className="ht-estadistica-valor">{solicitudesPendientes}</p>
                <p className="ht-estadistica-label">Pendientes</p>
              </div>
            </div>
          </div>
        </div>

        <div className="ht-card">
          <h3>Acciones rápidas</h3>
          <div className="ht-acciones">
            <button className="ht-accion-btn" onClick={() => window.location.href = '/trabajador/solicitudes'}>
              <div className="ht-accion-icono">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
                  <rect x="9" y="3" width="6" height="4" rx="1"/>
                  <path d="M9 12h6M9 16h4"/>
                </svg>
              </div>
              <span>Ver solicitudes</span>
            </button>
            <button className="ht-accion-btn" onClick={() => window.location.href = '/trabajador/perfil'}>
              <div className="ht-accion-icono">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <span>Mi perfil</span>
            </button>
            <button className="ht-accion-btn" onClick={() => window.location.href = '/chat'}>
              <div className="ht-accion-icono">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                </svg>
              </div>
              <span>Mensajes</span>
            </button>
            <button className="ht-accion-btn" onClick={() => window.location.href = '/notificaciones'}>
              <div className="ht-accion-icono">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
                </svg>
              </div>
              <span>Notificaciones</span>
            </button>
          </div>
        </div>

        <div className="ht-card">
          <h3>Solicitudes recientes</h3>
          {solicitudes.length === 0 ? (
            <div className="ht-empty">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
                <rect x="9" y="3" width="6" height="4" rx="1"/>
              </svg>
              <p>Aún no tienes solicitudes</p>
            </div>
          ) : (
            <div className="ht-solicitudes-lista">
              {solicitudes.map(s => (
                <div key={s.id} className="ht-solicitud-item">
                  <div className="ht-solicitud-info">
                    <p className="ht-solicitud-servicio">{s.servicio ?? 'Servicio'}</p>
                    <p className="ht-solicitud-cliente">{s.clienteNombre ?? 'Cliente'}</p>
                  </div>
                  <span
                    className="ht-solicitud-estado"
                    style={{ color: getEstadoColor(s.estado), borderColor: getEstadoColor(s.estado) }}
                  >
                    {getEstadoLabel(s.estado)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="ht-card">
          <h3>Mi información</h3>
          <div className="ht-info-item">
            <span>Precio por hora</span>
            <p>${trabajador.precioPorHora ?? '—'}</p>
          </div>
          <div className="ht-info-item">
            <span>Zona</span>
            <p>{trabajador.municipio ?? '—'}, {trabajador.departamento ?? '—'}</p>
          </div>
          <div className="ht-info-item">
            <span>Radio</span>
            <p>{trabajador.radio ?? '—'} km</p>
          </div>
          <div className="ht-info-item">
            <span>Verificado</span>
            <p>{trabajador.verificado ? '✓ Verificado' : 'Pendiente'}</p>
          </div>
        </div>

        <div className="ht-card">
          <h3>Mis servicios</h3>
          {(trabajador.servicios ?? []).length === 0 ? (
            <p className="ht-empty-servicios">No has agregado servicios aún</p>
          ) : (
            <div className="ht-servicios">
              {(trabajador.servicios ?? []).map(s => (
                <span key={s} className="ht-servicio-tag">{s}</span>
              ))}
            </div>
          )}
        </div>

      </div>
      <NavbarTrabajador />
    </>
  );
}

export default HomeTrabajador;