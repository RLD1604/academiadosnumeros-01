/**
 * Canvas Clock Component - Academia dos Números
 * Implementação em Canvas HTML5 para resolver problemas de viewport do SVG
 */

import { useRef, useEffect, useCallback, useState } from 'react';

interface ClockState {
  hour: number;
  minute: number;
  second: number;
}

interface ClockGeometry {
  center: { x: number; y: number };
  radius: number;
  hourHandLength: number;
  minuteHandLength: number;
  secondHandLength: number;
}

interface CanvasClockProps {
  clock: ClockState;
  size?: number;
  isDraggable?: boolean;
  onTimeChange?: (newTime: ClockState) => void;
}

class ClockMath {
  static readonly DEGREES_PER_HOUR = 30;
  static readonly DEGREES_PER_MINUTE = 6;
  static readonly DEGREES_PER_SECOND = 6;
  static readonly HOUR_HAND_SPEED = 0.5;

  static timeToAngles(time: ClockState): { hour: number; minute: number; second: number } {
    return {
      hour: (time.hour % 12) * this.DEGREES_PER_HOUR + time.minute * this.HOUR_HAND_SPEED,
      minute: time.minute * this.DEGREES_PER_MINUTE,
      second: time.second * this.DEGREES_PER_SECOND
    };
  }

  static angleToCartesian(angle: number, radius: number, center: { x: number; y: number }): { x: number; y: number } {
    const radian = (angle - 90) * Math.PI / 180;
    return {
      x: center.x + radius * Math.cos(radian),
      y: center.y + radius * Math.sin(radian)
    };
  }

  static distance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }
}

