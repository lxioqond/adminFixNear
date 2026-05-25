import '../css/cercanos.css';
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../barraInferior';
import { auth, db } from '../../firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';

import { Geolocation } from '@capacitor/geolocation';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const RADIOS = [5, 10, 20, 50];
const COLORES = ['#60a5fa', '#c084fc', '#34d399', '#fb923c', '#f472b6'];

function distanciaKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function crearIconoTecnico(color, inicial) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="42" height="52" viewBox="0 0 42 52">
      <filter id="sombra" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="${color}" flood-opacity="0.4"/>
      </filter>
      <ellipse cx="21" cy="49" rx="8" ry="3" fill="${color}" opacity="0.3"/>
      <path d="M21 2C13.3 2 7 8.3 7 16c0 10.5 14 32 14 32s14-21.5 14-32C35 8.3 28.7 2 21 2z"
        fill="${color}" filter="url(#sombra)"/>
      <circle cx="21" cy="16" r="10" fill="white" opacity="0.95"/>
      <text x="21" y="21" text-anchor="middle" font-family="system-ui,sans-serif"
        font-size="12" font-weight="700" fill="${color}">${inicial}</text>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    iconSize: [42, 52],
    iconAnchor: [21, 52],
    popupAnchor: [0, -54],
    className: 'icono-tecnico',
  });
}

