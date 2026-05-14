/**
 * Academia dos Números - Plataforma Educativa
 * Desenvolvido por: Rodrigo Linhares Drummond
 * Empresa: Academia dos Números
 * © 2025 Todos os direitos reservados
 */

import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { updateMetaTags } from "./lib/seo";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import MultiplicationTable from "@/pages/multiplication-table";
import IndividualTables from "@/pages/individual-tables";
import DivisionTables from "@/pages/division-tables";
import Quiz from "@/pages/quiz";
import EducationalClock from "@/pages/educational-clock";
import Addition from "@/pages/addition";
import Subtraction from "@/pages/subtraction";
import Contagem from "@/pages/contagem";
import Calculadora from "@/pages/calculadora";
import Footer from "@/components/Footer";
import VirtualAssistant from "@/components/virtual-assistant";
import { ArquimedesProvider, useArquimedesEvents } from "@/lib/arquimedes-events";

import NotFound from "@/pages/not-found";

import { useState, useEffect } from "react";

function Navigation() {
  const [location] = useLocation();
  
  return (
    <nav className="relative">
      {/* Greek-style Banner */}
      <div className="relative bg-gradient-to-r from-amber-50 via-amber-100 to-amber-50 border-b-4 border-amber-300">
        <div className="absolute inset-0 opacity-10">
          <div className="h-full w-full" style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              rgba(139,69,19,0.1) 10px,
              rgba(139,69,19,0.1) 20px
            )`
          }}></div>
        </div>
        
        <div className="relative py-16 px-6 text-center">
          {/* Greek decorative border */}
          <div className="absolute top-4 left-4 right-4 h-2 bg-gradient-to-r from-transparent via-amber-400 to-transparent rounded-full"></div>
          <div className="absolute bottom-4 left-4 right-4 h-2 bg-gradient-to-r from-transparent via-amber-400 to-transparent rounded-full"></div>
          
          {/* Greek columns decoration */}
          <div className="absolute left-8 top-8 bottom-8 w-4 bg-gradient-to-b from-amber-300 via-amber-200 to-amber-300 rounded opacity-30"></div>
          <div className="absolute right-8 top-8 bottom-8 w-4 bg-gradient-to-b from-amber-300 via-amber-200 to-amber-300 rounded opacity-30"></div>
          
          {/* Main title in Portuguese */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-amber-900 mb-4" 
              style={{
                fontFamily: 'Cinzel, "Greek Freak", serif',
                textShadow: '2px 2px 4px rgba(139,69,19,0.3)',
                letterSpacing: '0.05em'
              }}>
            Academia dos Números
          </h1>
          
          {/* Subtitle in Greek */}
          <p className="text-2xl md:text-3xl lg:text-4xl text-amber-800 font-bold" 
             style={{
               fontFamily: 'Cinzel, serif',
               textShadow: '2px 2px 4px rgba(139,69,19,0.3)',
               letterSpacing: '0.1em'
             }}>
            ΑΚΑΔΗΜΙΑ ΤΩΝ ΑΡΙΘΜΩΝ
          </p>
          
          {/* Greek mathematical symbols decoration */}
          <div className="flex justify-center space-x-8 mt-6 text-2xl text-amber-600 opacity-60">
            <span style={{fontFamily: 'serif'}}>π</span>
            <span style={{fontFamily: 'serif'}}>∑</span>
            <span style={{fontFamily: 'serif'}}>∞</span>
            <span style={{fontFamily: 'serif'}}>Φ</span>
            <span style={{fontFamily: 'serif'}}>Ω</span>
          </div>
        </div>
      </div>
      
      {/* Main navigation */}
      <div className="relative bg-card border-b border-border">
        <div className="container mx-auto px-6 py-6">
          
          {/* Navigation columns */}
          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 xl:grid-cols-8 gap-2 xs:gap-3 sm:gap-4 md:gap-3 lg:gap-4 max-w-7xl mx-auto">
            <Link href="/">
              <div className={`h-24 xs:h-28 sm:h-32 md:h-34 lg:h-36 xl:h-40 px-2 xs:px-3 sm:px-4 md:px-5 lg:px-6 py-2 xs:py-3 sm:py-4 md:py-5 lg:py-6 rounded-xl lg:rounded-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer border-2 shadow-md flex flex-col justify-center ${
                location === "/" 
                  ? 'bg-blue-600 text-white border-blue-700 shadow-blue-200' 
                  : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700'
              }`}>
                <div className="text-center">
                  <div className="text-lg xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl mb-0.5 xs:mb-1 sm:mb-1 md:mb-1.5 lg:mb-2">⚱️</div>
                  <div className="font-greek font-bold text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl xl:text-xl leading-tight">Tabela Completa</div>
                  <div className="text-xs xs:text-xs sm:text-xs md:text-sm lg:text-sm xl:text-sm font-semibold opacity-90 leading-tight">Visão Geral</div>
                </div>
              </div>
            </Link>

            <Link href="/adicao">
              <div className={`h-24 xs:h-28 sm:h-32 md:h-34 lg:h-36 xl:h-40 px-2 xs:px-3 sm:px-4 md:px-5 lg:px-6 py-2 xs:py-3 sm:py-4 md:py-5 lg:py-6 rounded-xl lg:rounded-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer border-2 shadow-md flex flex-col justify-center ${
                location === "/adicao" 
                  ? 'bg-blue-600 text-white border-blue-700 shadow-blue-200' 
                  : 'bg-white text-gray-700 border-blue-300 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700'
              }`}>
                <div className="text-center">
                  <div className="text-lg xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl mb-0.5 xs:mb-1 sm:mb-1 md:mb-1.5 lg:mb-2">➕</div>
                  <div className="font-greek font-bold text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl xl:text-xl leading-tight">Adição</div>
                  <div className="text-xs xs:text-xs sm:text-xs md:text-sm lg:text-sm xl:text-sm font-semibold opacity-90 leading-tight">Tabuadas de Soma</div>
                </div>
              </div>
            </Link>

            <Link href="/subtracao">
              <div className={`h-24 xs:h-28 sm:h-32 md:h-34 lg:h-36 xl:h-40 px-2 xs:px-3 sm:px-4 md:px-5 lg:px-6 py-2 xs:py-3 sm:py-4 md:py-5 lg:py-6 rounded-xl lg:rounded-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer border-2 shadow-md flex flex-col justify-center ${
                location === "/subtracao" 
                  ? 'bg-red-600 text-white border-red-700 shadow-red-200' 
                  : 'bg-white text-gray-700 border-red-300 hover:bg-red-50 hover:border-red-400 hover:text-red-700'
              }`}>
                <div className="text-center">
                  <div className="text-lg xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl mb-0.5 xs:mb-1 sm:mb-1 md:mb-1.5 lg:mb-2">➖</div>
                  <div className="font-greek font-bold text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl xl:text-xl leading-tight">Subtração</div>
                  <div className="text-xs xs:text-xs sm:text-xs md:text-sm lg:text-sm xl:text-sm font-semibold opacity-90 leading-tight">Tabuadas de Subtração</div>
                </div>
              </div>
            </Link>

            <Link href="/tabuadas">
              <div className={`h-24 xs:h-28 sm:h-32 md:h-34 lg:h-36 xl:h-40 px-2 xs:px-3 sm:px-4 md:px-5 lg:px-6 py-2 xs:py-3 sm:py-4 md:py-5 lg:py-6 rounded-xl lg:rounded-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer border-2 shadow-md flex flex-col justify-center ${
                location === "/tabuadas" 
                  ? 'bg-blue-600 text-white border-blue-700 shadow-blue-200' 
                  : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700'
              }`}>
                <div className="text-center">
                  <div className="text-lg xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl mb-0.5 xs:mb-1 sm:mb-1 md:mb-1.5 lg:mb-2" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>✕</div>
                  <div className="font-greek font-bold text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl xl:text-xl leading-tight">Tabuada</div>
                  <div className="text-xs xs:text-xs sm:text-xs md:text-sm lg:text-sm xl:text-sm font-semibold opacity-90 leading-tight">Multiplicação</div>
                </div>
              </div>
            </Link>
            
            <Link href="/divisao">
              <div className={`h-24 xs:h-28 sm:h-32 md:h-34 lg:h-36 xl:h-40 px-2 xs:px-3 sm:px-4 md:px-5 lg:px-6 py-2 xs:py-3 sm:py-4 md:py-5 lg:py-6 rounded-xl lg:rounded-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer border-2 shadow-md flex flex-col justify-center ${
                location === "/divisao" 
                  ? 'bg-blue-600 text-white border-blue-700 shadow-blue-200' 
                  : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700'
              }`}>
                <div className="text-center">
                  <div className="text-lg xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl mb-0.5 xs:mb-1 sm:mb-1 md:mb-1.5 lg:mb-2">➗</div>
                  <div className="font-greek font-bold text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl xl:text-xl leading-tight">Divisão</div>
                  <div className="text-xs xs:text-xs sm:text-xs md:text-sm lg:text-sm xl:text-sm font-semibold opacity-90 leading-tight">Dividir e Conquistar</div>
                </div>
              </div>
            </Link>
            
            <Link href="/simulado">
              <div className={`h-24 xs:h-28 sm:h-32 md:h-34 lg:h-36 xl:h-40 px-2 xs:px-3 sm:px-4 md:px-5 lg:px-6 py-2 xs:py-3 sm:py-4 md:py-5 lg:py-6 rounded-xl lg:rounded-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer border-2 shadow-md flex flex-col justify-center ${
                location === "/simulado" 
                  ? 'bg-blue-600 text-white border-blue-700 shadow-blue-200' 
                  : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700'
              }`}>
                <div className="text-center">
                  <div className="text-lg xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl mb-0.5 xs:mb-1 sm:mb-1 md:mb-1.5 lg:mb-2">🏛️</div>
                  <div className="font-greek font-bold text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl xl:text-xl leading-tight">Desafio</div>
                  <div className="text-xs xs:text-xs sm:text-xs md:text-sm lg:text-sm xl:text-sm font-semibold opacity-90 leading-tight">Teste Cronometrado</div>
                </div>
              </div>
            </Link>

            <Link href="/relogio">
              <div className={`h-24 xs:h-28 sm:h-32 md:h-34 lg:h-36 xl:h-40 px-2 xs:px-3 sm:px-4 md:px-5 lg:px-6 py-2 xs:py-3 sm:py-4 md:py-5 lg:py-6 rounded-xl lg:rounded-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer border-2 shadow-md flex flex-col justify-center ${
                location === "/relogio" 
                  ? 'bg-blue-600 text-white border-blue-700 shadow-blue-200' 
                  : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700'
              }`}>
                <div className="text-center">
                  <div className="text-lg xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl mb-0.5 xs:mb-1 sm:mb-1 md:mb-1.5 lg:mb-2">🕐</div>
                  <div className="font-greek font-bold text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl xl:text-xl leading-tight">Relógio</div>
                  <div className="text-xs xs:text-xs sm:text-xs md:text-sm lg:text-sm xl:text-sm font-semibold opacity-90 leading-tight">Aprenda Horas</div>
                </div>
              </div>
            </Link>

            <Link href="/calculadora">
              <div className={`h-24 xs:h-28 sm:h-32 md:h-34 lg:h-36 xl:h-40 px-2 xs:px-3 sm:px-4 md:px-5 lg:px-6 py-2 xs:py-3 sm:py-4 md:py-5 lg:py-6 rounded-xl lg:rounded-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer border-2 shadow-md flex flex-col justify-center ${
                location === "/calculadora" 
                  ? 'bg-amber-600 text-white border-amber-700 shadow-amber-200' 
                  : 'bg-amber-50 text-gray-700 border-amber-300 hover:bg-amber-100 hover:border-amber-500 hover:text-amber-800'
              }`}>
                <div className="text-center">
                  <div className="text-lg xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl mb-0.5 xs:mb-1 sm:mb-1 md:mb-1.5 lg:mb-2">🧮</div>
                  <div className="font-greek font-bold text-xs xs:text-xs sm:text-sm md:text-base lg:text-lg xl:text-lg leading-tight">Calc. IA</div>
                  <div className="text-xs xs:text-xs sm:text-xs md:text-xs lg:text-sm xl:text-sm font-semibold opacity-90 leading-tight">Sem limite</div>
                </div>
              </div>
            </Link>

          </div>
        </div>
      </div>
    </nav>
  );
}

function RouterInner() {
  const [location] = useLocation();
  const { event } = useArquimedesEvents();

  useEffect(() => {
    updateMetaTags(location);
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col relative bg-gradient-to-br from-amber-50 to-amber-100" style={{ isolation: 'isolate' }}>
      
      {/* Conteúdo com z-index maior */}
      <div className="relative z-10 flex-grow">
        <Navigation />
        <Switch>
          <Route path="/" component={MultiplicationTable} />
          <Route path="/tabuadas" component={IndividualTables} />
          <Route path="/divisao" component={DivisionTables} />
          <Route path="/simulado" component={Quiz} />
          <Route path="/relogio" component={EducationalClock} />
          <Route path="/adicao" component={Addition} />
          <Route path="/subtracao" component={Subtraction} />
          <Route path="/contagem" component={Contagem} />
          <Route path="/calculadora" component={Calculadora} />
          <Route component={NotFound} />
        </Switch>
      </div>
      
      {/* Footer */}
      <Footer />

      {/* Arquimedes: global virtual assistant on all pages */}
      <VirtualAssistant currentPage={location} event={event} />
    </div>
  );
}

function Router() {
  return (
    <ArquimedesProvider>
      <RouterInner />
    </ArquimedesProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
