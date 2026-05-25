import '../css/eleccionRol.css';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';

function EleccionRol() {
  const navigate = useNavigate();

  const elegirRol = async (rol) => {
    try {
      const user = auth.currentUser;
      await updateDoc(doc(db, 'usuarios', user.uid), { rol });

      if (rol === 'cliente') {
        window.location.replace('/home');
      } else if (rol === 'trabajador') {
        window.location.replace('/RegistroTrabajador');
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <div className="rol-page">

      <div className="rol-header">
        <div className="rol-logo">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 22V12h6v10" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>FixNear</span>
        </div>
        <h1>¿Cómo quieres usar FixNear?</h1>
        <p>Elige tu perfil para personalizar tu experiencia</p>
      </div>

      <div className="rol-opciones">

        <button className="rol-tarjeta" onClick={() => elegirRol('cliente')}>
          <div className="rol-icono">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div className="rol-texto">
            <h2>Cliente</h2>
            <p>Busco profesionales para servicios en mi hogar</p>
          </div>
          <div className="rol-lista">
            <div className="rol-item">
              <div className="rol-punto"></div>
              <span>Encuentra técnicos verificados cerca de ti</span>
            </div>
            <div className="rol-item">
              <div className="rol-punto"></div>
              <span>Contrata con seguridad y confianza</span>
            </div>
            <div className="rol-item">
              <div className="rol-punto"></div>
              <span>Sigue el estado de tus solicitudes</span>
            </div>
          </div>
          <div className="rol-seleccionar">
            Continuar como Cliente
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>
        </button>

        <button className="rol-tarjeta" onClick={() => elegirRol('trabajador')}>
          <div className="rol-icono trabajador">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5">
              <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
            </svg>
          </div>
          <div className="rol-texto">
            <h2>Trabajador</h2>
            <p>Ofrezco mis servicios profesionales a domicilio</p>
          </div>
          <div className="rol-lista">
            <div className="rol-item">
              <div className="rol-punto"></div>
              <span>Recibe solicitudes de clientes cerca de ti</span>
            </div>
            <div className="rol-item">
              <div className="rol-punto"></div>
              <span>Gestiona tu agenda y disponibilidad</span>
            </div>
            <div className="rol-item">
              <div className="rol-punto"></div>
              <span>Aumenta tus ingresos con más clientes</span>
            </div>
          </div>
          <div className="rol-seleccionar">
            Continuar como Trabajador
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>
        </button>

      </div>

    </div>
  );
}

export default EleccionRol;