const iconoUsuario = L.divIcon({
  html: `
    <div style="position:relative;width:24px;height:24px;">
      <div style="
        position:absolute;inset:0;border-radius:50%;
        background:rgba(99,102,241,0.25);
        animation:pulso 2s ease-out infinite;
      "></div>
      <div style="
        position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
        width:14px;height:14px;border-radius:50%;
        background:#6366f1;border:2.5px solid white;
        box-shadow:0 2px 8px rgba(99,102,241,0.6);
      "></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  className: 'icono-usuario',
});

function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) map.setView([lat, lng], 13, { animate: true });
  }, [lat, lng]);
  return null;
}

function Cercanos() {
  const navigate = useNavigate();
  const [ubicacion, setUbicacion] = useState(null);
  const [errorGeo, setErrorGeo] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [cargandoG, setCargandoG] = useState(true);
  const [tecnicos, setTecnicos] = useState([]);
  const [radio, setRadio] = useState(10);
  const [oficio, setOficio] = useState('Todos');
  const [oficios, setOficios] = useState(['Todos']);
  const [vistaPanel, setVistaPanel] = useState('mini'); // 'mini' | 'expandido'
  const [tecnicoSeleccionado, setTecnicoSeleccionado] = useState(null);

  useEffect(() => {
    const obtenerUbicacion = async () => {
      try {
        const permiso = await Geolocation.requestPermissions();
        if (permiso.location !== 'granted') {
          setErrorMsg('Activá los permisos de ubicación en Ajustes.');
          setErrorGeo(true);
          setCargandoG(false);
          return;
        }
        const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 20000 });
        setUbicacion({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setCargandoG(false);
      } catch {
        try {
          const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: false, timeout: 15000 });
          setUbicacion({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setCargandoG(false);
        } catch {
          setErrorMsg('No se pudo obtener tu posición. Verificá el GPS.');
          setErrorGeo(true);
          setCargandoG(false);
        }
      }
    };
    obtenerUbicacion();
  }, []);

  useEffect(() => {
    const q = query(
      collection(db, 'usuarios'),
      where('verificado', '==', true),
      where('registroCompletado', '==', true)
    );
    const unsub = onSnapshot(q, snap => {
      const lista = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setTecnicos(lista);
      setOficios(['Todos', ...new Set(lista.map(t => t.oficio).filter(Boolean))]);
    });
    return () => unsub();
  }, []);

  const tecnicosCercanos = tecnicos
    .filter(t => {
      if (!ubicacion || !t.lat || !t.lng) return false;
      t._distancia = distanciaKm(ubicacion.lat, ubicacion.lng, t.lat, t.lng);
      return t._distancia <= radio;
    })
    .filter(t => oficio === 'Todos' || t.oficio === oficio)
    .sort((a, b) => a._distancia - b._distancia);

  const posicion = ubicacion ? [ubicacion.lat, ubicacion.lng] : [-12.046, -77.043]; // Lima como fallback

  return (
    <>
      <style>{`
        @keyframes pulso {
          0%   { transform: scale(1);   opacity: 0.8; }
          100% { transform: scale(2.8); opacity: 0;   }
        }
        .icono-tecnico { background: none !important; border: none !important; }
        .icono-usuario { background: none !important; border: none !important; }
        .leaflet-popup-content-wrapper {
          background: #1e1e2e !important;
          color: #e2e8f0 !important;
          border: 1px solid rgba(255,255,255,0.08) !important;
          border-radius: 14px !important;
          box-shadow: 0 8px 30px rgba(0,0,0,0.4) !important;
          padding: 0 !important;
        }
        .leaflet-popup-tip { background: #1e1e2e !important; }
        .leaflet-popup-content { margin: 0 !important; }
        .leaflet-container { font-family: inherit; }
      `}</style>

      <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: '#0f0f1a' }}>

        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <MapContainer
            center={posicion}
            zoom={13}
            style={{ width: '100%', height: '100%' }}
            zoomControl={false}
            attributionControl={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />

            {ubicacion && <RecenterMap lat={ubicacion.lat} lng={ubicacion.lng} />}

            {ubicacion && (
              <Circle
                center={[ubicacion.lat, ubicacion.lng]}
                radius={radio * 1000}
                pathOptions={{
                  color: '#6366f1',
                  fillColor: '#6366f1',
                  fillOpacity: 0.06,
                  weight: 1.5,
                  dashArray: '6 4',
                }}
              />
            )}

            {ubicacion && (
              <Marker position={[ubicacion.lat, ubicacion.lng]} icon={iconoUsuario}>
                <Popup>
                  <div style={{ padding: '10px 14px', fontSize: 13, color: '#e2e8f0' }}>
                    📍 <strong>Vos estás aquí</strong>
                  </div>
                </Popup>
              </Marker>
            )}

            {tecnicosCercanos.map(t => {
              const nombre = `${t.nombre || ''} ${t.apellido || ''}`.trim();
              const inicial = nombre.charAt(0).toUpperCase();
              const color = COLORES[nombre.charCodeAt(0) % COLORES.length];
              return (
                <Marker
                  key={t.id}
                  position={[t.lat, t.lng]}
                  icon={crearIconoTecnico(color, inicial)}
                  eventHandlers={{
                    click: () => {
                      setTecnicoSeleccionado(t);
                      setVistaPanel('expandido');
                    }
                  }}
                >
                  <Popup>
                    <div style={{ padding: '14px 16px', minWidth: 200 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        <div style={{
                          width: 38, height: 38, borderRadius: '50%',
                          background: color + '22', color,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 16, fontWeight: 700, flexShrink: 0,
                        }}>{inicial}</div>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>{nombre}</p>
                          <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>{t.oficio}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color }}>📍 {t._distancia.toFixed(1)} km</span>
                        <span style={{ fontSize: 15, fontWeight: 700, color: '#6366f1' }}>${t.precioPorHora}/h</span>
                      </div>
                      <button
                        onClick={() => navigate(`/PerfilPublicoTrabajador/${t.id}`)}
                        style={{
                          marginTop: 10, width: '100%', padding: '8px 0',
                          background: '#6366f1', color: 'white', border: 'none',
                          borderRadius: 10, fontSize: 13, fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >Contactar</button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          <button
            onClick={() => {
              if (ubicacion) {
              }
            }}
            style={{
              position: 'absolute', top: 16, right: 16, zIndex: 1000,
              width: 42, height: 42, borderRadius: 12,
              background: 'rgba(15,15,26,0.85)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: ubicacion ? '#6366f1' : '#64748b',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
            </svg>
          </button>

          {ubicacion && (
            <div style={{
              position: 'absolute', top: 16, left: 16, zIndex: 1000,
              background: 'rgba(15,15,26,0.85)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12, padding: '8px 14px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            }}>
              <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>Técnicos cercanos</p>
              <p style={{ fontSize: 20, fontWeight: 800, color: '#6366f1', margin: 0, lineHeight: 1.2 }}>
                {tecnicosCercanos.length}
              </p>
            </div>
          )}

          {cargandoG && (
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)', zIndex: 1000,
              background: 'rgba(15,15,26,0.9)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16, padding: '20px 28px', textAlign: 'center',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                border: '3px solid rgba(99,102,241,0.2)',
                borderTop: '3px solid #6366f1',
                margin: '0 auto 12px',
                animation: 'spin 1s linear infinite',
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>Obteniendo ubicación...</p>
            </div>
          )}

          {errorGeo && (
            <div style={{
              position: 'absolute', top: 70, left: 12, right: 12, zIndex: 1000,
              background: 'rgba(239,68,68,0.12)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 14, padding: '12px 16px',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontSize: 18 }}>⚠️</span>
              <p style={{ fontSize: 12, color: '#fca5a5', margin: 0 }}>{errorMsg}</p>
            </div>
          )}
        </div>

        <div style={{
          background: '#0f0f1a',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '20px 20px 0 0',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.5)',
          transition: 'height 0.35s cubic-bezier(0.4,0,0.2,1)',
          height: vistaPanel === 'expandido' ? '55vh' : '180px',
          display: 'flex', flexDirection: 'column',
          position: 'relative', zIndex: 500,
          overflow: 'hidden',
        }}>

          <div
            onClick={() => setVistaPanel(v => v === 'mini' ? 'expandido' : 'mini')}
            style={{ padding: '12px 0 6px', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', flexShrink: 0 }}
          >
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)' }} />
          </div>

          <div style={{ padding: '0 16px 10px', flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {RADIOS.map(r => (
                <button
                  key={r}
                  onClick={() => setRadio(r)}
                  style={{
                    flex: 1, padding: '7px 0', borderRadius: 10, fontSize: 12, fontWeight: 600,
                    border: `1px solid ${radio === r ? '#6366f1' : 'rgba(255,255,255,0.08)'}`,
                    background: radio === r ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
                    color: radio === r ? '#818cf8' : '#64748b',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >{r} km</button>
              ))}
            </div>
          </div>

          {oficios.length > 1 && (
            <div style={{ paddingLeft: 16, paddingBottom: 10, flexShrink: 0 }}>
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingRight: 16, paddingBottom: 2 }}>
                {oficios.map(o => (
                  <button
                    key={o}
                    onClick={() => setOficio(o)}
                    style={{
                      flexShrink: 0, padding: '5px 14px', borderRadius: 20, fontSize: 11, fontWeight: 500,
                      border: `1px solid ${oficio === o ? '#6366f1' : 'rgba(255,255,255,0.08)'}`,
                      background: oficio === o ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
                      color: oficio === o ? '#818cf8' : '#64748b',
                      cursor: 'pointer', whiteSpace: 'nowrap',
                    }}
                  >{o}</button>
                ))}
              </div>
            </div>
          )}

          <div style={{ overflowY: 'auto', flex: 1, padding: '0 16px' }}>
            {tecnicosCercanos.length === 0 && !cargandoG && ubicacion && (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <p style={{ color: '#475569', fontSize: 13 }}>Sin técnicos en {radio} km</p>
                <button
                  onClick={() => setRadio(r => Math.min(r * 2, 50))}
                  style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#818cf8', borderRadius: 10, padding: '7px 16px', fontSize: 12, cursor: 'pointer', marginTop: 8 }}
                >Ampliar radio</button>
              </div>
            )}

            {tecnicosCercanos.map(t => {
              const nombre = `${t.nombre || ''} ${t.apellido || ''}`.trim();
              const inicial = nombre.charAt(0).toUpperCase();
              const color = COLORES[nombre.charCodeAt(0) % COLORES.length];
              const esSeleccionado = tecnicoSeleccionado?.id === t.id;

              return (
                <div
                  key={t.id}
                  onClick={() => setTecnicoSeleccionado(esSeleccionado ? null : t)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px', marginBottom: 8, borderRadius: 14,
                    background: esSeleccionado ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${esSeleccionado ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.06)'}`,
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  <div style={{
                    width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                    background: color + '20', color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 17, fontWeight: 700,
                  }}>{inicial}</div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', margin: '0 0 2px' }}>{nombre}</p>
                    <p style={{ fontSize: 11, color: '#94a3b8', margin: '0 0 4px' }}>{t.oficio}</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span style={{ fontSize: 10, color, display: 'flex', alignItems: 'center', gap: 3 }}>
                        📍 {t._distancia.toFixed(1)} km
                      </span>
                      {t.calificacion > 0 && (
                        <span style={{ fontSize: 10, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 2 }}>
                          ⭐ {t.calificacion.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: 15, fontWeight: 800, color: '#6366f1', margin: '0 0 6px' }}>
                      ${t.precioPorHora}<span style={{ fontSize: 10, fontWeight: 400, color: '#475569' }}>/h</span>
                    </p>
                    <button
                      onClick={async (e) => {

  e.stopPropagation();

  try {

    const usuarioActual = auth.currentUser;

    if (!usuarioActual) {
      alert('Debes iniciar sesión');
      return;
    }

    const chatId = [
      usuarioActual.uid,
      t.uid
    ]
      .sort()
      .join('_');

    await setDoc(
      doc(db, 'chats', chatId),
      {
        participantes: [
          usuarioActual.uid,
          t.uid
        ],

        nombre: `${t.nombre} ${t.apellido}`,

        oficio: t.oficio || 'Trabajador',

        ultimoMensaje: '',

        timestamp: serverTimestamp()
      },
      { merge: true }
    );

    navigate(`/chat/${chatId}`);

  } catch (error) {

    console.error(error);

    alert('Error al abrir chat');

  }

}}
                      style={{
                        padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                        background: '#6366f1', color: 'white', border: 'none', cursor: 'pointer',
                      }}
                    >Contactar</button>
                  </div>
                </div>
              );
            })}
            <div style={{ height: 80 }} /> {/* Espacio para la Navbar */}
          </div>
        </div>
      </div>

      <Navbar />
    </>
  );
}

export default Cercanos;