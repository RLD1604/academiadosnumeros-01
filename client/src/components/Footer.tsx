export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-amber-50 via-white to-amber-50 border-t-2 border-amber-200 mt-auto">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col items-center justify-center space-y-2">
          {/* Decorative Greek element */}
          <div className="flex items-center space-x-4">
            <span className="text-amber-600 text-2xl">⟨</span>
            <div className="text-center">
              <p className="text-amber-700 font-cinzel text-sm md:text-base font-semibold">
                Academia dos Números
              </p>
              <p className="text-gray-600 text-xs md:text-sm mt-1">
                Planejado, desenvolvido e codificado por{' '}
                <a 
                  href="mailto:rodrigo.l.drummond@gmail.com" 
                  className="text-amber-700 font-semibold hover:text-amber-800 hover:underline transition-colors"
                >
                  Rodrigo Linhares Drummond
                </a>
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Usando <span className="text-blue-600 font-semibold">Vibe Coding</span>
              </p>
            </div>
            <span className="text-amber-600 text-2xl">⟩</span>
          </div>
          
          {/* Copyright */}
          <div className="text-xs text-gray-400 pt-1 border-t border-amber-100">
            © {new Date().getFullYear()} • Educação Matemática Interativa
          </div>
        </div>
      </div>
    </footer>
  );
}