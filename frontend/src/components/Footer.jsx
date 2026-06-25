export default function Footer() {
  return (
    <footer className="bg-[#1b4332] text-[#d8f3dc] mt-auto">
      <div className="max-w-[1100px] mx-auto px-8 py-6 flex items-center justify-between flex-wrap gap-4">

        {/* Logo + nombre */}
        <div className="flex items-center gap-[10px]">
          <img src="/logo-sach.png" alt="SACH" className="h-10 object-contain" />
          <span className="text-[18px] font-semibold text-white tracking-[0.5px]">SACH</span>
        </div>

        {/* Contáctanos label */}
        <span className="text-[15px] font-semibold text-white">Contáctanos</span>

        {/* Info de contacto */}
        <div className="flex flex-col gap-1">
          <p className="m-0 text-[13px] text-[#d8f3dc]">📍 David centro, frente a hotel luar</p>
          <p className="m-0 text-[13px] text-[#d8f3dc]">📞 58328-234223</p>
          <p className="m-0 text-[13px] text-[#d8f3dc]">💬 +507 6532-2344</p>
          <p className="m-0 text-[13px] text-[#d8f3dc]">📷 Sachchirique</p>
        </div>

      </div>

      {/* Línea inferior */}
      <div className="border-t border-[#2d6a4f] text-center px-8 py-3">
        <p className="m-0 text-[12px] text-[#95d5b2]">
          Derechos reservados © SmartSACH S.A.
        </p>
      </div>
    </footer>
  );
}