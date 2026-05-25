import '../css/Perfilpublicotrabajador.css';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const COLORES = ['#3b82f6', '#a855f7', '#10b981', '#f97316', '#ec4899'];

function PerfilPublicoTrabajador() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tecnico, setTecnico] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const snap = await getDoc(doc(db, 'usuarios', id));
        if (snap.exists()) setTecnico({ id: snap.id, ...snap.data() });
      } catch (e) {
        console.error(e);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [id]);

  if (cargando) {
    return (
      <div className="perfil-cargando">
        <div className="perfil-spinner" />
      </div>
    );
  }

  if (!tecnico) {
    return (
      <div className="perfil-cargando">
        <p className="perfil-no-encontrado">Técnico no encontrado</p>
      </div>
    );
  }

  const nombre      = `${tecnico.nombre || ''} ${tecnico.apellido || ''}`.trim();
  const inicial     = nombre.charAt(0).toUpperCase();
  const color       = COLORES[nombre.charCodeAt(0) % COLORES.length];
  const estrellas   = tecnico.calificacion || 0;
  const resenas     = tecnico.totalResenas || 0;
  const trabajos    = tecnico.trabajosCompletados || 0;
  const experiencia = tecnico.experiencia || '0';

  const renderEstrellas = (cal) =>
    [1, 2, 3, 4, 5].map(i => (
      <svg key={i} width="13" height="13" viewBox="0 0 24 24"
        fill={i <= Math.round(cal) ? '#d97706' : 'none'}
        stroke="#d97706" strokeWidth="1.5">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ));

  return (
    <div className="perfil-pagina">

      <div className="perfil-header">
        <button className="perfil-btn-back" onClick={() => navigate(-1)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="#aaa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>

        <div className="perfil-header-gradiente" />

        <div className="perfil-avatar-wrap">
          <div className="perfil-avatar" style={{ borderColor: `${color}60` }}>
            {tecnico.fotoPerfil
              ? <img src={tecnico.fotoPerfil} alt={nombre} />
              : <span className="perfil-avatar-inicial" style={{ color }}>{inicial}</span>
            }
          </div>
        </div>

        {tecnico.verificado && (
          <div className="perfil-badge">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Verificado
          </div>
        )}

        <h1 className="perfil-nombre">{nombre}</h1>
        <p className="perfil-oficio">{(tecnico.oficio || '').toUpperCase()}</p>

        <div className="perfil-cal-row">
          <div style={{ display: 'flex', gap: 2 }}>{renderEstrellas(estrellas)}</div>
          <span className="perfil-cal-num">{estrellas > 0 ? estrellas.toFixed(1) : 'Nuevo'}</span>
          {resenas > 0 && <span className="perfil-cal-sub">({resenas} reseñas)</span>}
          <span className="perfil-cal-sep">·</span>
          <span className="perfil-cal-sub">{trabajos} trabajos</span>
        </div>
      </div>

      <div className="perfil-contenido">

        <div className="perfil-precio-card">
          <span className="perfil-precio-label">precio / hora</span>
          <span className="perfil-precio-valor">
            ${tecnico.precioPorHora || '—'}<span className="perfil-precio-unidad">/h</span>
          </span>
        </div>

        <div className="perfil-stats-row">
          <div className="perfil-stat-item">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
              stroke="#555" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <p className="perfil-stat-val">15 min</p>
            <p className="perfil-stat-label">Respuesta</p>
          </div>
          <div className="perfil-stat-item">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
              stroke="#555" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <p className="perfil-stat-val">{experiencia}+</p>
            <p className="perfil-stat-label">Años exp.</p>
          </div>
          <div className="perfil-stat-item">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
              stroke="#555" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <p className="perfil-stat-val">100%</p>
            <p className="perfil-stat-label">Garantía</p>
          </div>
        </div>

        <div className="perfil-info-row">
          <div className="perfil-info-chip">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="#555" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <div>
              <p className="perfil-info-chip-titulo">Seguro Civil</p>
              <p className="perfil-info-chip-sub">Responsabilidad</p>
            </div>
          </div>
          <div className="perfil-info-chip">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="#555" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <div>
              <p className="perfil-info-chip-titulo">{tecnico.municipio || '—'}</p>
              <p className="perfil-info-chip-sub">{tecnico.departamento || ''}</p>
            </div>
          </div>
        </div>

        {tecnico.descripcion && (
          <div className="perfil-card">
            <p className="perfil-card-titulo">Sobre mí</p>
            <p className="perfil-descripcion">{tecnico.descripcion}</p>
            {(tecnico.servicios || []).length > 0 && (
              <div className="perfil-tags-row">
                {tecnico.servicios.map(s => (
                  <span key={s} className="perfil-tag">{s}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {(tecnico.galeria || []).length > 0 && (
          <div className="perfil-card">
            <p className="perfil-card-titulo">Galería de trabajos</p>
            <div className="perfil-galeria">
              {tecnico.galeria.slice(0, 6).map((url, i) => (
                <div key={i} className="perfil-galeria-item">
                  <img src={url} alt={`trabajo ${i + 1}`} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="perfil-spacer" />
      </div>

      <div className="perfil-footer-btn">
        <button
          className="perfil-btn-contratar"
          onClick={() => navigate('/contrato', { state: { tecnicoId: id, tecnico } })}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/>
            <polyline points="13 2 13 9 20 9"/>
          </svg>
          Contratar Servicio
        </button>
      </div>
    </div>
  );
}

export default PerfilPublicoTrabajador;