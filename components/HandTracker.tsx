
import React, { useRef, useEffect, useState } from 'react';
import { HandData, GestureState } from '../types';

interface HandTrackerProps {
  onUpdate: (data: HandData) => void;
}

const HandTracker: React.FC<HandTrackerProps> = ({ onUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext('2d');

    const hands = new (window as any).Hands({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    const onResults = (results: any) => {
      if (!canvasCtx) return;

      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      
      // Draw minimal feedback
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        setActive(true);
        const landmarks = results.multiHandLandmarks[0];
        
        // Gesture Detection Logic
        const gesture = detectGesture(landmarks);
        const rotation = calculateRotation(landmarks);
        const zoom = calculateZoom(landmarks);
        const center = calculateCenter(landmarks);

        onUpdate({ gesture, rotation, zoom, center });

        // Draw basic skeleton for user feedback
        canvasCtx.fillStyle = '#00ffcc';
        landmarks.forEach((pt: any) => {
          canvasCtx.beginPath();
          canvasCtx.arc(pt.x * canvasElement.width, pt.y * canvasElement.height, 2, 0, 2 * Math.PI);
          canvasCtx.fill();
        });
      } else {
        setActive(false);
        onUpdate({ 
          gesture: 'idle', 
          rotation: { x: 0, y: 0, z: 0 }, 
          zoom: 1, 
          center: { x: 0.5, y: 0.5 } 
        });
      }
      canvasCtx.restore();
    };

    hands.onResults(onResults);

    const camera = new (window as any).Camera(videoElement, {
      onFrame: async () => {
        await hands.send({ image: videoElement });
      },
      width: 1280,
      height: 720
    });
    camera.start();

    return () => {
      camera.stop();
      hands.close();
    };
  }, []);

  const detectGesture = (landmarks: any[]): GestureState => {
    // Indices for finger tips
    const tips = [8, 12, 16, 20];
    const bases = [5, 9, 13, 17];
    
    let extendedFingers = 0;
    tips.forEach((tipIdx, i) => {
      // Very simple distance check for extension
      if (landmarks[tipIdx].y < landmarks[bases[i]].y - 0.05) {
        extendedFingers++;
      }
    });

    // Distance between thumb tip (4) and index tip (8) for grab
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const dist = Math.sqrt(Math.pow(thumbTip.x - indexTip.x, 2) + Math.pow(thumbTip.y - indexTip.y, 2));

    if (dist < 0.05 && extendedFingers < 2) return 'grab';
    if (extendedFingers > 3) return 'open';
    if (extendedFingers === 0) return 'fist';
    return 'idle';
  };

  const calculateRotation = (landmarks: any[]) => {
    const wrist = landmarks[0];
    const middleBase = landmarks[9];
    return {
      x: (middleBase.y - wrist.y),
      y: (middleBase.x - wrist.x),
      z: 0
    };
  };

  const calculateZoom = (landmarks: any[]) => {
    // Zoom based on spread of hand
    const thumb = landmarks[4];
    const pinky = landmarks[20];
    const dist = Math.sqrt(Math.pow(thumb.x - pinky.x, 2) + Math.pow(thumb.y - pinky.y, 2));
    return dist * 2;
  };

  const calculateCenter = (landmarks: any[]) => {
    const wrist = landmarks[0];
    return { x: wrist.x, y: wrist.y };
  };

  return (
    <div className="relative rounded-xl overflow-hidden border-2 border-white/20 w-32 h-24 bg-black/50 backdrop-blur-sm group transition-all hover:scale-110">
      <video ref={videoRef} className="hidden" />
      <canvas ref={canvasRef} width={128} height={96} className="w-full h-full opacity-70" />
      {!active && (
        <div className="absolute inset-0 flex items-center justify-center text-[8px] text-white/50 text-center px-2">
          Place Hand in View
        </div>
      )}
      <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
    </div>
  );
};

export default HandTracker;
