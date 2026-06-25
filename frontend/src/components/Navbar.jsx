import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const navLinks = [
  { label: "Inicio", path: "/" },
  { label: "Perfil", path: "/perfil" },
  { label: "Pagos", path: "/pagos" },
  { label: "Nosotros", path: "/nosotros" },
  { label: "Ayuda", path: "/ayuda" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="bg-[#1b4332] sticky top-0 z-50 shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
      <div className="max-w-[1100px] mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center no-underline">
          <img src="/logo-sach.png" alt="SmartSACH" className="h-9 object-contain" />
        </Link>

        {/* Links escritorio */}
        <ul className="hidden sm:flex gap-1 list-none m-0 p-0">
          {navLinks.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={`text-[#d8f3dc] no-underline text-sm font-medium px-[14px] py-[6px] rounded-md transition-[background,color] duration-200 ${
                  location.pathname === link.path
                    ? "bg-[#2d6a4f] text-white"
                    : "hover:bg-[#2d6a4f]/50"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Botón hamburguesa (móvil) */}
        <button
          className="sm:hidden flex flex-col gap-[5px] bg-transparent border-0 cursor-pointer p-1"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Abrir menú"
        >
          <span className="block w-[22px] h-[2px] bg-[#d8f3dc] rounded-sm" />
          <span className="block w-[22px] h-[2px] bg-[#d8f3dc] rounded-sm" />
          <span className="block w-[22px] h-[2px] bg-[#d8f3dc] rounded-sm" />
        </button>
      </div>

      {/* Menú móvil */}
      {menuOpen && (
        <ul className="sm:hidden list-none m-0 px-6 pb-4 pt-2 bg-[#1b4332] border-t border-[#2d6a4f] flex flex-col gap-1">
          {navLinks.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={`block text-[#d8f3dc] no-underline text-[15px] px-3 py-[10px] rounded-md ${
                  location.pathname === link.path
                    ? "bg-[#2d6a4f] text-white"
                    : ""
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}