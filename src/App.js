import './App.css';
import { ThemeProvider } from './ThemeContext';
import SplashScreen from './splashScreen';
import { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

import Welcome from './paginas/inicio';
import Login from './paginas/auth/login';
import Registro from './paginas/auth/registro';
import Index from './paginas/Cliente/home';
import Perfil from './paginas/Cliente/perfil';
import Chat from './paginas/shared/chat';
import Conversacion from './paginas/shared/conversacion';
import Solicitudes from './paginas/Cliente/solicitudes';
import Favoritos from './paginas/Cliente/favoritos';
import Notificaciones from './paginas/shared/notificaciones';
import SobreNosotros from './paginas/shared/sobre-nosotros';
import PerfilTrabajador from './paginas/Trabajador/PerfilTrabajador';
import HomeTrabajador from './paginas/Trabajador/home';
import EleccionRol from './paginas/auth/EleccionRol';
import RegistroTrabajador from './paginas/auth/RegistroTrabajador';
import contrato from './paginas/Trabajador/contrato';
import Cercanos from './paginas/Cliente/Cercanos';
import PerfilPublicoTrabajador from './paginas/Trabajador/Perfilpublicotrabajador';


const rutasSinRetorno = ['/', '/home', '/login', '/inicio', '/trabajador/home', '/cercanos', '/PerfilPublicoTrabajador/:id'];
  
function App() {
  const [loading, setLoading] = useState(true);
  const [usuarioActivo, setUsuarioActivo] = useState(null);
  const [rolUsuario, setRolUsuario] = useState(null);
  const [registroCompletado, setRegistroCompletado] = useState(false);
  const [verificandoSesion, setVerificandoSesion] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUsuarioActivo(user);
      if (user) {
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('./firebase');
        const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setRolUsuario(data.rol ?? 'cliente');
          setRegistroCompletado(data.registroCompletado ?? false);
        } else {
          setRolUsuario('cliente');
        }
      } else {
        setRolUsuario(null);
        setRegistroCompletado(false);
      }
      setVerificandoSesion(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <ThemeProvider>
        <SplashScreen onFinish={() => setLoading(false)} />
      </ThemeProvider>
    );
  }

  if (verificandoSesion || (usuarioActivo && rolUsuario === null)) {
    return (
      <ThemeProvider>
        <div style={{ background: 'var(--bg-primary)', height: '100vh' }} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <MainApp
        usuarioActivo={usuarioActivo}
        rolUsuario={rolUsuario}
        registroCompletado={registroCompletado}
      />
    </ThemeProvider>
  );
}

function MainApp({ usuarioActivo, rolUsuario, registroCompletado }) {
  const navigate = useNavigate();
  const location = useLocation();
  const lastBackPress = useRef(0);
  const locationRef = useRef(location.pathname);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    locationRef.current = location.pathname;
  }, [location.pathname]);

  useEffect(() => {
    let backHandler;

    const setupBackButton = async () => {
      backHandler = await CapacitorApp.addListener('backButton', () => {
        const now = Date.now();
        const pathname = locationRef.current;

        if (!rutasSinRetorno.includes(pathname)) {
          navigate(-1);
          return;
        }

        if (now - lastBackPress.current < 2000) {
          CapacitorApp.exitApp();
        } else {
          lastBackPress.current = now;
          setMensaje('Presiona otra vez para salir');
          setTimeout(() => setMensaje(''), 1500);
        }
      });
    };

    setupBackButton();
    return () => { if (backHandler) backHandler.remove(); };
  }, []);

  const homeDestino = rolUsuario === 'trabajador' && registroCompletado
    ? '/trabajador/home'
    : rolUsuario === 'trabajador'
    ? '/RegistroTrabajador'
    : '/home';

  return (
    <>
      <Routes>
        <Route path="/" element={usuarioActivo ? <Navigate to={homeDestino} replace /> : <Home />} />
        <Route path="/inicio" element={usuarioActivo ? <Navigate to={homeDestino} replace /> : <Welcome />} />
        <Route path="/login" element={usuarioActivo ? <Navigate to={homeDestino} replace /> : <Login />} />
        <Route path="/registro" element={usuarioActivo ? <Navigate to={homeDestino} replace /> : <Registro />} />

        <Route path="/home" element={usuarioActivo ? <Index /> : <Navigate to="/login" replace />} />
        <Route path="/perfil" element={usuarioActivo ? <Perfil /> : <Navigate to="/login" replace />} />
        <Route path="/solicitudes" element={usuarioActivo ? <Solicitudes /> : <Navigate to="/login" replace />} />
        <Route path="/favoritos" element={usuarioActivo ? <Favoritos /> : <Navigate to="/login" replace />} />

        <Route path="/trabajador/home" element={usuarioActivo && rolUsuario === 'trabajador' ? <HomeTrabajador /> : <Navigate to="/login" replace />} />
        <Route path="/trabajador/perfil" element={usuarioActivo && rolUsuario === 'trabajador' ? <PerfilTrabajador /> : <Navigate to="/login" replace />} />

        <Route path="/chat" element={usuarioActivo ? <Chat /> : <Navigate to="/login" replace />} />
        <Route path="/mensajes" element={usuarioActivo ? <Chat /> : <Navigate to="/login" replace />} />
        <Route path="/chat/:id" element={usuarioActivo ? <Conversacion /> : <Navigate to="/login" replace />} />
        <Route path="/notificaciones" element={usuarioActivo ? <Notificaciones /> : <Navigate to="/login" replace />} />
        <Route path="/sobre-nosotros" element={<SobreNosotros />} />

        <Route path="/trabajador/:id" element={usuarioActivo ? <PerfilTrabajador /> : <Navigate to="/login" replace />} />
        <Route path="/rol" element={usuarioActivo ? <EleccionRol /> : <Navigate to="/login" replace />} />
        <Route path="/RegistroTrabajador" element={usuarioActivo ? <RegistroTrabajador /> : <Navigate to="/login" replace />} />
        <Route path="/registro-trabajador" element={<RegistroTrabajador />} />
        <Route path="/contrato" element={usuarioActivo ? <contrato /> : <Navigate to="/login" replace />} />
        <Route path="/cercanos" element={<Cercanos />} />
        <Route path="/PerfilPublicoTrabajador/:id" element={usuarioActivo ? <PerfilPublicoTrabajador /> : <Navigate to="/login" replace />} />

      </Routes>

      {mensaje && (
        <div style={{
          position: 'fixed',
          bottom: '90px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.8)',
          color: '#fff',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '12px',
          zIndex: 9999
        }}>
          {mensaje}
        </div>
      )}
    </>
  );
}

function Home() {
  return <Welcome />;
}

export default App;