import '../css/perfil.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut, updateProfile } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import NavbarTrabajador from '../barraInferiorTrabajador';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

function PerfilTrabajador() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [fotoUrl, setFotoUrl] = useState(null);
  const [disponible, setDisponible] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const cargarPerfil = async () => {
      if (user.photoURL) setFotoUrl(user.photoURL);

      const docRef = doc(db, 'usuarios', user.uid);
      const docSnap = await getDoc(docRef);

      let datos;
      if (docSnap.exists()) {
        datos = docSnap.data();
      } else {
        datos = {
          nombre: user.displayName?.split(' ')[0] || 'Usuario',
          apellido: user.displayName?.split(' ').slice(1).join(' ') || '',
          email: user.email,
          uid: user.uid
        };
      }

      setUsuario(datos);
      setNombre(datos.nombre);
      setApellido(datos.apellido);
      setDisponible(datos.disponible ?? true);
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
      const user = auth.currentUser;
      const docRef = doc(db, 'usuarios', user.uid);
      await updateDoc(docRef, { nombre, apellido });
      await updateProfile(user, { displayName: `${nombre} ${apellido}` });
      setUsuario(prev => ({ ...prev, nombre, apellido }));
      setEditando(false);
    } catch (error) {
      console.error(error.message);
    }
  };

  const toggleDisponible = async () => {
    const nuevoEstado = !disponible;
    setDisponible(nuevoEstado);
    const user = auth.currentUser;
    await updateDoc(doc(db, 'usuarios', user.uid), { disponible: nuevoEstado });
    setUsuario(prev => ({ ...prev, disponible: nuevoEstado }));
  };

  if (!usuario) {
    return (
      <>
        <div className="perfil-page">
          <p className="perfil-loading">Cargando perfil...</p>
        </div>
        <NavbarTrabajador />
      </>
    );
  }

  return (
    <>
      <div className="perfil-page">

        <div className="perfil-header">
          {fotoUrl ? (
            <img
              src={fotoUrl}
              alt="Foto de perfil"
              style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <div className="perfil-avatar">
              {usuario.nombre?.charAt(0)}
              {usuario.apellido?.charAt(0)}
            </div>
          )}
          <h2>{usuario.nombre} {usuario.apellido}</h2>
          <p>{usuario.oficio || 'Trabajador'}</p>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: usuario.verificado ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${usuario.verificado ? 'rgba(34,197,94,0.3)' : '#2f2f2f'}`,
            borderRadius: 100, padding: '4px 12px', marginTop: 8,
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: usuario.verificado ? '#22c55e' : '#555'
            }} />
            <span style={{ fontSize: 12, color: usuario.verificado ? '#22c55e' : '#666' }}>
              {usuario.verificado ? 'Verificado' : 'Pendiente de verificación'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          {[
            { valor: usuario.trabajosCompletados ?? 0, label: 'Trabajos' },
            { valor: usuario.calificacion ?? 0, label: 'Calificación' },
            { valor: usuario.totalResenas ?? 0, label: 'Reseñas' },
          ].map(s => (
            <div key={s.label} className="perfil-card" style={{ flex: 1, textAlign: 'center', padding: '12px 8px' }}>
              <p style={{ fontSize: 22, fontWeight: 'bold', margin: '0 0 4px', color: '#1e88e5' }}>{s.valor}</p>
              <p style={{ fontSize: 11, color: '#888', margin: 0 }}>{s.label}</p>
            </div>
          ))}
        </div>

        <div className="perfil-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <p style={{ fontWeight: 'bold', fontSize: 14, margin: '0 0 4px' }}>Disponibilidad</p>
            <p style={{ fontSize: 12, color: '#888', margin: 0 }}>
              {disponible ? 'Recibiendo solicitudes' : 'No disponible'}
            </p>
          </div>
          <div
            onClick={toggleDisponible}
            style={{
              width: 50, height: 28,
              background: disponible ? '#1e88e5' : '#2f2f2f',
              borderRadius: 100, padding: 3, cursor: 'pointer',
              display: 'flex',
              justifyContent: disponible ? 'flex-end' : 'flex-start',
              alignItems: 'center', transition: 'all 0.3s',
            }}
          >
            <div style={{ width: 22, height: 22, background: 'white', borderRadius: '50%' }} />
          </div>
        </div>

        <div className="perfil-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Información de la cuenta</h3>
            {!editando && (
              <button
                className="btn-info"
                style={{ fontSize: 13, padding: '4px 12px' }}
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
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  style={{ background: '#1e1e1e', border: '1px solid #2f2f2f', color: 'white', borderRadius: 8, padding: '6px 10px', width: '100%' }}
                />
              </div>
              <div className="perfil-item">
                <span>Apellido</span>
                <input
                  value={apellido}
                  onChange={e => setApellido(e.target.value)}
                  style={{ background: '#1e1e1e', border: '1px solid #2f2f2f', color: 'white', borderRadius: 8, padding: '6px 10px', width: '100%' }}
                />
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button
                  style={{ flex: 1, padding: '10px', borderRadius: 12, border: 'none', background: '#1e88e5', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                  onClick={guardarEdicion}
                >
                  Guardar
                </button>
                <button
                  style={{ flex: 1, padding: '10px', borderRadius: 12, border: '1px solid #2f2f2f', background: '#151515', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                  onClick={() => setEditando(false)}
                >
                  Cancelar
                </button>
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
                <span>Correo</span>
                <p>{usuario.email}</p>
              </div>
              <div className="perfil-item">
                <span>Teléfono</span>
                <p>{usuario.telefono || 'No registrado'}</p>
              </div>
            </>
          )}
        </div>

        <div className="perfil-card">
          <h3>Información profesional</h3>
          <div className="perfil-item">
            <span>Oficio</span>
            <p>{usuario.oficio || '-'}</p>
          </div>
          <div className="perfil-item">
            <span>Experiencia</span>
            <p>{usuario.experiencia ? `${usuario.experiencia} años` : '-'}</p>
          </div>
          <div className="perfil-item">
            <span>Precio por hora</span>
            <p>${usuario.precioPorHora || '-'}</p>
          </div>
          <div className="perfil-item">
            <span>Zona</span>
            <p>{usuario.municipio && usuario.departamento ? `${usuario.municipio}, ${usuario.departamento}` : '-'}</p>
          </div>
          <div className="perfil-item">
            <span>Radio</span>
            <p>{usuario.radio ? `${usuario.radio} km` : '-'}</p>
          </div>
        </div>

        {usuario.servicios?.length > 0 && (
          <div className="perfil-card">
            <h3>Mis servicios</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              {usuario.servicios.map(s => (
                <span key={s} style={{
                  background: 'rgba(30,136,229,0.1)',
                  color: '#1e88e5',
                  border: '1px solid rgba(30,136,229,0.25)',
                  borderRadius: 100, padding: '5px 12px', fontSize: 12,
                }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        <button className="perfil-btn" onClick={cerrarSesion}>
          Cerrar sesión
        </button>

      </div>
      <NavbarTrabajador />
    </>
  );
}

export default PerfilTrabajador;