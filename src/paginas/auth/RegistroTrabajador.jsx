import '../css/registroTrabajador.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';

const OFICIOS = [
  'Electricista', 'Plomero', 'Pintor', 'Carpintero',
  'Limpieza', 'Jardinero', 'Albañil', 'Cerrajero',
  'Técnico en refrigeración', 'Técnico en electrodomésticos'
];

const SERVICIOS_POR_OFICIO = {
  Electricista: ['Instalación eléctrica', 'Reparación de circuitos', 'Cambio de tomacorrientes', 'Revisión de tableros', 'Instalación de lámparas'],
  Plomero: ['Reparación de tuberías', 'Instalación de grifos', 'Destape de cañerías', 'Instalación de sanitarios'],
  Pintor: ['Pintura interior', 'Pintura exterior', 'Pintura de fachadas', 'Pintura de techos'],
  Carpintero: ['Fabricación de muebles', 'Reparación de puertas', 'Instalación de pisos', 'Reparación de ventanas'],
  Limpieza: ['Limpieza del hogar', 'Limpieza de oficinas', 'Limpieza profunda', 'Limpieza de ventanas'],
  Jardinero: ['Corte de césped', 'Poda de árboles', 'Diseño de jardines', 'Fumigación'],
  Albañil: ['Construcción', 'Reparación de paredes', 'Instalación de pisos', 'Impermeabilización'],
  Cerrajero: ['Apertura de puertas', 'Cambio de cerraduras', 'Duplicado de llaves', 'Instalación de chapas'],
  'Técnico en refrigeración': ['Reparación de aires acondicionados', 'Instalación de aires', 'Mantenimiento de refrigeradoras'],
  'Técnico en electrodomésticos': ['Reparación de lavadoras', 'Reparación de microondas', 'Reparación de televisores']
};

const DEPARTAMENTOS = [
  'Ahuachapán', 'Cabañas', 'Chalatenango', 'Cuscatlán',
  'La Libertad', 'La Paz', 'La Unión', 'Morazán',
  'San Miguel', 'San Salvador', 'San Vicente', 'Santa Ana',
  'Sonsonate', 'Usulután'
];

const Toast = ({ mensaje, visible }) => (
  <div style={{
    position: 'fixed', bottom: 32, left: '50%',
    transform: `translateX(-50%) translateY(${visible ? 0 : 20}px)`,
    opacity: visible ? 1 : 0,
    transition: 'opacity 0.3s ease, transform 0.3s ease',
    background: '#1e1e1e', border: '1px solid #2f2f2f',
    color: '#fff', borderRadius: 14, padding: '13px 20px',
    fontSize: 14, fontWeight: 500,
    display: 'flex', alignItems: 'center', gap: 10,
    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
    zIndex: 9999, maxWidth: '85vw', pointerEvents: 'none',
  }}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
    {mensaje}
  </div>
);

