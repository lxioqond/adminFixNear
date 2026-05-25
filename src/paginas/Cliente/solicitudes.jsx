import '../css/solicitudes.css';
import Navbar from '../barraInferior';

const solicitudes = [
    {
        id: 1,
        servicio: 'Reparación eléctrica',
        tecnico: 'Luis Martínez',
        fecha: 'Hoy, 3:00 p. m.',
        estado: 'En proceso',
        descripcion: 'Revisión de tomacorriente que no funciona.'
    },
    {
        id: 2,
        servicio: 'Fuga de agua',
        tecnico: 'Carlos Hernández',
        fecha: 'Ayer, 5:30 p. m.',
        estado: 'Aceptada',
        descripcion: 'Fuga pequeña debajo del lavamanos.'
    },
    {
        id: 3,
        servicio: 'Mantenimiento de aire acondicionado',
        tecnico: 'Ana Gómez',
        fecha: '15 abril, 10:00 a. m.',
        estado: 'Finalizada',
        descripcion: 'Limpieza general y revisión del equipo.'
    }
];

function Solicitudes() {
    return (
        <>
        <div className="sol-page">
            <div className="sol-header">
            <h2>Solicitudes</h2>
            <p>Servicios solicitados por el cliente</p>
            </div>

            <div className="sol-list">
            {solicitudes.map((item) => (
                <div className="sol-card" key={item.id}>
                <div className="sol-card-top">
                    <div>
                    <h3>{item.servicio}</h3>
                    <p>{item.descripcion}</p>
                    </div>

                    <span className={`sol-estado ${item.estado.toLowerCase().replace(' ', '-')}`}>
                    {item.estado}
                    </span>
                </div>

                <div className="sol-info">
                    <p><strong>Técnico:</strong> {item.tecnico}</p>
                    <p><strong>Fecha:</strong> {item.fecha}</p>
                </div>

                <button className="sol-btn">
                    Ver detalles
                </button>
                </div>
            ))}
            </div>
        </div>

        <Navbar />
        </>
);
}

export default Solicitudes;