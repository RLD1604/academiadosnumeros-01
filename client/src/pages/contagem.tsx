/**
 * Contagem - Academia dos Números
 * Desenvolvido por: Rodrigo Linhares Drummond
 * © 2025 Academia dos Números
 */

import { useState, useEffect, useRef, useCallback } from 'react';

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  size: number;
  duration: number;
  delay: number;
  round: boolean;
}

const CONFETTI_COLORS = ['#D4AF37', '#1976D2', '#42D392', '#FF7EB3', '#FF6B6B'];

/* ── MÃOZINHA SVG — desenhada 100% em SVG, sem imagem externa ───
   Cada dedo É o elemento clicável — alinhamento perfeito, sempre.
   fingers[0]=polegar [1]=indicador [2]=médio [3]=anelar [4]=mínimo
   mirror=true espelha a mão para o lado esquerdo.
─────────────────────────────────────────────────────────────────── */
function HandSVG({ fingers, onToggle, mirror }: {
  fingers: boolean[];
  onToggle: (i: number) => void;
  mirror?: boolean;
  uid: string;
}) {
  const SKIN    = '#FFCBA4';
  const OUTLINE = '#C07840';
  const GREEN   = '#4ADE80';
  const SW      = 4;

  /* Cor de cada dedo via CSS style → permite transition de fill */
  const fc = (i: number) => fingers[i] ? GREEN : SKIN;
  const tap = (i: number) => ({
    style: { fill: fc(i), cursor: 'pointer', transition: 'fill 0.18s ease' },
    onClick: () => onToggle(i),
  });

  return (
    <svg
      viewBox="0 0 225 265"
      width="140"
      height="165"
      style={{ display: 'block', transform: mirror ? 'scaleX(-1)' : 'none', touchAction: 'manipulation' }}
    >
      {/* ── Palma + pulso (fundo — desenhado primeiro) ── */}
      <rect x="38" y="168" width="164" height="97" rx="24"
        fill={SKIN} stroke={OUTLINE} strokeWidth={SW} />

      {/* ── Indicador [1] ── */}
      <rect x="46" y="36" width="38" height="140" rx="16"
        stroke={OUTLINE} strokeWidth={SW} {...tap(1)} />

      {/* ── Médio [2] — o mais alto ── */}
      <rect x="90" y="16" width="38" height="160" rx="16"
        stroke={OUTLINE} strokeWidth={SW} {...tap(2)} />

      {/* ── Anelar [3] ── */}
      <rect x="134" y="36" width="38" height="140" rx="16"
        stroke={OUTLINE} strokeWidth={SW} {...tap(3)} />

      {/* ── Mínimo [4] — o mais baixo ── */}
      <rect x="172" y="86" width="32" height="90" rx="14"
        stroke={OUTLINE} strokeWidth={SW} {...tap(4)} />

      {/* ── Polegar [0] — inclinado para a esquerda ── */}
      <g transform="translate(56, 188) rotate(-42)" {...tap(0)}>
        <rect x="-17" y="-85" width="34" height="85" rx="14"
          stroke={OUTLINE} strokeWidth={SW}
          style={{ fill: fc(0), transition: 'fill 0.18s ease' }} />
      </g>

      {/* ── Linha decorativa da palma ── */}
      <path d="M 82 208 Q 140 198 195 208" fill="none"
        stroke={OUTLINE} strokeWidth="1.5" strokeLinecap="round" opacity="0.3"
        style={{ pointerEvents: 'none' }} />
    </svg>
  );
}

