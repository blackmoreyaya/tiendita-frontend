import { useState, useEffect } from 'react'
import axios from 'axios'

function App() {
  const [productos, setProductos] = useState([])
  
  // Nuevos estados para el formulario
  const [nombre, setNombre] = useState('')
  const [precio, setPrecio] = useState('')
  const [stock, setStock] = useState('')

  const cargarProductos = () => {
    // axios.get('http://127.0.0.1:8000/productos/')
    axios.get('https://arfily-backend.onrender.com/productos/')
      .then(response => setProductos(response.data))
      .catch(error => console.error("Error al cargar productos:", error))
  }

  useEffect(() => {
    cargarProductos()
  }, [])

  const registrarVenta = (productoId) => {
    const datosVenta = { producto_id: productoId, cantidad: 1 }
    // axios.post('http://127.0.0.1:8000/ventas/', datosVenta)
    axios.post('https://arfily-backend.onrender.com/ventas/', datosVenta)
      .then(() => cargarProductos())
      .catch(error => {
        if (error.response && error.response.status === 400) {
          alert(error.response.data.detail)
        } else {
          console.error("Error al registrar la venta:", error)
        }
      })
  }

  // --- NUEVA FUNCIÓN: Agregar un producto nuevo ---
  const agregarProducto = (e) => {
    e.preventDefault() // Evita que la página se recargue al enviar el formulario
    
    const nuevoProducto = {
      nombre: nombre,
      precio: parseFloat(precio), // FastAPI espera un número decimal
      stock: parseInt(stock)      // FastAPI espera un número entero
    }

    // axios.post('http://127.0.0.1:8000/productos/', nuevoProducto)
    axios.post('https://arfily-backend.onrender.com/productos/', nuevoProducto)
      .then(response => {
        cargarProductos() // Recargamos la lista para ver el nuevo producto
        // Limpiamos el formulario
        setNombre('')
        setPrecio('')
        setStock('')
      })
      .catch(error => console.error("Error al agregar producto:", error))
  }

  return (
    <div className="min-h-screen p-6 max-w-md mx-auto font-sans">
      
      {/* Encabezado tipo App */}
      <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-lg mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-wide">Bolis Gourmet Arfily 🥔</h1>
        <p className="text-blue-200 mt-1">Punto de Venta e Inventario</p>
      </div>

      {/* --- NUEVO FORMULARIO --- */}
      <form onSubmit={agregarProducto} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <h3 className="font-bold text-gray-700 mb-4">✨ Agregar Nuevo Producto</h3>
        <div className="space-y-3">
          <input 
            type="text" 
            placeholder="Nombre (ej. Nutella)" 
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-3">
            <input 
              type="number" 
              placeholder="Precio $" 
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              required
              min="0"
              step="0.5"
              className="w-1/2 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input 
              type="number" 
              placeholder="Stock" 
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
              min="1"
              className="w-1/2 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl shadow-sm transition-transform active:scale-95 mt-2"
          >
            Guardar Producto
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
          {productos.map(producto => (
            <li 
              key={producto.id} 
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center transition-all hover:shadow-md"
            >
              <div>
                <strong className="text-lg text-gray-800 block mb-1">{producto.nombre}</strong>
                <span className="text-gray-500 text-sm block mb-1">Precio: ${producto.precio}</span>
                <span className={`text-sm font-bold ${producto.stock < 10 ? 'text-red-500' : 'text-green-500'}`}>
                  Stock: {producto.stock}
                </span>
              </div>
              
              <button 
                onClick={() => registrarVenta(producto.id)}
                disabled={producto.stock === 0}
                className={`px-5 py-3 rounded-xl font-bold text-white shadow-sm transition-transform active:scale-95 ${
                  producto.stock === 0 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {producto.stock === 0 ? 'Agotado' : 'Vender 1'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default App