import React, { useRef, useEffect, useState } from 'react';
import { RotateCcw, CheckCircle2, PenLine } from 'lucide-react';

interface SignaturePadProps {
  label: string;
  name: string;
  onNameChange: (name: string) => void;
  signatureImage: string;
  onSignatureChange: (dataUrl: string) => void;
  readOnly?: boolean;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  label,
  name,
  onNameChange,
  signatureImage,
  onSignatureChange,
  readOnly = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasStroke, setHasStroke] = useState(Boolean(signatureImage));

  // Render existing signature image onto canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (signatureImage) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setHasStroke(true);
      };
      img.src = signatureImage;
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasStroke(false);
    }
  }, [signatureImage]);

  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return [0, 0];
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return [(e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY];
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (readOnly) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.setPointerCapture(e.pointerId);
    setIsDrawing(true);

    const [x, y] = getCanvasCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a';
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || readOnly) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const [x, y] = getCanvasCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasStroke(true);
  };

  const handlePointerUp = () => {
    if (!isDrawing || readOnly) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    onSignatureChange(canvas.toDataURL('image/png'));
  };

  const handleClear = () => {
    if (readOnly) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasStroke(false);
    onSignatureChange('');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-700 tracking-wide uppercase">
            {label}
          </span>
          {hasStroke ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              <CheckCircle2 className="w-3.5 h-3.5" /> Signed
            </span>
          ) : (
            <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded italic">
              Signature pending
            </span>
          )}
        </div>

        <div className="mb-3">
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Signatory Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            disabled={readOnly}
            placeholder="Enter name (e.g., Dr. / Prof. ...)"
            className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1F3864] disabled:opacity-60"
          />
        </div>

        <div className="relative">
          <canvas
            ref={canvasRef}
            width={400}
            height={160}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className={`w-full h-32 border-2 border-dashed rounded-lg touch-none bg-slate-50/50 ${
              readOnly
                ? 'cursor-default border-slate-200'
                : 'cursor-crosshair border-slate-300 hover:border-slate-400 bg-white'
            }`}
          />
          {!hasStroke && !readOnly && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-400 gap-1.5 text-xs">
              <PenLine className="w-4 h-4 opacity-70" />
              <span>Sign with finger, stylus or mouse</span>
            </div>
          )}
        </div>
      </div>

      {!readOnly && (
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleClear}
            disabled={!hasStroke}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-rose-700 disabled:opacity-30 disabled:hover:text-slate-600 transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Clear Signature
          </button>
          <span className="text-[11px] text-slate-400">Official JCE Audit</span>
        </div>
      )}
    </div>
  );
};
