import React, { useEffect, useRef, useState } from 'react';
import { HUD_THEMES, ThemeId } from '../types/theme.ts';
import { playClick, playTargetLock, playChime } from '../utils/audioEffects.ts';
import {
  Camera,
  Upload,
  RefreshCw,
  Crosshair,
  ShieldAlert,
  Eye,
  Maximize2,
  Volume2,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface OpticalScannerProps {
  theme: ThemeId;
  onSpeakAnalysis: (text: string) => void;
}

export const OpticalScanner: React.FC<OpticalScannerProps> = ({
  theme,
  onSpeakAnalysis,
}) => {
  const currentTheme = HUD_THEMES[theme];
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [threatLevel, setThreatLevel] = useState<string>('ANALYZING...');
  const [thermalMode, setThermalMode] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Stop camera when unmounted
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    playClick();
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
        setCapturedImage(null);
        setAnalysisResult(null);
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError('Camera access unavailable or blocked. You can upload an image for tactical scanning.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const captureFrame = () => {
    if (!videoRef.current) return;
    playTargetLock();

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(dataUrl);
    stopCamera();
    performTacticalScan(dataUrl);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    playClick();
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setCapturedImage(result);
      stopCamera();
      performTacticalScan(result);
    };
    reader.readAsDataURL(file);
  };

  const performTacticalScan = async (imageDataUrl: string) => {
    setIsScanning(true);
    setAnalysisResult(null);
    setThreatLevel('ANALYZING...');

    try {
      const res = await fetch('/api/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageDataUrl,
          mimeType: 'image/jpeg',
          customQuery: customPrompt || 'Perform a complete tactical optical scan of the target. Identify threats, composition, and tactical directives.',
        }),
      });

      const data = await res.json();
      if (data.analysis) {
        setAnalysisResult(data.analysis);
        playChime();

        // Deduce threat level from analysis text
        const lower = data.analysis.toLowerCase();
        if (lower.includes('high threat') || lower.includes('critical') || lower.includes('danger')) {
          setThreatLevel('HIGH / CRITICAL');
        } else if (lower.includes('medium') || lower.includes('moderate') || lower.includes('elevated')) {
          setThreatLevel('ELEVATED');
        } else {
          setThreatLevel('MINIMAL / NEGLIGIBLE');
        }

        // Voice out the tactical analysis
        onSpeakAnalysis(data.analysis);
      } else {
        setAnalysisResult('Optical analysis inconclusive, Sir. Target telemetry could not be resolved.');
      }
    } catch (err: any) {
      console.error('Tactical scan failed:', err);
      setAnalysisResult('Communication with tactical satellite array failed. Please retry scan, Sir.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Scanner Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crosshair className="w-4 h-4" style={{ color: currentTheme.primaryColor }} />
          <h3 className="font-orbitron text-xs sm:text-sm font-bold tracking-wider uppercase text-white">
            Stark Optical & Tactical Scanner
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playClick();
              setThermalMode(!thermalMode);
            }}
            className={`text-[11px] font-mono-tech px-2.5 py-1 rounded border transition-colors flex items-center gap-1 ${
              thermalMode
                ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>{thermalMode ? 'THERMAL ON' : 'OPTICAL'}</span>
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div
        className={`relative w-full aspect-video max-h-[380px] rounded-lg border overflow-hidden bg-slate-950 flex items-center justify-center ${
          thermalMode ? 'contrast-150 saturate-200 hue-rotate-90' : ''
        }`}
        style={{ borderColor: currentTheme.primaryColor }}
      >
        {/* HUD Targeting Brackets */}
        <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 pointer-events-none z-20" style={{ borderColor: currentTheme.primaryColor }} />
        <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 pointer-events-none z-20" style={{ borderColor: currentTheme.primaryColor }} />
        <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 pointer-events-none z-20" style={{ borderColor: currentTheme.primaryColor }} />
        <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 pointer-events-none z-20" style={{ borderColor: currentTheme.primaryColor }} />

        {/* HUD Crosshairs in center */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="relative w-28 h-28 border border-dashed rounded-full animate-spin-slow opacity-60" style={{ borderColor: currentTheme.primaryColor }} />
          <div className="absolute w-12 h-12 border border-dotted rounded-full opacity-80" style={{ borderColor: currentTheme.accentColor }} />
          <div className="absolute w-3 h-3 border-t border-l border-r border-b opacity-90" style={{ borderColor: currentTheme.primaryColor }} />
        </div>

        {/* Sweeping scanline animation */}
        {isScanning && (
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/25 to-transparent h-16 w-full animate-hudScanner pointer-events-none z-30" />
        )}

        {/* Live Video Feed */}
        <video
          ref={videoRef}
          playsInline
          muted
          className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
        />

        {/* Captured Snapshot or Uploaded Image */}
        {capturedImage && !cameraActive && (
          <img
            src={capturedImage}
            alt="Tactical Scan Target"
            className="w-full h-full object-contain bg-black"
          />
        )}

        {/* Placeholder / Camera Off State */}
        {!cameraActive && !capturedImage && (
          <div className="flex flex-col items-center justify-center p-6 text-center z-10">
            <Camera className="w-12 h-12 mb-3 opacity-60" style={{ color: currentTheme.primaryColor }} />
            <div className="font-orbitron font-bold text-sm text-slate-200">
              OPTICAL SENSOR DORMANT
            </div>
            <p className="text-xs font-mono-tech text-slate-400 max-w-sm mt-1 mb-4">
              Activate your device camera or upload an image to conduct real-time AI tactical diagnostics.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={startCamera}
                className="px-4 py-2 rounded font-orbitron font-semibold text-xs tracking-wider bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg transition-all flex items-center gap-2"
                style={{ backgroundColor: currentTheme.primaryColor, color: '#020617' }}
              >
                <Camera className="w-4 h-4" />
                INITIALIZE CAMERA
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 rounded font-mono-tech text-xs border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 transition-all flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                UPLOAD IMAGE
              </button>
            </div>
          </div>
        )}

        {/* Live HUD telemetry overlays */}
        <div className="absolute bottom-2 left-3 text-[10px] font-mono-tech text-cyan-300 pointer-events-none z-20 flex items-center gap-3 bg-black/60 px-2 py-0.5 rounded">
          <span>COORDS: 34.0259° N, 118.7798° W</span>
          <span>OPTICAL RESOLUTION: 1080P</span>
          <span>FPS: 60.0</span>
        </div>

        <div className="absolute top-2 right-3 text-[10px] font-mono-tech text-amber-400 pointer-events-none z-20 bg-black/60 px-2 py-0.5 rounded">
          THREAT: {threatLevel}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      {cameraError && (
        <div className="p-2.5 rounded border border-amber-500/30 bg-amber-950/20 text-xs font-mono-tech text-amber-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{cameraError}</span>
        </div>
      )}

      {/* Camera Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg border border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-2">
          {cameraActive ? (
            <button
              onClick={captureFrame}
              disabled={isScanning}
              className="px-4 py-2 rounded font-orbitron font-bold text-xs tracking-wider bg-red-600 hover:bg-red-500 text-white shadow-lg transition-all flex items-center gap-2 animate-pulse"
            >
              <Crosshair className="w-4 h-4" />
              LOCK & SCAN TARGET
            </button>
          ) : (
            <button
              onClick={startCamera}
              className="px-3.5 py-1.5 rounded font-mono-tech text-xs border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 transition-colors flex items-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5 text-cyan-400" />
              RE-ENGAGE CAMERA
            </button>
          )}

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded font-mono-tech text-xs border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            CHOOSE PICTURE
          </button>
        </div>

        {capturedImage && (
          <button
            onClick={() => performTacticalScan(capturedImage)}
            disabled={isScanning}
            className="px-3 py-1.5 rounded font-mono-tech text-xs bg-cyan-950/80 border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'SCANNING...' : 'RE-ANALYZE'}
          </button>
        )}
      </div>

      {/* Analysis Result Box */}
      {analysisResult && (
        <div
          className="p-4 rounded-lg border bg-slate-950/90 backdrop-blur-md transition-all duration-300"
          style={{ borderColor: currentTheme.primaryColor }}
        >
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" style={{ color: currentTheme.primaryColor }} />
              <span className="font-orbitron font-bold text-xs tracking-wider text-white">
                TACTICAL SCAN REPORT • J.A.R.V.I.S.
              </span>
            </div>

            <button
              onClick={() => onSpeakAnalysis(analysisResult)}
              className="text-xs font-mono-tech text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <Volume2 className="w-3.5 h-3.5" />
              VOICE NARRATION
            </button>
          </div>

          <div className="text-xs sm:text-sm font-mono-tech text-slate-200 leading-relaxed whitespace-pre-wrap">
            {analysisResult}
          </div>
        </div>
      )}
    </div>
  );
};
