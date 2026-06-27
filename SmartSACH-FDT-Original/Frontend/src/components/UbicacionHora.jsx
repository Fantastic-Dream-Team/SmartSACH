// Frontend/src/components/UbicacionHora.jsx
import { useState, useEffect } from 'react';

export default function UbicacionHora() {
  const [fechaHora, setFechaHora] = useState('');

  useEffect(() => {
    const actualizarHora = () => {
      const ahora = new Date();
      const mes = ahora.toLocaleString('es-PA', { month: 'long', timeZone: 'America/Panama' });
      const dia = ahora.getDate();
      const horas = ahora.toLocaleString('es-PA', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'America/Panama' });
      setFechaHora(`${dia} de ${mes} ${horas}`);
    };

    actualizarHora();
    const interval = setInterval(actualizarHora, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-3 mb-6">
      <span className="text-2xl">📍</span>
      <span className="text-sm text-gray-500">
        Chiriquí · {fechaHora}
      </span>
    </div>
  );
}