function RegistroTrabajador() {
  const navigate = useNavigate();
  const [paso, setPaso] = useState(1);
  const [cargando, setCargando] = useState(false);
  const [toast, setToast] = useState({ visible: false, mensaje: '' });
  const [obteniendo, setObteniendo] = useState(false);

  const [form, setForm] = useState({
    fotoPerfil: null, fotoPerfilPreview: null,
    oficio: '', experiencia: '', telefono: '',
    precioPorHora: '', descripcion: '', servicios: [],
    departamento: '', municipio: '', radio: '10',
    fotoDUI: null, fotoDUIPreview: null,
    lat: null, lng: null,
  });

  const mostrarToast = (mensaje, duracion = 2500) => {
    setToast({ visible: true, mensaje });
    setTimeout(() => setToast({ visible: false, mensaje: '' }), duracion);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFoto = (e, campo) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm({ ...form, [campo]: file, [`${campo}Preview`]: URL.createObjectURL(file) });
  };

  const toggleServicio = (servicio) => {
    const existe = form.servicios.includes(servicio);
    setForm({ ...form, servicios: existe ? form.servicios.filter(s => s !== servicio) : [...form.servicios, servicio] });
  };

  const obtenerUbicacion = () => {
    if (!navigator.geolocation) {
      alert('Tu dispositivo no soporta geolocalización');
      return;
    }
    setObteniendo(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm(f => ({ ...f, lat: pos.coords.latitude, lng: pos.coords.longitude }));
        setObteniendo(false);
        mostrarToast('Ubicación obtenida correctamente');
      },
      () => {
        setObteniendo(false);
        alert('No se pudo obtener la ubicación. Verifica los permisos.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const validarPaso = () => {
    if (paso === 1 && (!form.oficio || !form.experiencia || !form.telefono)) {
      alert('Completa todos los campos obligatorios'); return false;
    }
    if (paso === 2 && (!form.precioPorHora || !form.descripcion || form.servicios.length === 0)) {
      alert('Completa todos los campos y selecciona al menos un servicio'); return false;
    }
    if (paso === 3) {
      if (!form.departamento || !form.municipio) {
        alert('Selecciona tu departamento y municipio'); return false;
      }
      if (!form.lat || !form.lng) {
        alert('Debes obtener tu ubicación para continuar'); return false;
      }
    }
    return true;
  };

  const siguiente = () => { if (validarPaso()) setPaso(paso + 1); };

  const guardar = async () => {
    if (!validarPaso()) return;
    setCargando(true);
    try {
      const user = auth.currentUser;
      await updateDoc(doc(db, 'usuarios', user.uid), {
        oficio: form.oficio,
        experiencia: form.experiencia,
        telefono: form.telefono,
        precioPorHora: form.precioPorHora,
        descripcion: form.descripcion,
        servicios: form.servicios,
        departamento: form.departamento,
        municipio: form.municipio,
        radio: form.radio,
        lat: form.lat,
        lng: form.lng,
        verificado: false,
        disponible: true,
        calificacion: 0,
        totalResenas: 0,
        trabajosCompletados: 0,
        registroCompletado: true,
      });
      mostrarToast('Tu registro de trabajador estará pendiente');
      setTimeout(() => window.location.replace('/trabajador/home'), 2800);
    } catch (error) {
      console.error(error.message);
      alert('Error al guardar tu perfil');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="rt-page">
      <Toast mensaje={toast.mensaje} visible={toast.visible} />

      <div className="rt-header">
        <div className="rt-pasos">
          {[1, 2, 3].map(n => (
            <div key={n} className={`rt-paso ${paso >= n ? 'activo' : ''}`}>
              <div className="rt-paso-circulo">{n}</div>
              <span>{n === 1 ? 'Básico' : n === 2 ? 'Servicios' : 'Ubicación'}</span>
            </div>
          ))}
        </div>
        <div className="rt-barra">
          <div className="rt-barra-progreso" style={{ width: `${(paso / 3) * 100}%` }} />
        </div>
      </div>

      <div className="rt-contenido">

        {paso === 1 && (
          <>
            <h2>Información básica</h2>
            <p className="rt-subtitulo">Cuéntanos sobre ti y tu experiencia</p>
            <div className="rt-foto-grupo">
              <div className="rt-foto-preview">
                {form.fotoPerfilPreview
                  ? <img src={form.fotoPerfilPreview} alt="perfil" />
                  : <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                }
              </div>
              <label className="rt-foto-btn">
                Subir foto de perfil
                <input type="file" accept="image/*" onChange={(e) => handleFoto(e, 'fotoPerfil')} hidden />
              </label>
              <span className="rt-opcional">Opcional</span>
            </div>
            <div className="rt-campo">
              <label>Oficio principal *</label>
              <select name="oficio" value={form.oficio} onChange={handleChange}>
                <option value="">Selecciona tu oficio</option>
                {OFICIOS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="rt-campo">
              <label>Años de experiencia *</label>
              <select name="experiencia" value={form.experiencia} onChange={handleChange}>
                <option value="">Selecciona</option>
                <option value="1">Menos de 1 año</option>
                <option value="2">1 - 2 años</option>
                <option value="5">3 - 5 años</option>
                <option value="8">6 - 10 años</option>
                <option value="10">Más de 10 años</option>
              </select>
            </div>
            <div className="rt-campo">
              <label>Teléfono *</label>
              <input type="tel" name="telefono" placeholder="7777-1234" value={form.telefono} onChange={handleChange} />
            </div>
          </>
        )}

        {paso === 2 && (
          <>
            <h2>Servicios y precio</h2>
            <p className="rt-subtitulo">Define qué ofreces y cuánto cobras</p>
            <div className="rt-campo">
              <label>Precio por hora (USD) *</label>
              <div className="rt-precio-input">
                <span>$</span>
                <input type="number" name="precioPorHora" placeholder="25" value={form.precioPorHora} onChange={handleChange} />
              </div>
            </div>
            <div className="rt-campo">
              <label>Descripción de tus servicios *</label>
              <textarea name="descripcion" placeholder="Describe tu experiencia, métodos de trabajo y qué te diferencia..." value={form.descripcion} onChange={handleChange} rows={4} />
            </div>
            <div className="rt-campo">
              <label>Servicios específicos * <span className="rt-opcional">(elige los que ofreces)</span></label>
              <div className="rt-servicios-grid">
                {(SERVICIOS_POR_OFICIO[form.oficio] || []).map(s => (
                  <button key={s} type="button"
                    className={`rt-servicio-tag ${form.servicios.includes(s) ? 'seleccionado' : ''}`}
                    onClick={() => toggleServicio(s)}>{s}</button>
                ))}
              </div>
            </div>
          </>
        )}

        {paso === 3 && (
          <>
            <h2>Ubicación y verificación</h2>
            <p className="rt-subtitulo">¿Dónde trabajas y cómo verificamos tu identidad?</p>

            <div className="rt-campo">
              <label>Departamento *</label>
              <select name="departamento" value={form.departamento} onChange={handleChange}>
                <option value="">Selecciona tu departamento</option>
                {DEPARTAMENTOS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="rt-campo">
              <label>Municipio *</label>
              <input type="text" name="municipio" placeholder="Tu municipio" value={form.municipio} onChange={handleChange} />
            </div>

            <div className="rt-campo">
              <label>Radio de cobertura</label>
              <div className="rt-radio-opciones">
                {['5', '10', '20', '50'].map(r => (
                  <button key={r} type="button"
                    className={`rt-radio-btn ${form.radio === r ? 'seleccionado' : ''}`}
                    onClick={() => setForm({ ...form, radio: r })}>{r} km</button>
                ))}
              </div>
            </div>
            
            <div className="rt-campo">
              <label>Ubicación GPS *</label>
              <button
                type="button"
                className={`rt-ubicacion-btn ${form.lat ? 'obtenida' : ''}`}
                onClick={obtenerUbicacion}
                disabled={obteniendo}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
                  <circle cx="12" cy="12" r="9" strokeDasharray="2 4"/>
                </svg>
                {obteniendo ? 'Obteniendo ubicación...' : form.lat ? 'Ubicación obtenida' : 'Obtener mi ubicación'}
              </button>
              {form.lat && (
                <p style={{ fontSize: 11, color: '#22c55e', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  Coordenadas: {form.lat.toFixed(4)}, {form.lng.toFixed(4)}
                </p>
              )}
            </div>

            <div className="rt-campo">
              <label>Foto del DUI <span className="rt-opcional">Opcional — para obtener verificación</span></label>
              <div className="rt-dui-upload" onClick={() => document.getElementById('inputDUI').click()}>
                {form.fotoDUIPreview
                  ? <img src={form.fotoDUIPreview} alt="DUI" className="rt-dui-preview" />
                  : <>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5">
                        <rect x="2" y="5" width="20" height="14" rx="2"/>
                        <circle cx="8" cy="12" r="2"/>
                        <path d="M14 10h4M14 14h4"/>
                      </svg>
                      <span>Toca para subir foto del DUI</span>
                      <span className="rt-dui-info">Tu información está protegida y segura</span>
                    </>
                }
              </div>
              <input id="inputDUI" type="file" accept="image/*" onChange={(e) => handleFoto(e, 'fotoDUI')} hidden />
            </div>
          </>
        )}
      </div>

      <div className="rt-footer">
        {paso > 1 && <button className="rt-btn-back" onClick={() => setPaso(paso - 1)}>Atrás</button>}
        {paso < 3
          ? <button className="rt-btn-siguiente" onClick={siguiente}>Siguiente</button>
          : <button className="rt-btn-siguiente" onClick={guardar} disabled={cargando}>
              {cargando ? 'Guardando...' : 'Finalizar registro'}
            </button>
        }
      </div>
    </div>
  );
}

export default RegistroTrabajador;