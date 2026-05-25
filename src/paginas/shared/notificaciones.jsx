import '../css/notificaciones.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../barraInferior';
import { auth, db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';

function Notificaciones() {
const [nombre, setNombre] = useState('');
const navigate = useNavigate();

useEffect(() => {
    const obtenerUsuario = async () => {
        const user = auth.currentUser;

        if (!user) {
        navigate('/login', { replace: true });
        return;
        }

    const docRef = doc(db, 'usuarios', user.uid);
    const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
        setNombre(docSnap.data().nombre);
        }
    };

    obtenerUsuario();
}, [navigate]);

return (
    <>
        <div className="noti-page">
            <div className="noti-header">
            <h2>Notificaciones</h2>
            <p>Avisos recientes de FixNear</p>
            </div>

            <div className="noti-card bienvenida">
            <div className="noti-icon">👋</div>

            <div className="noti-content">
                <h3>Bienvenido a FixNear</h3>
                <p>
                Hola {nombre || 'usuario'}, nos alegra tenerte de vuelta.
                Desde aquí podrás recibir avisos sobre tus solicitudes,
                mensajes de técnicos y actualizaciones de tus servicios.
                </p>
                <span>Ahora</span>
            </div>
            </div>
        </div>

    <Navbar />
    </>
);
}

export default Notificaciones;