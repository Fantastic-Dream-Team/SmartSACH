import Navbar from './components/Navbar'
import Footer from './components/Footer'
import MapaRutas from './components/MapaRutas'
import RutaItem from './components/RutaItem'

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <MapaRutas />
      <RutaItem zona="David Este" direccion="Altos de las moras, calle #2, casa 7" />
      <RutaItem zona="Algarrobos" direccion="Nuevo horizonte, al lado de la cancha, casa #7" />
      <div className="flex-1" />
      <Footer />
    </div>
  )
}

export default App