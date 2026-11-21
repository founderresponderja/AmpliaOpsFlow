// Símbolo da Zarpa: o cursor do terminal, onde cada envio começa.
export function ZarpaSymbol({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="6" y="6" width="88" height="88" rx="14" fill="#0C0D0F" />
      <path d="M24 32 L44 50 L24 68" fill="none" stroke="#EDE9E1" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="52" y="62" width="26" height="9" rx="2" fill="#FF6A1A" />
    </svg>
  );
}
