import '../css/mensajes.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Navbar from '../barraInferior';

import { auth, db } from '../../firebase';

import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy
} from 'firebase/firestore';

function Mensajes() {
  const navigate = useNavigate();

  const [conversaciones, setConversaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

  const unsubscribeAuth = auth.onAuthStateChanged((user) => {

    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
  collection(db, 'chats'),
  where(
    'participantes',
    'array-contains',
    user.uid
  ),
);

    const unsubscribeChats = onSnapshot(q, (snapshot) => {

      const chats = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      chats.sort((a, b) => {

  if (!a.timestamp) return 1;
  if (!b.timestamp) return -1;

  return b.timestamp.seconds - a.timestamp.seconds;

});
      setConversaciones(chats);
      setLoading(false);

    }, (error) => {
  console.error(error);
  setLoading(false);
});

    return () => unsubscribeChats();
  });

  return () => unsubscribeAuth();

}, []);

  const obtenerIniciales = (nombre = '') => {
    return nombre
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const formatearHora = (timestamp) => {
    if (!timestamp) return '';

    const fecha = timestamp.toDate();

    return fecha.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="mensajes-page">
        <h2 style={{ color: 'white', textAlign: 'center' }}>
          Cargando conversaciones...
        </h2>
      </div>
    );
  }

  return (
    <>
      <div className="mensajes-page">

        <div className="mensajes-header">
          <h1>Mensajes</h1>

          <button className="mensajes-editar">
          </button>
        </div>

        <div className="mensajes-lista">

          {conversaciones.length === 0 ? (
            <div
              style={{
                color: 'white',
                textAlign: 'center',
                marginTop: '40px'
              }}
            >
              No tienes conversaciones todavía
            </div>
          ) : (
            conversaciones.map((conv) => (
              <div
                key={conv.id}
                className="mensajes-item"
                onClick={() => navigate(`/chat/${conv.id}`)}
              >

                <div className="mensajes-avatar">
                  {obtenerIniciales(conv.nombre || 'U')}
                  <span className="mensajes-avatar-punto"></span>
                </div>

                <div className="mensajes-info">

                  <div className="mensajes-info-top">
                    <span className="mensajes-nombre">
                      {conv.nombre || 'Usuario'}
                    </span>

                    <span className="mensajes-hora">
                      {formatearHora(conv.timestamp)}
                    </span>
                  </div>

                  <div className="mensajes-info-bottom">

                    <span className="mensajes-ultimo">
                      {conv.ultimoMensaje || 'Sin mensajes'}
                    </span>
                    {!conv.visto &&
  conv.ultimoEmisor !== auth.currentUser.uid &&
  conv.noLeidos > 0 && (

  <span className="mensajes-badge">
    {conv.noLeidos}
  </span>

)}

                  </div>

                  <span className="mensajes-oficio">
                    {conv.oficio || 'Trabajador'}
                  </span>

                </div>
              </div>
            ))
          )}

        </div>
      </div>

      <Navbar />
    </>
  );
}

export default Mensajes;