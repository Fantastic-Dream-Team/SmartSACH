// RutaItem.jsx
// Muestra una tarjeta con la dirección de una ruta de recolección.
// Props:
//   - direccion (string): dirección del punto de recolección
//   - zona (string): nombre de la zona/sector
//   - onClick (función): acción al hacer clic (opcional)

export default function RutaItem({ direccion, zona, onClick }) {
  return (
    <div
      className="bg-[#f0f0f0] rounded-[10px] px-4 py-[14px] flex items-center justify-between cursor-pointer transition-[background] duration-200 gap-3 hover:bg-[#e4e4e4]"
      onClick={onClick}
    >
      <div className="flex flex-col gap-1 flex-1">
        <span className="text-[11px] font-semibold text-[#2d6a4f] uppercase tracking-[0.5px]">
          {zona || "Sin zona"}
        </span>
        <span className="text-[14px] text-[#333] leading-[1.4]">
          {direccion || "Sin dirección"}
        </span>
      </div>
      <div className="shrink-0">
        {/* Ícono de mapa */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#1b4332"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
          <line x1="9" y1="3" x2="9" y2="18" />
          <line x1="15" y1="6" x2="15" y2="21" />
        </svg>
      </div>
    </div>
  );
}