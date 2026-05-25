import '../css/sobre-nosotros.css';
import { useNavigate } from 'react-router-dom';

function SobreNosotros() {
const navigate = useNavigate();

return (
    <div className="obj-page">
        <button className="obj-back" onClick={() => navigate('/')}>
            <span>←</span>
        </button>

        <div className="obj-header">
            <h1>Conocer más sobre FixNear</h1>
            <p>
            FixNear es una app pensada para conectar clientes con técnicos de confianza
            para servicios del hogar.
            </p>
        </div>

        <div className="obj-card">
            <h3>¿Qué problema resuelve?</h3>
            <p>
            Muchas personas necesitan reparaciones o mantenimiento en casa, pero no siempre
            saben a quién contactar o si el técnico será confiable.
            </p>
        </div>

        <div className="obj-card">
            <h3>¿Cómo ayuda FixNear?</h3>
            <p>
            Permite buscar técnicos por categoría, revisar información básica, guardar favoritos
            y comunicarse mediante mensajes.
            </p>
        </div>

        <div className="obj-card">
            <h3>Funciones principales</h3>
            <ul>
            <li>Búsqueda de técnicos por servicio.</li>
            <li>Perfil del cliente.</li>
            <li>Solicitudes de servicio.</li>
            <li>Mensajes entre cliente y técnico.</li>
            <li>Notificaciones importantes.</li>
            </ul>
        </div>

        <button className="obj-btn" onClick={() => navigate('/registro')}>
            Crear cuenta
        </button>
    </div>
);
}

export default SobreNosotros;