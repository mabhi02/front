import React, { useState, useEffect, useRef } from 'react';
import { Camera } from 'lucide-react';

const MilitaryDetectionGUI = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);

  const startDetection = async () => {
    try {
      console.log("Starting detection...");
      const response = await fetch('http://localhost:5000/start_detection', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Failed to start detection');
      }
      
      setIsRunning(true);
      
      // Force reload the video feed
      if (videoRef.current) {
        videoRef.current.src = `http://localhost:5000/video_feed?t=${new Date().getTime()}`;
      }
    } catch (err) {
      setError('Failed to start detection. Make sure the Python server is running.');
      console.error(err);
    }
  };

  const stopDetection = async () => {
    try {
      const response = await fetch('http://localhost:5000/stop_detection', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Failed to stop detection');
      }
      
      setIsRunning(false);
      if (videoRef.current) {
        videoRef.current.src = '';
      }
    } catch (err) {
      setError('Failed to stop detection.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-5xl mx-auto bg-gray-800 rounded-lg shadow-xl overflow-hidden">
        <div className="p-4 flex justify-between items-center border-b border-gray-700">
          <h1 className="text-2xl font-bold text-white">Military Object Detection</h1>
          <button
            onClick={isRunning ? stopDetection : startDetection}
            className={`px-6 py-2 rounded-md ${
              isRunning 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white font-semibold transition-colors`}
          >
            {isRunning ? 'Stop' : 'Start'}
          </button>
        </div>

        <div className="p-6">
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            {isRunning && (
              <>
                <img
                  ref={videoRef}
                  src={`http://localhost:5000/video_feed?t=${new Date().getTime()}`}
                  alt="Detection Feed"
                  className="w-full h-full object-contain"
                  onError={(e) => setError('Video feed connection failed')}
                />
                <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1.5 rounded-full flex items-center gap-2">
                  <Camera size={16} className="text-red-500" />
                  <span>Live</span>
                </div>
              </>
            )}
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400">{error}</p>
              <button 
                onClick={() => setError(null)} 
                className="mt-2 text-sm text-red-400 hover:text-red-300"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MilitaryDetectionGUI;