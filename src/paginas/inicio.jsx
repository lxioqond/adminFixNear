import './css/inicio.css';
import { useNavigate } from 'react-router-dom';

function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="inicio-page">
      <div className="inicio-header">
        <div className="logo-circle">
          <img src="/logoOficial.png" alt="FixNear Logo" className="logo-img" />
        </div>
      </div>

      <div className="inicio-content">
        <div className="hero-icon">🏠🛠️</div>

        <h1>Servicios para el hogar cerca de ti</h1>

        <p>
          Encuentra técnicos confiables para reparaciones, mantenimiento,
          electricidad, plomería y más.
        </p>

        <div className="inicio-actions">
          <button className="btn-primary" onClick={() => navigate('/login')}>
            Iniciar sesión
          </button>

          <button className="btn-secondary" onClick={() => navigate('/registro')}>
            Crear cuenta
          </button>
        </div>

        <button className="btn-info" onClick={() => navigate('/sobre-nosotros')}>
          Conocer más sobre FixNear
        </button>
      </div>
    </div>
  );
}

export default Welcome;