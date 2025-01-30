import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

type Sentiment = 'happy' | 'sad' | 'angry' | 'neutral';

interface SentimentOption {
  value: Sentiment;
  emoji: string;
  color: string;
}

interface AudioData {
  timestamp: number;
  volume: number;
}

interface SpreadsheetData {
  happy: number;
  sad: number;
  angry: number;
  neutral: number;
}

const AudioSentimentDashboard = () => {
  const [currentSentiment, setCurrentSentiment] = useState<Sentiment>('neutral');
  const [error, setError] = useState('');
  const [audioData, setAudioData] = useState<AudioData[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const sentiments: SentimentOption[] = [
    { value: 'happy', emoji: '😊', color: '#22c55e' },
    { value: 'sad', emoji: '😢', color: '#3b82f6' },
    { value: 'angry', emoji: '😠', color: '#ef4444' },
    { value: 'neutral', emoji: '😐', color: '#a855f7' }
  ];

  // Fetch emotion data from spreadsheet
  const fetchEmotionData = async () => {
    try {
      // Simulating API call to spreadsheet
      const response = await fetch('YOUR_SPREADSHEET_API_ENDPOINT');
      const data: SpreadsheetData = await response.json();

      // Find which emotion has value 1
      if (data.happy === 1) setCurrentSentiment('happy');
      else if (data.sad === 1) setCurrentSentiment('sad');
      else if (data.angry === 1) setCurrentSentiment('angry');
      else if (data.neutral === 1) setCurrentSentiment('neutral');
    } catch (err) {
      console.log('Fetching latest emotion data...');
    }
  };

  // Poll for emotion updates every 6 seconds
  useEffect(() => {
    const intervalId = setInterval(fetchEmotionData, 6000); // Sync every 6 seconds
    fetchEmotionData(); // Initial fetch
    return () => clearInterval(intervalId);
  }, []);

  // Initialize audio context and analyzer
  useEffect(() => {
    audioContextRef.current = new AudioContext();
    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 256;

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!audioContextRef.current || !analyserRef.current) return;

      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      setIsRecording(true);
      updateAudioData();
    } catch (err) {
      setError('Failed to access microphone. Please check permissions.');
    }
  };

  const updateAudioData = () => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const update = () => {
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;

      setAudioData(prevData => {
        const newData = [...prevData, {
          timestamp: Date.now(),
          volume: average
        }];
        return newData.slice(-50);
      });

      animationFrameRef.current = requestAnimationFrame(update);
    };

    update();
  };

  const stopRecording = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsRecording(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <span className="text-xl">🎵</span>
            Audio Sentiment Analysis Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            <div className="flex gap-4">
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                variant={isRecording ? "destructive" : "default"}
              >
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </Button>
            </div>

            <div className="p-4 rounded-lg shadow bg-white">
              {/* Audio Visualizer */}
              <canvas
                width={800}
                height={200}
                className="bg-white rounded-lg shadow"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {sentiments.map(({ value, emoji, color }) => (
                <Button
                  key={value}
                  className="h-24 transition-colors"
                  style={{
                    backgroundColor: currentSentiment === value ? color : '#e5e7eb',
                    cursor: 'default'
                  }}
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-2xl">{emoji}</span>
                    <span className="font-medium capitalize">{value}</span>
                  </div>
                </Button>
              ))}
            </div>

            <div className="bg-gray-200 rounded-lg p-4">
              <h3 className="font-medium mb-2">Current Status:</h3>
              <p>Active Emotion: <span className="capitalize">{currentSentiment}</span></p>
              <p>Recording Status: {isRecording ? 'Recording' : 'Stopped'}</p>
              <p>Data Source: Spreadsheet (updating every 6 seconds)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AudioSentimentDashboard;