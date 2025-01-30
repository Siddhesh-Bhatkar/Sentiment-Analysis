"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AudioVisualizerPage = () => {
  const [isListening, setIsListening] = useState(false);
  const [sentiment, setSentiment] = useState<'happy' | 'sad' | 'angry' | 'neutral'>('neutral');
  const [error, setError] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'sentiment') {
        setSentiment(data.value);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  // Handle microphone setup
  const setupMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);
      
      setIsListening(true);
      drawVisualizer();
    } catch (err) {
      setError('Microphone access denied. Please enable microphone access.');
      setIsListening(false);
    }
  };

  // Stop microphone
  const stopMicrophone = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsListening(false);
  };

  // Draw audio visualizer
  const drawVisualizer = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    
    if (!canvas || !analyser) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);
      
      ctx.fillStyle = 'rgb(23, 23, 23)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] * 2;
        
        const colors = {
          happy: '#22c55e',
          sad: '#3b82f6',
          angry: '#ef4444',
          neutral: '#a855f7'
        };
        
        ctx.fillStyle = colors[sentiment];
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        
        x += barWidth + 1;
      }
    };
    
    draw();
  };

  // Cleanup
  useEffect(() => {
    return () => {
      stopMicrophone();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <span className="text-xl">🔊</span>
            Audio Visualizer
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <button
                onClick={isListening ? stopMicrophone : setupMicrophone}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                <span className="text-xl">
                  {isListening ? '🎤❌' : '🎤'}
                </span>
                {isListening ? 'Stop Recording' : 'Start Recording'}
              </button>
              
              <div className="flex items-center gap-2">
                <span className="font-medium">Current Sentiment:</span>
                <span className={`px-3 py-1 rounded-full text-white ${
                  sentiment === 'happy' ? 'bg-green-500' :
                  sentiment === 'sad' ? 'bg-blue-500' :
                  sentiment === 'angry' ? 'bg-red-500' :
                  'bg-purple-500'
                }`}>
                  {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
                </span>
              </div>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-4">
              <canvas
                ref={canvasRef}
                width={800}
                height={200}
                className="w-full rounded-lg"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AudioVisualizerPage;