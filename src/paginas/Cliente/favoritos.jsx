import '../css/favoritos.css';
import Navbar from '../barraInferior';

const favoritos = [
    {
        id: 1,
        nombre: 'Luis Martínez',
        especialidad: 'Electricista',
        rating: 4.9,
        experiencia: '5 años de experiencia',
        descripcion: 'Especialista en instalaciones eléctricas, mantenimiento y reparación de fallas.'
    },
    {
        id: 2,
        nombre: 'Carlos Hernández',
        especialidad: 'Fontanero',
        rating: 4.8,
        experiencia: '7 años de experiencia',
        descripcion: 'Experto en fugas de agua, tuberías y mantenimiento general del hogar.'
    },
    {
        id: 3,
        nombre: 'Ana Gómez',
        especialidad: 'Técnica en Aire Acondicionado',
        rating: 4.7,
        experiencia: '4 años de experiencia',
        descripcion: 'Mantenimiento, limpieza y reparación de sistemas de aire acondicionado.'
    }
];

function Favoritos() {
return (
    <>
        <div className="fav-page">
            <div className="fav-header">
            <h2>Favoritos</h2>
            <p>Técnicos guardados por el cliente</p>
            </div>

            <div className="fav-list">
            {favoritos.map((item) => (
                <div className="fav-card" key={item.id}>
                <div className="fav-top">
                    <div className="fav-avatar">
                    {item.nombre.charAt(0)}
                    </div>

                    <div className="fav-info">
                    <h3>{item.nombre}</h3>
                    <span>{item.especialidad}</span>
                    </div>

                    <div className="fav-rating">
                    ⭐ {item.rating}
                    </div>
                </div>

                <p className="fav-exp">{item.experiencia}</p>
                <p className="fav-desc">{item.descripcion}</p>

                <button className="fav-btn">
                    Contactar
                </button>
                </div>
            ))}
            </div>
        </div>

    <Navbar />
    </>
);
}

export default Favoritos;