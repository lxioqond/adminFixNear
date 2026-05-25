import '../css/conversacion.css';

import {
  useEffect,
  useState
} from 'react';

import {
  useNavigate,
  useParams
} from 'react-router-dom';

import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
  getDoc
} from 'firebase/firestore';
import { auth, db } from '../../firebase';

function Conversacion() {

  const { id } = useParams();
  const navigate = useNavigate();
  const [infoChat, setInfoChat] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');

  useEffect(() => {

    const mensajesRef = collection(
      db,
      'chats',
      id,
      'mensajes'
    );

    const q = query(
      mensajesRef,
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {

      const mensajesFirestore = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      setMensajes(mensajesFirestore);

    });

    return () => unsubscribe();

  }, [id]);

  useEffect(() => {

  const obtenerChat = async () => {

    try {

      const chatRef = doc(db, 'chats', id);

      const chatSnap = await getDoc(chatRef);

      if (chatSnap.exists()) {

        setInfoChat(chatSnap.data());

      }

    } catch (error) {

      console.error(error);

    }

  };

  obtenerChat();

}, [id]);

const enviarMensaje = async () => {

  if (nuevoMensaje.trim() === '') return;

  try {

    await addDoc(
      collection(db, 'chats', id, 'mensajes'),
      {
        texto: nuevoMensaje,
        emisor: auth.currentUser.uid,
        timestamp: serverTimestamp()
      }
    );

    const chatRef = doc(db, 'chats', id);

const incremento = infoChat?.ultimoEmisor === auth.currentUser.uid
  ? infoChat?.noLeidos || 0
  : (infoChat?.noLeidos || 0) + 1;

await updateDoc(
  chatRef,
  {
    ultimoMensaje: nuevoMensaje,

    timestamp: serverTimestamp(),

    ultimoEmisor: auth.currentUser.uid,

    visto: false,

    noLeidos: incremento
  }
);

    setNuevoMensaje('');

  } catch (error) {

    console.error(error);

  }

};

useEffect(() => {

  const marcarComoVisto = async () => {

    try {

      await updateDoc(
        doc(db, 'chats', id),
        {
          visto: true,
          noLeidos: 0
        }
      );

    } catch (error) {

      console.error(error);

    }

  };

  marcarComoVisto();

}, [id]);

  return (

    <div className="conv-page">

      <div className="conv-header">

        <button
          className="back-btn"
          onClick={() => navigate('/chat')}
        >
          ←
        </button>

        <div className="conv-avatar">
          C
        </div>

        <div className="conv-info">
          <h3>
  {infoChat?.nombre || 'Conversación'}
</h3>
          <span>Chat en tiempo real</span>
        </div>

      </div>

      <div className="conv-messages">

        {mensajes.map((msg) => (

          <div
            key={msg.id}
            className={`conv-message ${
              msg.emisor === auth.currentUser.uid
                ? 'enviado'
                : 'recibido'
            }`}
          >

            {msg.texto}

          </div>

        ))}

      </div>

      <div className="conv-input-area">

        <input
          type="text"
          placeholder="Escribe un mensaje..."
          value={nuevoMensaje}
          onChange={(e) =>
            setNuevoMensaje(e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              enviarMensaje();
            }
          }}
        />

        <button onClick={enviarMensaje}>
          Enviar
        </button>

      </div>

    </div>

  );
}

export default Conversacion;