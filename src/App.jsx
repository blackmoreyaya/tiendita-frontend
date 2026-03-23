import { useState, useEffect } from "react";
import axios from "axios";

axios.defaults.baseURL = import.meta.env.VITE_API_URL;

function App() {
  const [productos, setProductos] = useState([]);

  // Nuevos estados para el formulario
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [tipoBoli, setTipoBoli] = useState('Leche')
  const [stock, setStock] = useState("");
  // Estados para el modo edición
  const [editandoId, setEditandoId] = useState(null)
  const [nuevoNombre, setNuevoNombre] = useState('')
  

  const cargarProductos = () => {
    axios.get("/productos/")
      // axios.get('https://arfily-backend.onrender.com/productos/')
      .then((response) => 
        setProductos(response.data))
      .catch((error) => 
        console.error("Error al cargar productos:", error));
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const registrarVenta = (productoId, esMuestra = false) => {
    const datosVenta = { 
      producto_id: productoId, 
      cantidad: 1,
      es_muestra: esMuestra
    };
    axios.post("/ventas/", datosVenta)
      // axios.post('https://arfily-backend.onrender.com/ventas/', datosVenta)
      .then(() => 
        cargarProductos())
      .catch((error) => {
        if (error.response && error.response.status === 400) {
          alert(error.response.data.detail);
        } else {
          console.error("Error al registrar la venta:", error);
        }
      });
  };

  // --- NUEVA FUNCIÓN: Agregar un producto nuevo ---
  // Función modificada para agregar producto
  const agregarProducto = (e) => {
    e.preventDefault()
    
    // Calculamos el precio automáticamente
    const precioCalculado = tipoBoli === 'Leche' ? 20 : 15;
    
    const nuevoProducto = {
      nombre: nombre,
      precio: precioCalculado,
      stock: parseInt(stock)
    }

    axios.post("/productos/", nuevoProducto)
      // axios.post('https://arfily-backend.onrender.com/productos/', nuevoProducto)
      .then((response) => {
        cargarProductos(); // Recargamos la lista para ver el nuevo producto
        // Limpiamos el formulario
        cargarProductos()
        setNombre('')
        setStock('')
        setTipoBoli('Leche')
      })
      .catch((error) => console.error("Error al agregar producto:", error));
  };


  // NUEVA FUNCIÓN: Guardar la edición
  const guardarEdicion = (id) => {
    // Usamos patch y solo mandamos el nombre. ¡FastAPI se encarga del resto!
    axios.patch(`/productos/${id}`, { nombre: nuevoNombre })
      .then(() => {
        cargarProductos()
        setEditandoId(null)
      })
      .catch(error => console.error("Error al editar:", error))
  }

  const agregarStock = (id, stockActual) => {
    // Le pedimos a tu mamá cuántos bolis nuevos hizo (usando un simple prompt para rápido)
    const cantidadNueva = window.prompt("¿Cuántos bolis nuevos vas a meter al refri? 🧊");
    
    // Si cancela o no pone nada, no hacemos nada
    if (!cantidadNueva || isNaN(cantidadNueva) || cantidadNueva <= 0) return;

    // Sumamos lo que ya había más lo nuevo
    const nuevoStock = stockActual + parseInt(cantidadNueva);

    // Le avisamos al backend usando la misma ruta mágica de PATCH
    axios.patch(`/productos/${id}`, { stock: nuevoStock })
      .then(() => {
        cargarProductos(); // Refrescamos la lista para que vea el cambio
      })
      .catch(error => console.error("Error al agregar stock:", error));
  }


  return (
    <div className="min-h-screen p-6 max-w-md mx-auto font-sans">
      {/* Encabezado tipo App */}
      <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-lg mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-wide">
          Bolis Gourmet Arfily 🥔
        </h1>
        <p className="text-blue-200 mt-1">Punto de Venta e Inventario</p>
      </div>

      {/* --- NUEVO FORMULARIO --- */}
      <form
        onSubmit={agregarProducto}
        className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-8"
      >
        <h3 className="font-bold text-gray-700 mb-4">✨ Agregar Nuevo Boli</h3>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Sabor (ej. Fresa, Nuez)"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-3">
            {/* El nuevo selector de Agua/Leche */}
            <select
              value={tipoBoli}
              onChange={(e) => setTipoBoli(e.target.value)}
              className="w-1/2 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="Leche">De Leche ($20)</option>
              <option value="Agua">De Agua ($15)</option>
            </select>

            <input
              type="number"
              placeholder="Cantidad inicial"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
              min="1"
              className="w-1/2 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl shadow-sm transition-transform active:scale-95 mt-2"
          >
            Guardar Boli
          </button>
        </div>
      </form>
      {/* --- FIN DEL FORMULARIO --- */}

      {productos.length === 0 ? (
        <div className="text-center text-gray-500 animate-pulse mt-10">
          <p>Cargando inventario...</p>
        </div>
      ) : (
        <ul className="space-y-4">
              {productos.map((producto) => (
                <div
                  key={producto.id}
                  className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between"
                >
                  {/* Lógica de Edición */}
                  {editandoId === producto.id ? (
                    <div className="flex-1 flex gap-2 mr-4">
                      <input
                        type="text"
                        value={nuevoNombre}
                        onChange={(e) => setNuevoNombre(e.target.value)}
                        className="w-full p-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                      <button
                        onClick={() => guardarEdicion(producto.id)}
                        className="bg-green-500 text-white p-2 rounded-lg text-sm font-bold"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => setEditandoId(null)}
                        className="bg-gray-300 text-gray-700 p-2 rounded-lg text-sm font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    // Vista Normal
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-gray-800">
                          {producto.nombre}
                        </h2>
                        <button
                          onClick={() => {
                            setEditandoId(producto.id);
                            setNuevoNombre(producto.nombre);
                          }}
                          className="text-gray-400 hover:text-blue-500 transition-colors"
                        >
                          ✏️
                        </button>
                      </div>
                      <div className="flex gap-3 text-sm mt-1">
                        <span className="text-gray-500">
                          Precio:{" "}
                          <span className="font-semibold text-gray-700">
                            ${producto.precio}
                          </span>
                        </span>
                        <span className="text-gray-500 flex items-center gap-2">
    Stock:{" "}
    <span className={producto.stock < 10 ? "font-bold text-red-500" : "font-semibold text-green-600"}>
      {producto.stock}
    </span>
    {/* NUEVO BOTÓN PARA SURTIR */}
    <button 
      onClick={() => agregarStock(producto.id, producto.stock)}
      className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-md text-xs font-bold hover:bg-blue-200"
      title="Agregar más bolis de este sabor"
    >
      ➕ Surtir
    </button>
  </span>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
            {/* Botón normal de Venta */}
            <button 
              onClick={() => registrarVenta(producto.id, false)}
              disabled={producto.stock === 0}
              className={`px-5 py-2 rounded-xl font-bold transition-transform active:scale-95 ${
                producto.stock === 0 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              💰 Vender 1
            </button>

            {/* NUEVO Botón de Muestra */}
            <button 
              onClick={() => registrarVenta(producto.id, true)}
              disabled={producto.stock === 0}
              className={`px-5 py-2 rounded-xl font-bold transition-transform active:scale-95 border-2 ${
                producto.stock === 0 
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'border-purple-300 text-purple-600 hover:bg-purple-50'
              }`}
            >
              Muestra 1
            </button>
          </div>
            </div>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
