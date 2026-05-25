import '../css/registro.css';
import { useState } from 'react';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { auth, db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

function Registro() {
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(false);
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: ''
  });

  const redirigirSegunRol = async (user) => {
    const docRef = doc(db, 'usuarios', user.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists() || !docSnap.data().rol) {
      navigate('/home', { replace: true });
    } else if (docSnap.data().rol === 'cliente') {
      navigate('/home', { replace: true });
    } else {
      navigate('/trabajador/home', { replace: true });
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.nombre || !form.apellido) {
      alert('Completa todos los campos');
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const user = userCredential.user;
      await setDoc(doc(db, 'usuarios', user.uid), {
        nombre: form.nombre,
        apellido: form.apellido,
        email: form.email,
        uid: user.uid,
        rol: 'cliente'
      });
      navigate('/home', { replace: true });
    } catch (error) {
      console.error(error.message);
      alert('Error: ' + error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setCargando(true);

      try { await GoogleAuth.signOut(); } catch (_) {}

      const googleUser = await GoogleAuth.signIn();
      const credential = GoogleAuthProvider.credential(googleUser.authentication.idToken);
      const result = await signInWithCredential(auth, credential);
      const user = result.user;

      const docRef = doc(db, 'usuarios', user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        await setDoc(docRef, {
          nombre: user.displayName?.split(' ')[0] || '',
          apellido: user.displayName?.split(' ').slice(1).join(' ') || '',
          email: user.email,
          uid: user.uid,
          rol: 'cliente'
        });
      }

      await redirigirSegunRol(user);
    } catch (error) {
      console.error('Error con Google:', error.message);
      alert('No se pudo registrar con Google');
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return (
      <div className="login-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'white' }}>Iniciando sesión...</p>
      </div>
    );
  }

  return (
    <div className="registro-container">

      <button className="registro-back" onClick={() => navigate(-1)}>←</button>

      <h1>Crea tu cuenta</h1>
      <p className="registro-subtitle">
        ¿Ya tienes una cuenta? <a onClick={() => navigate('/login')}>Inicia sesión</a>
      </p>

      <form onSubmit={handleSubmit}>
        <div className="campo-grupo">
          <label>Nombre</label>
          <input type="text" name="nombre" placeholder="Tu nombre" onChange={handleChange} />
        </div>

        <div className="campo-grupo">
          <label>Apellido</label>
          <input type="text" name="apellido" placeholder="Tu apellido" onChange={handleChange} />
        </div>

        <div className="campo-grupo">
          <label>Email</label>
          <input type="email" name="email" placeholder="correo@ejemplo.com" onChange={handleChange} />
        </div>

        <div className="campo-grupo">
          <label>Contraseña</label>
          <input type="password" name="password" placeholder="••••••••" onChange={handleChange} />
        </div>

        <button type="submit" className="btn-registrarse">Registrarse</button>
      </form>

      <div className="divisor">O regístrate con</div>

      <div className="social-btns">
        <button className="btn-social" type="button" onClick={handleGoogleLogin}>
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google
        </button>
      </div>

      <p className="terminos">
        Al registrarse, acepta los <a href="#">Términos de servicio</a> y el <a href="#">Acuerdo de procesamiento de datos</a>
      </p>

    </div>
  );
}

export default Registro;