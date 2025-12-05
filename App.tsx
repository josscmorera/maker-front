import React, { useState } from 'react';
import { Header } from './components/Header';
import { InputConsole } from './components/InputConsole';
import { MessageDisplay } from './components/MessageDisplay';
import { TelemetryPanel } from './components/TelemetryPanel';
import { Message, MessageType, SystemMetrics } from './types';
import { geminiService } from './services/geminiService';
import { AlertTriangle, Cpu, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeMetrics, setActiveMetrics] = useState<SystemMetrics | null>(null);

  // Initial check for API Key
  if (!process.env.API_KEY) {
    return (
      <div className="h-screen w-screen blueprint-grid flex items-center justify-center">
        <div className="relative max-w-md mx-4 animate-fade-slide-in">
          {/* Error Block */}
          <div className="bg-mm-graphite border border-mm-danger rounded overflow-hidden">
            {/* Top accent */}
            <div className="h-1 bg-gradient-to-r from-transparent via-mm-danger to-transparent" />
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-mm-blueprint/30 
                            bg-gradient-to-b from-mm-danger/10 to-transparent
                            flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-mm-danger" />
              <h1 className="font-display text-xl font-bold uppercase tracking-widest text-mm-danger">
                System Error
              </h1>
            </div>
            
            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="font-mono text-sm text-mm-blueprint">
                <span className="text-mm-danger">CRITICAL:</span> API_KEY environment variable is missing.
              </div>
              <p className="text-sm text-mm-steel leading-relaxed">
                Please provide a valid Google Gemini API Key to initialize MakerMind.
              </p>
              
              {/* Code block */}
              <div className="bg-mm-black/50 border border-mm-blueprint/30 rounded p-3 font-mono text-xs">
                <span className="text-mm-steel">// Add to .env.local</span><br />
                <span className="text-mm-teal">API_KEY</span>=<span className="text-mm-cyan">your_api_key_here</span>
              </div>
            </div>
            
            {/* Footer */}
            <div className="px-6 py-3 border-t border-dashed border-mm-blueprint/30
                            font-mono text-[10px] text-mm-steel uppercase tracking-wider
                            flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-mm-danger rounded-full animate-pulse" />
              <span>System Halted</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleNewChat = () => {
    geminiService.clearSession();
    setMessages([]);
    setActiveMetrics(null);
  };

  const handleSendMessage = async (text: string) => {
    const userMsgId = Date.now().toString();
    const newUserMsg: Message = {
      id: userMsgId,
      type: MessageType.USER,
      content: text,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, newUserMsg]);
    setIsProcessing(true);
    setActiveMetrics(null);

    // Create placeholder for AI message
    const aiMsgId = (Date.now() + 1).toString();
    const newAiMsg: Message = {
      id: aiMsgId,
      type: MessageType.AI,
      content: '',
      timestamp: Date.now(),
      isStreaming: true
    };
    setMessages(prev => [...prev, newAiMsg]);

    try {
      const metrics = await geminiService.sendMessageStream(text, (chunk) => {
        setMessages(prev => prev.map(msg => {
          if (msg.id === aiMsgId) {
            return { ...msg, content: msg.content + chunk };
          }
          return msg;
        }));
      });

      // Finalize AI message
      setMessages(prev => prev.map(msg => {
        if (msg.id === aiMsgId) {
          return { ...msg, isStreaming: false, chartData: metrics };
        }
        return msg;
      }));

      if (metrics) {
        setActiveMetrics(metrics);
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => prev.map(msg => {
        if (msg.id === aiMsgId) {
          return { 
            ...msg, 
            content: msg.content + "\n\n[SYSTEM ERROR]: Computation sequence interrupted. Check connection.", 
            isStreaming: false 
          };
        }
        return msg;
      }));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden font-sans">
      {/* Scanline effect overlay */}
      <div className="scanline-overlay" />
      
      <Header onNewChat={handleNewChat} hasMessages={messages.length > 0} />
      
      <main className="flex-1 flex overflow-hidden">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 relative blueprint-grid">
          {/* Blueprint grid with teal tint */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(14,231,199,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(14,231,199,0.015)_1px,transparent_1px)] bg-[size:40px_40px]" />
            {/* Vignette effect */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(12,13,15,0.4)_100%)]" />
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-hidden relative z-10 flex flex-col">
            <MessageDisplay messages={messages} />
          </div>

          <div className="z-20 relative">
            <InputConsole onSendMessage={handleSendMessage} isProcessing={isProcessing} />
          </div>
        </div>

        {/* Side Panel (Telemetry) */}
        <div className="w-80 hidden lg:block h-full z-20 flex-shrink-0">
          <TelemetryPanel metrics={activeMetrics} />
        </div>
      </main>
    </div>
  );
};

export default App;