export default function Contagem() {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);

  /* ── 1. DESAFIO REVERSO ─────────────────────────────────────── */
  const [chalTarget, setChalTarget] = useState(5);
  const [chalDots, setChalDots] = useState({ left: 0, right: 0 });
  const [chalSuccess, setChalSuccess] = useState(false);

  /* ── 2. CAMINHO 3D ──────────────────────────────────────────── */
  const [calcVal1, setCalcVal1] = useState<number | null>(null);
  const [calcOp, setCalcOp] = useState<string | null>(null);
  const [calcVal2, setCalcVal2] = useState<number | null>(null);
  const [trackSize, setTrackSize] = useState(16);
  const [charPos, setCharPos] = useState(0);
  const [passedTiles, setPassedTiles] = useState<Set<number>>(new Set());
  const [startTile, setStartTile] = useState<number | null>(null);
  const [eq3DText, setEq3DText] = useState('Esperando continha...');
  const [lessonData, setLessonData] = useState<{ start: number; op: string; steps: number; end: number } | null>(null);
  const [showLesson, setShowLesson] = useState(false);
  const [charBubble, setCharBubble] = useState('');
  const [charScale, setCharScale] = useState(false);
  const sceneRef = useRef<HTMLDivElement>(null);
  const walkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const TILE_W = 90;

  /* ── 3. PULO DO SAPO ────────────────────────────────────────── */
  const [frogPos, setFrogPos] = useState(0);
  const [frogEquation, setFrogEquation] = useState('0');
  const [floatingMath, setFloatingMath] = useState<{ text: string; color: string; id: number } | null>(null);
  const MAX_POS = 10;

  /* ── 4. CESTA DE MAÇÃS ──────────────────────────────────────── */
  const [appleCount, setAppleCount] = useState(0);

  /* ── 5. DOMINÓ NORMAL ───────────────────────────────────────── */
  const [dots, setDots] = useState({ left: 0, right: 0 });

  /* ── 6. MÃOZINHAS ───────────────────────────────────────────── */
  const [leftFingers, setLeftFingers] = useState([false, false, false, false, false]);
  const [rightFingers, setRightFingers] = useState([false, false, false, false, false]);

  /* ── 7. BLOCOS (TEN-FRAME) ──────────────────────────────────── */
  const [blockSets, setBlockSets] = useState<boolean[][]>(
    Array.from({ length: 4 }, () => Array(10).fill(false))
  );

  /* ── CONFETES ────────────────────────────────────────────────── */
  const shootConfetti = useCallback(() => {
    const pieces: ConfettiPiece[] = Array.from({ length: 50 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: Math.random() * 10 + 5,
      duration: Math.random() * 2 + 2,
      delay: Math.random() * 0.5,
      round: Math.random() > 0.5,
    }));
    setConfetti(pieces);
    setTimeout(() => setConfetti([]), 4500);
  }, []);

  /* ── 1. LÓGICA DESAFIO REVERSO ──────────────────────────────── */
  useEffect(() => {
    const total = chalDots.left + chalDots.right;
    if (total === chalTarget) {
      setChalSuccess(true);
      shootConfetti();
      setTimeout(() => setChalSuccess(false), 2000);
    } else {
      setChalSuccess(false);
    }
  }, [chalDots, chalTarget, shootConfetti]);

  const changeTarget = (amt: number) => {
    const nv = chalTarget + amt;
    if (nv >= 1 && nv <= 18) setChalTarget(nv);
  };

  const updateChalDomino = (side: 'left' | 'right', amt: number) => {
    const nv = chalDots[side] + amt;
    if (nv >= 0 && nv <= 9) setChalDots(prev => ({ ...prev, [side]: nv }));
  };

  /* ── 2. LÓGICA CAMINHO 3D ────────────────────────────────────── */
  const calcDisplayText = () => {
    let t = calcVal1 !== null ? String(calcVal1) : '?';
    if (calcOp !== null) {
      t += ` ${calcOp} `;
      t += calcVal2 !== null ? String(calcVal2) : '?';
    }
    return t;
  };

  const pressNum = (n: number) => {
    if (calcOp === null) setCalcVal1(n);
    else setCalcVal2(n);
  };

  const pressOp = (op: string) => {
    if (calcVal1 !== null) setCalcOp(op);
  };

  const clearCalc = () => {
    setCalcVal1(null); setCalcOp(null); setCalcVal2(null);
    setEq3DText('Esperando continha...'); setShowLesson(false);
  };

  const play3DWalk = () => {
    if (calcVal1 === null || calcOp === null || calcVal2 === null) {
      setEq3DText('Ops! Esqueceu de montar a continha completa? 🤔'); return;
    }
    if (walkTimeoutRef.current) clearTimeout(walkTimeoutRef.current);
    setShowLesson(false); setCharScale(false);
    const start = calcVal1; const op = calcOp; const steps = calcVal2;
    const endNum = op === '+' ? start + steps : start - steps;
    if (endNum < 0) { setEq3DText('Opa! O bonequinho não sabe andar antes do zero! 🚫'); return; }

    const newTrack = Math.max(15, start + steps + 5);
    setTrackSize(newTrack + 1);
    setPassedTiles(new Set());
    setStartTile(start);
    setCharPos(start);
    setCharBubble('');
    setEq3DText(`Posição inicial: ${start}`);

    setTimeout(() => {
      sceneRef.current?.scrollTo({ left: start * TILE_W, behavior: 'smooth' });
    }, 100);

    let currentPos = start; let stepCount = 0;

    const takeStep = () => {
      if (stepCount >= steps) {
        setEq3DText(`${start} ${op} ${steps} = ${endNum}! 🎉`);
        setCharBubble('Cheguei!');
        setCharScale(true);
        buildLesson(start, op, steps, endNum);
        return;
      }
      stepCount++;
      if (op === '+') currentPos++; else currentPos--;
      setCharPos(currentPos);
      setPassedTiles(prev => new Set([...Array.from(prev), currentPos]));
      setCharBubble(`${op}${stepCount}`);
      setEq3DText(`Andando: ${op}${stepCount} (Estamos no ${currentPos})`);
      sceneRef.current?.scrollTo({ left: currentPos * TILE_W - 100, behavior: 'smooth' });
      walkTimeoutRef.current = setTimeout(takeStep, 900);
    };
    walkTimeoutRef.current = setTimeout(takeStep, 600);
  };

  const buildLesson = (start: number, op: string, steps: number, end: number) => {
    setLessonData({ start, op, steps, end });
    setTimeout(() => setShowLesson(true), 500);
  };

  /* ── 3. LÓGICA PULO DO SAPO ──────────────────────────────────── */
  const jumpFrog = (step: number) => {
    setFrogPos(prev => {
      const next = prev + step;
      if (next < 0 || next > MAX_POS) return prev;
      const id = Date.now();
      setFloatingMath({ text: step > 0 ? '+1' : '-1', color: step > 0 ? '#22C55E' : '#EF4444', id });
      setTimeout(() => setFloatingMath(null), 1100);
      setFrogEquation(step > 0 ? `${prev} + 1 = ${next}` : `${prev} - 1 = ${next}`);
      return next;
    });
  };

  /* ── 4. LÓGICA CESTA DE MAÇÃS ───────────────────────────────── */
  const addApple = () => { if (appleCount < 20) setAppleCount(c => c + 1); };
  const removeApple = () => { if (appleCount > 0) setAppleCount(c => c - 1); };

  /* ── 5. LÓGICA DOMINÓ NORMAL ─────────────────────────────────── */
  const updateDomino = (side: 'left' | 'right', amt: number) => {
    const nv = dots[side] + amt;
    if (nv >= 0 && nv <= 9) setDots(prev => ({ ...prev, [side]: nv }));
  };

  /* ── 6. LÓGICA MÃOZINHAS ─────────────────────────────────────── */
  const toggleFinger = (hand: 'left' | 'right', idx: number) => {
    if (hand === 'left') setLeftFingers(prev => prev.map((v, i) => i === idx ? !v : v));
    else setRightFingers(prev => prev.map((v, i) => i === idx ? !v : v));
  };
  const leftCount = leftFingers.filter(Boolean).length;
  const rightCount = rightFingers.filter(Boolean).length;

  /* ── 7. LÓGICA BLOCOS ────────────────────────────────────────── */
  const toggleBlock = (setIdx: number, blockIdx: number) => {
    setBlockSets(prev => prev.map((set, si) =>
      si === setIdx ? set.map((v, bi) => bi === blockIdx ? !v : v) : set
    ));
  };
  const clearBlockSet = (setIdx: number) => {
    setBlockSets(prev => prev.map((set, si) => si === setIdx ? Array(10).fill(false) : set));
  };
  const blockCount = blockSets.flat().filter(Boolean).length;

  /* ── DRAG-TO-SCROLL na cena 3D ──────────────────────────────── */
  useEffect(() => {
    const el = sceneRef.current; if (!el) return;
    let isDown = false; let startX = 0; let sl = 0;
    const onDown = (e: MouseEvent) => { isDown = true; startX = e.pageX - el.offsetLeft; sl = el.scrollLeft; el.style.cursor = 'grabbing'; };
    const onUp = () => { isDown = false; el.style.cursor = 'grab'; };
    const onMove = (e: MouseEvent) => { if (!isDown) return; e.preventDefault(); const x = e.pageX - el.offsetLeft; el.scrollLeft = sl - (x - startX) * 2; };
    el.addEventListener('mousedown', onDown);
    el.addEventListener('mouseleave', onUp);
    el.addEventListener('mouseup', onUp);
    el.addEventListener('mousemove', onMove);
    return () => { el.removeEventListener('mousedown', onDown); el.removeEventListener('mouseleave', onUp); el.removeEventListener('mouseup', onUp); el.removeEventListener('mousemove', onMove); };
  }, []);


  /* ── HELPERS DE RENDER ────────────────────────────────────────── */
  const renderDots = (count: number) => (
    <div className="grid grid-cols-3 grid-rows-3 gap-1.5 p-2 w-[88px] h-[88px] bg-white rounded-xl">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-full bg-slate-800 w-full h-full" style={{ animation: 'popIn 0.3s both', animationDelay: `${i * 0.04}s` }} />
      ))}
      {Array.from({ length: 9 - count }).map((_, i) => (
        <div key={`empty-${i}`} />
      ))}
    </div>
  );

  const chalTotal = chalDots.left + chalDots.right;
  const chalEqText = chalSuccess
    ? `${chalDots.left} + ${chalDots.right} = ${chalTotal} 🎉`
    : (chalDots.left === 0 && chalDots.right === 0 ? `? + ? = ${chalTarget}` : `${chalDots.left} + ${chalDots.right} = ${chalTotal}`);

  const frogPercent = (frogPos / MAX_POS) * 100;

  return (
    <div className="relative overflow-x-hidden">
      {/* Confetti */}
      {confetti.map(p => (
        <div key={p.id} className="fixed top-[-10px] z-[9999] pointer-events-none"
          style={{
            left: `${p.x}vw`,
            width: p.size, height: p.size,
            backgroundColor: p.color,
            borderRadius: p.round ? '50%' : '0',
            animation: `confettiFall ${p.duration}s linear ${p.delay}s forwards`,
          }}
        />
      ))}

      <div className="container mx-auto px-4 py-6 max-w-6xl">

        {/* ── CABEÇALHO ─────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 rounded-2xl shadow-lg p-6 mb-8 text-white text-center border-b-4 border-amber-700">
          <h1 className="font-greek text-3xl md:text-5xl font-bold mb-1" style={{ textShadow: '0 3px 0 rgba(0,0,0,0.2)' }}>
            ✨ Contagem Interativa
          </h1>
          <p className="text-sm md:text-base opacity-90 font-semibold mt-1">
            Explore somar e subtrair de formas diferentes!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* ── MÓDULO 1: DESAFIO REVERSO (full width) ─────────── */}
          <div className="md:col-span-2 bg-amber-50 border-[3px] border-amber-300 rounded-3xl p-6 shadow-[0_10px_0_theme(colors.amber.300)] flex flex-col items-center">
            <h2 className="font-greek text-2xl font-bold text-amber-700 mt-0 mb-1 text-center">🎯 O Desafio Reverso</h2>
            <p className="text-amber-800 font-semibold text-center mb-4 text-sm">
              Escolha o número que você quer formar e use o dominó para chegar até ele!
            </p>

            <div className="flex items-center gap-4 mb-5 bg-white px-5 py-3 rounded-2xl border-[3px] border-dashed border-amber-400">
              <button onClick={() => changeTarget(-1)} className="game-btn game-btn-red">➖</button>
              <div className="relative flex items-center justify-center w-20 h-20 bg-amber-400 rounded-full shadow-[0_6px_0_theme(colors.amber.600)] text-4xl font-black text-amber-900"
                style={{ boxShadow: '0 6px 0 #B45309, inset 0 5px 0 rgba(255,255,255,0.4)' }}>
                <span className="z-10">{chalTarget}</span>
                <span className="absolute text-5xl opacity-20">⭐</span>
              </div>
              <button onClick={() => changeTarget(1)} className="game-btn game-btn-green">➕</button>
            </div>

            <div className="flex bg-slate-800 p-2 rounded-2xl gap-2 mb-4">
              {renderDots(chalDots.left)}
              {renderDots(chalDots.right)}
            </div>

            <div className="flex gap-8 mb-4">
              {(['left', 'right'] as const).map(side => (
                <div key={side} className="flex gap-2">
                  <button onClick={() => updateChalDomino(side, 1)} className="game-btn game-btn-blue">+</button>
                  <button onClick={() => updateChalDomino(side, -1)} className="game-btn game-btn-red">-</button>
                </div>
              ))}
            </div>

            <div className={`text-xl font-black px-6 py-3 rounded-2xl border-[3px] text-center w-4/5 transition-all duration-300
              ${chalSuccess
                ? 'bg-green-100 border-green-500 text-green-800 scale-105 shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                : 'bg-white border-slate-300 text-slate-700 shadow-inner'}`}>
              {chalEqText}
            </div>
          </div>

          {/* ── MÓDULO 2: CAMINHO 3D (full width) ──────────────── */}
          <div className="md:col-span-2 bg-gradient-to-br from-slate-800 to-slate-900 border-[3px] border-slate-600 rounded-3xl p-6 shadow-[0_10px_0_theme(colors.slate.700)] flex flex-col items-center overflow-hidden">
            <h2 className="font-greek text-2xl font-bold text-sky-400 mb-4 text-center">🎮 O Caminho 3D</h2>

            <div className="bg-[#020617] border-4 border-slate-500 rounded-2xl text-green-400 text-3xl font-bold px-8 py-3 mb-4 min-w-[220px] text-center tracking-widest shadow-[inset_0_5px_15px_rgba(0,0,0,0.8)] z-10">
              {calcDisplayText()}
            </div>

            <div className="flex flex-wrap justify-center gap-2 max-w-[480px] mb-4 z-10">
              {[0,1,2,3,4,5,6,7,8,9,10].map(n => (
                <button key={n} onClick={() => pressNum(n)}
                  className="w-14 h-14 rounded-2xl bg-amber-200 text-amber-900 font-black text-xl shadow-[0_6px_0_#D97706] active:translate-y-[6px] active:shadow-none transition-all">
                  {n}
                </button>
              ))}
              {['+', '-'].map(op => (
                <button key={op} onClick={() => pressOp(op)}
                  className="w-14 h-14 rounded-2xl bg-sky-400 text-white font-black text-2xl shadow-[0_6px_0_#0284C7] active:translate-y-[6px] active:shadow-none transition-all">
                  {op === '+' ? '➕' : '➖'}
                </button>
              ))}
            </div>

            <div className="flex gap-4 mb-4 z-10">
              <button onClick={clearCalc} className="game-btn game-btn-red">Limpar 🗑️</button>
              <button onClick={play3DWalk} className="game-btn game-btn-green">Caminhar! 🏃</button>
            </div>

            {/* Cena 3D */}
            <div ref={sceneRef}
              className="w-full h-[260px] rounded-2xl overflow-x-auto overflow-y-hidden relative"
              style={{
                perspective: '800px',
                background: 'radial-gradient(circle at center, #334155 0%, #0F172A 100%)',
                boxShadow: 'inset 0 10px 20px rgba(0,0,0,0.5)',
                cursor: 'grab',
                scrollBehavior: 'smooth',
                padding: '0 40vw',
              }}>
              <div style={{ display: 'flex', gap: '15px', transform: 'rotateX(50deg)', transformStyle: 'preserve-3d', padding: '40px 0', position: 'relative' }}>
                {/* Character */}
                <div style={{
                  position: 'absolute', top: 0,
                  left: `${charPos * TILE_W}px`,
                  fontSize: '3.5em',
                  transform: `rotateX(-50deg) translateZ(40px) translateY(-30px)${charScale ? ' scale(1.2)' : ''}`,
                  transition: 'left 0.5s cubic-bezier(0.34,1.56,0.64,1), transform 0.2s',
                  zIndex: 20,
                  filter: 'drop-shadow(0 20px 10px rgba(0,0,0,0.6))',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                }}>
                  {charBubble && (
                    <div style={{
                      background: 'white', color: '#FF6B6B', fontSize: '0.3em', fontWeight: 'bold',
                      padding: '4px 10px', borderRadius: '10px', position: 'absolute', top: '-30px',
                      border: '2px solid #FF6B6B', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif',
                    }}>
                      {charBubble}
                    </div>
                  )}
                  🚶
                </div>
                {/* Tiles */}
                {Array.from({ length: trackSize }, (_, i) => (
                  <div key={i} style={{
                    width: '75px', height: '75px',
                    background: i === startTile ? '#FCD34D' : passedTiles.has(i) ? '#38BDF8' : '#42D392',
                    borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.8em', fontWeight: '900',
                    color: i === startTile ? '#B45309' : passedTiles.has(i) ? '#0C4A6E' : '#064E3B',
                    boxShadow: `0 10px 0 ${i === startTile ? '#D97706' : passedTiles.has(i) ? '#0284C7' : '#22C55E'}, 0 15px 15px rgba(0,0,0,0.4)`,
                    transition: 'background-color 0.3s',
                    flexShrink: 0,
                  }}>
                    {i}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 text-lg font-bold px-5 py-2.5 rounded-2xl border-2 text-center w-4/5 z-10"
              style={{ background: 'rgba(255,255,255,0.1)', color: '#38BDF8', borderColor: '#38BDF8' }}>
              {eq3DText}
            </div>

            {showLesson && lessonData && (() => {
              const { start, op, steps, end } = lessonData;
              const acao = op === '+' ? 'para frente' : 'para trás';
              const opNome = op === '+' ? 'somar' : 'subtrair';
              return (
                <div className="mt-4 bg-slate-100 border-[3px] border-dashed border-sky-400 rounded-2xl p-5 w-[90%] text-slate-700 text-base z-10"
                  style={{ animation: 'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}>
                  <h3 className="font-greek text-lg font-bold text-sky-600 text-center mb-2">👩‍🏫 Resumo da Aula</h3>
                  {steps === 0 ? (
                    <p>
                      Começamos no <b>{start}</b>.<br /><br />
                      A conta pediu para {opNome} <b>ZERO</b>, então o bonequinho ficou parado!<br /><br />
                      <span style={{ display: 'block', textAlign: 'center', fontSize: '1.4em', marginTop: '8px' }}>
                        <b>{start}</b> {op} <b>{steps}</b> = <b>{end}</b>
                      </span>
                    </p>
                  ) : (
                    <p>
                      Começamos no <b>{start}</b>.<br /><br />
                      Precisamos {opNome} <b>{steps}</b>, então demos <b>{steps}</b> pulinhos {acao}.<br /><br />
                      Paramos no <b>{end}</b>!<br /><br />
                      <span style={{ display: 'block', textAlign: 'center', fontSize: '1.4em', marginTop: '8px' }}>
                        <b>{start}</b> {op} <b>{steps}</b> = <b>{end}</b>
                      </span>
                    </p>
                  )}
                </div>
              );
            })()}
          </div>

          {/* ── MÓDULO 3: PULO DO SAPO (full width) ─────────────── */}
          <div className="md:col-span-2 bg-white border-[3px] border-slate-200 rounded-3xl p-6 shadow-[0_10px_0_theme(colors.slate.200)] flex flex-col items-center">
            <h2 className="font-greek text-2xl font-bold text-slate-600 mt-0 mb-4 text-center">🐸 O Pulo do Sapo</h2>

            <div className="relative w-[90%] mt-12 mb-8">
              {/* Flutuante */}
              {floatingMath && (
                <div key={floatingMath.id}
                  className="absolute text-2xl font-black pointer-events-none z-50"
                  style={{ color: floatingMath.color, left: `calc(${frogPercent}% - 10px)`, top: '-20px', animation: 'floatUp 1s cubic-bezier(0.25,1,0.5,1) forwards' }}>
                  {floatingMath.text}
                </div>
              )}
              {/* Sapo */}
              <div className="absolute text-4xl transition-all duration-500"
                style={{ left: `${frogPercent}%`, top: '-52px', transform: 'translateX(-50%)', zIndex: 10,
                  transition: 'left 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}>
                🐸
              </div>
              {/* Linha */}
              <div className="h-3 bg-slate-300 rounded-full relative shadow-inner">
                <div className="flex justify-between absolute top-[-6px] w-full">
                  {Array.from({ length: MAX_POS + 1 }, (_, i) => (
                    <div key={i} className="relative flex flex-col items-center">
                      <div className="w-1.5 h-6 bg-slate-400 rounded-sm" />
                      <span className="absolute top-7 text-sm font-bold text-slate-500" style={{ transform: 'translateX(-50%)' }}>{i}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-4">
              <button onClick={() => jumpFrog(-1)} className="game-btn game-btn-red">⬅️ -1</button>
              <button onClick={() => jumpFrog(1)} className="game-btn game-btn-green">+1 ➡️</button>
            </div>
            <div className="mt-4 equation-box">{frogEquation}</div>
          </div>

          {/* ── MÓDULO 4: CESTA DE MAÇÃS ──────────────────────── */}
          <div className="bg-white border-[3px] border-slate-200 rounded-3xl p-6 shadow-[0_10px_0_theme(colors.slate.200)] flex flex-col items-center">
            <h2 className="font-greek text-2xl font-bold text-slate-600 mt-0 mb-3 text-center">🍎 Cesta de Maçãs</h2>
            <div className="flex gap-3 mb-3">
              <button onClick={addApple} className="game-btn game-btn-green">➕ Pegar</button>
              <button onClick={removeApple} className="game-btn game-btn-red">➖ Devolver</button>
            </div>
            <div className="min-h-[130px] w-full border-4 border-amber-700 border-t-0 rounded-b-[50px] bg-gradient-to-b from-amber-200 to-amber-500 flex flex-wrap content-end justify-center p-3 box-border">
              {Array.from({ length: appleCount }, (_, i) => (
                <span key={i} className="text-4xl -my-1 mx-0.5 cursor-pointer hover:scale-110 transition-transform"
                  style={{ animation: 'popIn 0.4s both' }}
                  onClick={removeApple}>🍎</span>
              ))}
            </div>
            <div className="mt-4 equation-box">
              {appleCount === 0 ? 'Vazia!' : `${appleCount} maçãs`}
            </div>
          </div>

          {/* ── MÓDULO 5: DOMINÓ NORMAL ───────────────────────── */}
          <div className="bg-white border-[3px] border-slate-200 rounded-3xl p-6 shadow-[0_10px_0_theme(colors.slate.200)] flex flex-col items-center">
            <h2 className="font-greek text-2xl font-bold text-slate-600 mt-0 mb-3 text-center">🎲 Dominó</h2>
            <div className="flex bg-slate-800 p-2 rounded-2xl gap-2 mb-4">
              {renderDots(dots.left)}
              {renderDots(dots.right)}
            </div>
            <div className="flex gap-8">
              {(['left', 'right'] as const).map(side => (
                <div key={side} className="flex gap-2">
                  <button onClick={() => updateDomino(side, 1)} className="game-btn game-btn-blue">+</button>
                  <button onClick={() => updateDomino(side, -1)} className="game-btn game-btn-red">-</button>
                </div>
              ))}
            </div>
            <div className="mt-4 equation-box">{dots.left} + {dots.right} = {dots.left + dots.right}</div>
          </div>

          {/* ── MÓDULO 6: MÃOZINHAS ───────────────────────────── */}
          <div className="bg-white border-[3px] border-slate-200 rounded-3xl p-6 shadow-[0_10px_0_theme(colors.slate.200)] flex flex-col items-center">
            <h2 className="font-greek text-2xl font-bold text-slate-600 mt-0 mb-1 text-center">🖐️ Mãozinhas</h2>
            <p className="text-xs text-slate-400 font-semibold mb-3">Clique nos dedos para levantá-los!</p>
            <div className="flex gap-4 items-end justify-center mb-2">
              <HandSVG fingers={leftFingers} onToggle={(i) => toggleFinger('left', i)} mirror uid="left" />
              <HandSVG fingers={rightFingers} onToggle={(i) => toggleFinger('right', i)} uid="right" />
            </div>
            <div className="mt-2 equation-box">{leftCount} + {rightCount} = {leftCount + rightCount}</div>
          </div>

          {/* ── MÓDULO 7: BLOCOS (TEN-FRAME) ─────────────────── */}
          <div className="bg-white border-[3px] border-slate-200 rounded-3xl p-6 shadow-[0_10px_0_theme(colors.slate.200)] flex flex-col items-center">
            <h2 className="font-greek text-2xl font-bold text-slate-600 mt-0 mb-4 text-center">🧱 Blocos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 w-full" style={{ maxWidth: '640px' }}>
              {blockSets.map((set, si) => {
                const rowCount = set.filter(Boolean).length;
                return (
                  <div key={si} className="flex flex-col items-center gap-2">
                    <div className="flex items-center justify-between w-full px-1">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                        Linha {si + 1} — <span className="text-rose-500">{rowCount}</span>/10
                      </span>
                      <button
                        onClick={() => clearBlockSet(si)}
                        className="text-[10px] font-bold text-slate-400 hover:text-rose-400 transition-colors uppercase tracking-wide"
                      >limpar</button>
                    </div>
                    <div className="grid grid-cols-5 gap-1.5 bg-slate-100 p-2 border-[3px] border-slate-300 rounded-2xl w-full">
                      {set.map((filled, bi) => (
                        <div key={bi} onClick={() => toggleBlock(si, bi)}
                          className="h-[52px] bg-white rounded-xl cursor-pointer flex items-center justify-center border-2 border-dashed border-slate-300 hover:border-rose-300 transition-all select-none active:scale-95">
                          {filled ? (
                            <div className="w-9 h-9 bg-rose-500 rounded-xl shadow-md" style={{ animation: 'popIn 0.25s' }} />
                          ) : (
                            <div className="w-3 h-3 rounded-full bg-slate-200" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="equation-box text-lg">
              Total: <span className="text-rose-600 font-bold">{blockCount}</span>
              <span className="text-slate-400 text-sm ml-1">/ 40</span>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes confettiFall {
          to { transform: translateY(100vh) rotate(720deg); }
        }
        @keyframes popIn {
          0%   { transform: scale(0); opacity: 0; }
          70%  { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes floatUp {
          0%   { transform: translateY(0) scale(0.5); opacity: 0; }
          20%  { transform: translateY(-30px) scale(1.2); opacity: 1; }
          100% { transform: translateY(-80px) scale(1); opacity: 0; }
        }
        .game-btn {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: 1rem;
          padding: 10px 20px;
          border-radius: 14px;
          border: none;
          cursor: pointer;
          transition: all 0.1s;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        .game-btn:active { transform: translateY(5px); box-shadow: none !important; }
        .game-btn-green { background: #42D392; color: white; box-shadow: 0 6px 0 #2BB676; }
        .game-btn-red   { background: #FF6B6B; color: white; box-shadow: 0 6px 0 #D94D4D; }
        .game-btn-blue  { background: #38BDF8; color: white; box-shadow: 0 6px 0 #0284C7; }
        .equation-box {
          font-size: 1.25rem;
          font-weight: 800;
          color: #334155;
          background: #F8FAFC;
          padding: 10px 24px;
          border-radius: 18px;
          border: 3px solid #CBD5E1;
          text-align: center;
          box-shadow: inset 0 3px 0 rgba(0,0,0,0.05);
          min-width: 160px;
          font-family: 'Inter', sans-serif;
        }
      `}</style>
    </div>
  );
}