export default function CanvasClock({ 
  clock, 
  size = 400, 
  isDraggable = false, 
  onTimeChange 
}: CanvasClockProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedHand, setDraggedHand] = useState<'hour' | 'minute' | 'second' | null>(null);

  // Converter ângulo do mouse para valores de tempo
  const angleToTime = useCallback((angle: number, handType: 'hour' | 'minute' | 'second'): number => {
    const normalizedAngle = ((angle % 360) + 360) % 360;
    
    switch (handType) {
      case 'hour':
        return Math.round(normalizedAngle / 30) || 12;
      case 'minute':
      case 'second':
        return Math.round(normalizedAngle / 6) % 60;
      default:
        return 0;
    }
  }, []);

  // Calcular ângulo do mouse relativo ao centro
  const getAngleFromMouse = useCallback((clientX: number, clientY: number): number => {
    const canvas = canvasRef.current;
    if (!canvas) return 0;
    
    const rect = canvas.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    
    let angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI + 90;
    if (angle < 0) angle += 360;
    
    return angle;
  }, []);

  // Atualizar tempo baseado no movimento do mouse
  const updateTimeFromMouse = useCallback((clientX: number, clientY: number) => {
    if (!isDragging || !draggedHand || !onTimeChange) return;
    
    const angle = getAngleFromMouse(clientX, clientY);
    const newValue = angleToTime(angle, draggedHand);
    
    const newTime = { ...clock };
    
    if (draggedHand === 'hour') {
      newTime.hour = newValue;
    } else if (draggedHand === 'minute') {
      newTime.minute = newValue;
    } else if (draggedHand === 'second') {
      newTime.second = newValue;
    }
    
    onTimeChange(newTime);
  }, [isDragging, draggedHand, onTimeChange, clock, getAngleFromMouse, angleToTime]);
  
  // Geometria do relógio Canvas
  const geometry: ClockGeometry = {
    center: { x: size / 2, y: size / 2 },
    radius: size * 0.4,
    hourHandLength: size * 0.25,
    minuteHandLength: size * 0.35,
    secondHandLength: size * 0.38
  };
  
  // Calcular ângulos e posições
  const angles = ClockMath.timeToAngles(clock);
  const positions = {
    hour: ClockMath.angleToCartesian(angles.hour, geometry.hourHandLength, geometry.center),
    minute: ClockMath.angleToCartesian(angles.minute, geometry.minuteHandLength, geometry.center),
    second: ClockMath.angleToCartesian(angles.second, geometry.secondHandLength, geometry.center)
  };

  // Renderizar no Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configurar alta qualidade
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    // Limpar canvas
    ctx.clearRect(0, 0, size, size);
    
    // Configurar qualidade
    ctx.imageSmoothingEnabled = true;
    ctx.lineCap = 'round';
    
    // Anel externo
    ctx.beginPath();
    ctx.arc(geometry.center.x, geometry.center.y, geometry.radius + 10, 0, 2 * Math.PI);
    ctx.fillStyle = '#64748b';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    ctx.fill();
    
    // Face do relógio
    ctx.shadowColor = 'transparent';
    ctx.beginPath();
    ctx.arc(geometry.center.x, geometry.center.y, geometry.radius, 0, 2 * Math.PI);
    const gradient = ctx.createRadialGradient(
      geometry.center.x, geometry.center.y, 0,
      geometry.center.x, geometry.center.y, geometry.radius
    );
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.85, '#f8fafc');
    gradient.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Marcações de minutos e horas
    for (let i = 0; i < 60; i++) {
      const angle = i * 6 * Math.PI / 180;
      const isHour = i % 5 === 0;
      const markLength = isHour ? 25 : 12;
      const markWidth = isHour ? 4 : 2;
      
      const x1 = geometry.center.x + (geometry.radius - markLength) * Math.sin(angle);
      const y1 = geometry.center.y - (geometry.radius - markLength) * Math.cos(angle);
      const x2 = geometry.center.x + (geometry.radius - 3) * Math.sin(angle);
      const y2 = geometry.center.y - (geometry.radius - 3) * Math.cos(angle);
      
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = isHour ? '#1f2937' : '#6b7280';
      ctx.lineWidth = markWidth;
      ctx.stroke();
    }
    
    // Números das horas
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 24px Times New Roman';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    for (let hour = 1; hour <= 12; hour++) {
      const angle = (hour === 12 ? 0 : hour * 30) * Math.PI / 180;
      const textRadius = geometry.radius - 40;
      const x = geometry.center.x + textRadius * Math.sin(angle);
      const y = geometry.center.y - textRadius * Math.cos(angle);
      ctx.fillText(hour.toString(), x, y);
    }
    
    // Configurar sombra para ponteiros
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    // Ponteiro dos segundos (Verde)
    ctx.beginPath();
    ctx.moveTo(geometry.center.x, geometry.center.y);
    ctx.lineTo(positions.second.x, positions.second.y);
    ctx.strokeStyle = '#16A34A';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    // Ponteiro dos minutos (Vermelho)
    ctx.beginPath();
    ctx.moveTo(geometry.center.x, geometry.center.y);
    ctx.lineTo(positions.minute.x, positions.minute.y);
    ctx.strokeStyle = '#DC2626';
    ctx.lineWidth = 8;
    ctx.stroke();
    
    // Ponteiro das horas (Azul)
    ctx.beginPath();
    ctx.moveTo(geometry.center.x, geometry.center.y);
    ctx.lineTo(positions.hour.x, positions.hour.y);
    ctx.strokeStyle = '#1E40AF';
    ctx.lineWidth = 12;
    ctx.stroke();
    
    // Centro do relógio
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(geometry.center.x, geometry.center.y, 15, 0, 2 * Math.PI);
    ctx.fillStyle = '#374151';
    ctx.fill();
    
    ctx.shadowColor = 'transparent';
    ctx.beginPath();
    ctx.arc(geometry.center.x, geometry.center.y, 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#1f2937';
    ctx.fill();
    
    // Círculos de debug (só se draggable)
    if (isDraggable) {
      ctx.shadowColor = 'transparent';
      
      // Hora (vermelho)
      ctx.beginPath();
      ctx.arc(positions.hour.x, positions.hour.y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = 'red';
      ctx.fill();
      
      // Segundos (amarelo)
      ctx.beginPath();
      ctx.arc(positions.second.x, positions.second.y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = 'yellow';
      ctx.fill();
    }
    
  }, [clock, size, isDraggable, positions, geometry, angles]);

  // Adicionar handlers de movimento do mouse
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        updateTimeFromMouse(e.clientX, e.clientY);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDraggedHand(null);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, updateTimeFromMouse]);

  // Handler de mouse para Canvas
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggable) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Detectar qual ponteiro está mais próximo
    const hourDist = ClockMath.distance({ x, y }, positions.hour);
    const minuteDist = ClockMath.distance({ x, y }, positions.minute);
    const secondDist = ClockMath.distance({ x, y }, positions.second);
    
    let closest: 'hour' | 'minute' | 'second' = 'hour';
    let closestDist = hourDist;
    
    if (minuteDist < closestDist) {
      closest = 'minute';
      closestDist = minuteDist;
    }
    
    if (secondDist < closestDist) {
      closest = 'second';
      closestDist = secondDist;
    }
    
    if (closestDist < 30) { // Tolerância de 30px
      setIsDragging(true);
      setDraggedHand(closest);
    }
  }, [isDraggable, positions]);

  const formatTime = (clock: ClockState) => {
    return `${String(clock.hour).padStart(2, '0')}:${String(clock.minute).padStart(2, '0')}:${String(clock.second).padStart(2, '0')}`;
  };

  return (
    <div className="clock-container">
      <canvas
        ref={canvasRef}
        className="mx-auto drop-shadow-2xl cursor-grab"
        style={{ display: 'block' }}
        onMouseDown={handleCanvasMouseDown}
      />
      


      {/* Legenda dos ponteiros */}
      <div className="grid grid-cols-3 gap-4 mt-6 max-w-lg mx-auto">
        <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-4 text-center shadow-md">
          <div className="flex items-center justify-center mb-3">
            <div className="w-12 h-3 bg-blue-700 rounded-full"></div>
          </div>
          <div className="text-base font-bold text-blue-800">HORAS</div>
          <div className="text-sm text-blue-600">Azul • Curto e Grosso</div>
        </div>
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 text-center shadow-md">
          <div className="flex items-center justify-center mb-3">
            <div className="w-16 h-2 bg-red-600 rounded-full"></div>
          </div>
          <div className="text-base font-bold text-red-700">MINUTOS</div>
          <div className="text-sm text-red-600">Vermelho • Médio</div>
        </div>
        <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 text-center shadow-md">
          <div className="flex items-center justify-center mb-3">
            <div className="w-20 h-1 bg-green-600 rounded-full"></div>
          </div>
          <div className="text-base font-bold text-green-700">SEGUNDOS</div>
          <div className="text-sm text-green-600">Verde • Longo e Fino</div>
        </div>
      </div>
    </div>
  );
}