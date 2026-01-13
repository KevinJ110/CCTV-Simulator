
import React, { useState, useEffect, useCallback } from 'react';
import CCTVMonitor from './components/CCTVMonitor';
import ControlPanel from './components/ControlPanel';
import { generateScenario, evaluateResponse } from './services/geminiService';
import { GameState, SecurityAction, Scenario } from './types';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    shiftTimeRemaining: 300, // 5 minutes
    activeScenario: null,
    history: [],
    isGameOver: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; isCorrect: boolean } | null>(null);
  const [isShiftStarted, setIsShiftStarted] = useState(false);

  const startNextScenario = useCallback(async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const scenario = await generateScenario();
      setGameState(prev => ({ ...prev, activeScenario: scenario }));
    } catch (error) {
      console.error("Error loading scenario:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const startShift = () => {
    setGameState({
      score: 0,
      shiftTimeRemaining: 300,
      activeScenario: null,
      history: [],
      isGameOver: false,
    });
    setIsShiftStarted(true);
    startNextScenario();
  };

  useEffect(() => {
    let timer: number;
    if (isShiftStarted && !gameState.isGameOver && gameState.shiftTimeRemaining > 0) {
      timer = window.setInterval(() => {
        setGameState(prev => {
          if (prev.shiftTimeRemaining <= 1) {
            clearInterval(timer);
            return { ...prev, shiftTimeRemaining: 0, isGameOver: true };
          }
          return { ...prev, shiftTimeRemaining: prev.shiftTimeRemaining - 1 };
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isShiftStarted, gameState.isGameOver, gameState.shiftTimeRemaining]);

  const handleAction = async (action: SecurityAction) => {
    if (!gameState.activeScenario) return;

    const { feedback: feedbackText, score: pointsEarned } = await evaluateResponse(
      gameState.activeScenario,
      action
    );

    const isCorrect = pointsEarned > 0;
    setFeedback({ text: feedbackText, isCorrect });

    setGameState(prev => ({
      ...prev,
      score: prev.score + pointsEarned,
      history: [...prev.history, {
        scenarioId: prev.activeScenario!.id,
        action,
        isCorrect,
        points: pointsEarned
      }]
    }));

    // Wait 3 seconds to show feedback then move to next scenario
    setTimeout(() => {
      startNextScenario();
    }, 4000);
  };

  if (!isShiftStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-[#00ff41] p-4">
        <div className="max-w-md w-full border-2 border-[#00ff41] p-8 bg-black shadow-[0_0_20px_rgba(0,255,65,0.2)]">
          <h1 className="text-4xl font-bold mb-6 tracking-tighter text-center">SENTINEL-PRO</h1>
          <div className="space-y-4 mb-8 text-sm opacity-80 leading-relaxed">
            <p>Welcome, Operator. Your shift begins now.</p>
            <p>Analyze live CCTV feeds for security breaches, theft, or suspicious activities.</p>
            <p>Your performance is monitored by the Shift Supervisor (AI). Protocol breaches will result in point deductions.</p>
            <div className="bg-[#00ff41]/10 p-3 border border-[#00ff41]/30">
              <h3 className="font-bold mb-1 uppercase">Shift Parameters:</h3>
              <ul className="list-disc list-inside">
                <li>Duration: 05:00</li>
                <li>SOP Strictness: HIGH</li>
                <li>Location: MULTI-SITE</li>
              </ul>
            </div>
          </div>
          <button 
            onClick={startShift}
            className="w-full py-4 bg-[#00ff41] text-black font-black uppercase hover:bg-white transition-colors tracking-widest"
          >
            Clock In
          </button>
        </div>
      </div>
    );
  }

  if (gameState.isGameOver) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-[#00ff41] p-4">
        <div className="max-w-2xl w-full border-2 border-[#00ff41] p-12 bg-black">
          <h1 className="text-5xl font-bold mb-8 text-center">SHIFT COMPLETE</h1>
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="border border-[#00ff41]/30 p-4">
              <span className="block text-xs uppercase opacity-50">Total Performance Score</span>
              <span className="text-4xl font-black">{gameState.score}</span>
            </div>
            <div className="border border-[#00ff41]/30 p-4">
              <span className="block text-xs uppercase opacity-50">Incidents Handled</span>
              <span className="text-4xl font-black">{gameState.history.length}</span>
            </div>
          </div>
          <div className="mb-10 max-h-48 overflow-y-auto border border-[#00ff41]/20 p-4 custom-scrollbar">
            <table className="w-full text-left text-xs uppercase tracking-wider">
              <thead>
                <tr className="border-b border-[#00ff41]/30">
                  <th className="pb-2">Action</th>
                  <th className="pb-2 text-center">Status</th>
                  <th className="pb-2 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="opacity-80">
                {gameState.history.map((h, i) => (
                  <tr key={i} className="border-b border-[#00ff41]/10">
                    <td className="py-2">{h.action}</td>
                    <td className={`py-2 text-center ${h.isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                      {h.isCorrect ? 'SUCCESS' : 'BREACH'}
                    </td>
                    <td className="py-2 text-right">{h.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button 
            onClick={startShift}
            className="w-full py-4 border-2 border-[#00ff41] hover:bg-[#00ff41] hover:text-black transition-all font-bold uppercase tracking-widest"
          >
            Start New Shift
          </button>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-black overflow-hidden font-mono selection:bg-green-500 selection:text-black">
      {/* Top Header */}
      <header className="flex justify-between items-center p-4 border-b border-gray-800 bg-gray-900/50">
        <div className="flex items-center space-x-6">
          <div>
            <span className="text-xs uppercase opacity-50 block">Operator Status</span>
            <span className="text-sm font-bold animate-pulse text-green-400">● ONLINE</span>
          </div>
          <div>
            <span className="text-xs uppercase opacity-50 block">Shift Time</span>
            <span className="text-sm font-bold">{formatTime(gameState.shiftTimeRemaining)}</span>
          </div>
        </div>
        <div className="text-center flex-1 hidden md:block">
          <h1 className="text-xl font-black tracking-[0.2em] text-white">SENTINEL-PRO V2.4</h1>
        </div>
        <div className="flex items-center space-x-6 text-right">
          <div>
            <span className="text-xs uppercase opacity-50 block">Current Score</span>
            <span className="text-sm font-bold text-yellow-400">{gameState.score.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-xs uppercase opacity-50 block">Level</span>
            <span className="text-sm font-bold">EXPERT-TR03</span>
          </div>
        </div>
      </header>

      {/* Main Simulation Area */}
      <main className="flex-1 flex flex-col md:flex-row p-4 gap-4 overflow-hidden">
        {/* Left Side: Monitor */}
        <div className="flex-[3] flex flex-col space-y-4">
          <CCTVMonitor 
            location={gameState.activeScenario?.location || 'Searching...'}
            imageUrl={gameState.activeScenario?.imageUrl}
            status={isLoading ? 'OFFLINE' : 'LIVE'}
            isLoading={isLoading}
          />
          
          {/* Situation Log */}
          <div className="flex-1 bg-gray-900 border border-gray-800 p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/30"></div>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-3 flex items-center">
              <i className="fas fa-terminal mr-2 text-blue-400"></i>
              Incident Intelligence Feed
            </h3>
            <div className="text-sm leading-relaxed space-y-2 opacity-90 overflow-y-auto max-h-[150px] custom-scrollbar">
              {isLoading ? (
                <p className="animate-pulse">Retrieving camera telemetry...</p>
              ) : gameState.activeScenario ? (
                <>
                  <p className="text-blue-300">Target Area: {gameState.activeScenario.location}</p>
                  <p className="text-white bg-gray-800 p-3 border-l-2 border-blue-500">
                    Observation: {gameState.activeScenario.description}
                  </p>
                  <p className="text-xs opacity-60">PROTOCOL ADVISORY: Evaluate visuals against SOP Appendix B (Public Safety). Use control panel to issue commands.</p>
                </>
              ) : (
                <p>Initializing system diagnostics...</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Supervisor Panel */}
        <div className="flex-1 bg-gray-900 border border-gray-800 p-4 flex flex-col">
          <div className="mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Shift Supervisor AI</h3>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-900/50 rounded-full flex items-center justify-center border border-blue-400">
                <i className="fas fa-robot text-blue-400"></i>
              </div>
              <div className="text-xs font-bold">V.I.K.T.O.R. v8.1</div>
            </div>
          </div>

          <div className="flex-1 border border-gray-800 bg-black/40 p-4 rounded text-sm italic relative">
            {feedback ? (
              <div className="animate-in fade-in slide-in-from-right duration-500">
                <span className={`block font-bold mb-2 uppercase tracking-widest ${feedback.isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                  {feedback.isCorrect ? '✔ PROTOCOL CONFIRMED' : '✘ PROTOCOL BREACH'}
                </span>
                <p className="text-gray-300">"{feedback.text}"</p>
                <div className="mt-4 flex items-center space-x-2 text-[10px] uppercase not-italic">
                  <span className="animate-pulse text-green-500">Connecting next feed...</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 not-italic">Awaiting operator assessment. Observe the monitor closely for anomalies. Misidentification will penalize your score.</p>
            )}
            <div className="absolute bottom-2 right-2 opacity-10">
              <i className="fas fa-quote-right text-4xl"></i>
            </div>
          </div>

          <div className="mt-6 border-t border-gray-800 pt-4">
            <h4 className="text-[10px] uppercase font-bold text-gray-500 mb-2 tracking-widest">Operator History</h4>
            <div className="space-y-1">
              {gameState.history.slice(-5).reverse().map((h, i) => (
                <div key={i} className="flex justify-between text-[10px] uppercase opacity-70 border-l border-gray-700 pl-2">
                  <span>{h.action}</span>
                  <span className={h.isCorrect ? 'text-green-400' : 'text-red-400'}>{h.isCorrect ? '+100' : '-50'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Control Panel Bottom */}
      <ControlPanel 
        onAction={handleAction} 
        disabled={isLoading || !!feedback}
      />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 255, 65, 0.2);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 255, 65, 0.4);
        }
      `}</style>
    </div>
  );
};

export default App;
