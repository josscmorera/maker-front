import React, { useState, useRef, useEffect } from 'react';
import { Send, ChevronRight, Loader2, Terminal, Zap } from 'lucide-react';

interface InputConsoleProps {
  onSendMessage: (message: string) => void;
  isProcessing: boolean;
}

export const InputConsole: React.FC<InputConsoleProps> = ({ onSendMessage, isProcessing }) => {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isProcessing) return;
    onSendMessage(input);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [input]);

  return (
    <div className="w-full bg-mm-black/95 backdrop-blur-sm border-t border-mm-graphite">
      {/* Top accent line */}
      <div className={`
        h-[1px] transition-all duration-300
        ${isFocused 
          ? 'bg-gradient-to-r from-transparent via-mm-teal to-transparent' 
          : 'bg-transparent'
        }
      `} />
      
      <div className="max-w-4xl mx-auto p-4">
        {/* Input container */}
        <div className={`
          relative flex items-end gap-3 
          bg-mm-graphite/30 border rounded
          p-3 transition-all duration-300
          ${isFocused 
            ? 'border-mm-teal/50 bg-mm-graphite/50 shadow-[0_0_20px_rgba(14,231,199,0.1)]' 
            : 'border-mm-blueprint/50'
          }
        `}>
          {/* Left indicator */}
          <div className={`
            pb-2 transition-colors duration-300
            ${isProcessing 
              ? 'text-mm-warning' 
              : isFocused 
                ? 'text-mm-teal' 
                : 'text-mm-steel'
            }
          `}>
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <ChevronRight className={`w-5 h-5 ${isFocused ? 'animate-pulse' : ''}`} />
            )}
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={isProcessing 
              ? "COMPUTING ENGINEERING SOLUTION..." 
              : "Describe what you want to build..."
            }
            disabled={isProcessing}
            className={`
              w-full bg-transparent font-mono text-sm text-mm-blueprint
              focus:outline-none resize-none overflow-hidden
              placeholder:text-mm-steel placeholder:uppercase placeholder:tracking-wider
              disabled:opacity-50
              leading-6
            `}
            rows={1}
          />

          {/* Submit button */}
          <button 
            onClick={handleSubmit}
            disabled={!input.trim() || isProcessing}
            className={`
              relative p-2.5 rounded transition-all duration-200 group
              ${!input.trim() || isProcessing 
                ? 'text-mm-steel cursor-not-allowed opacity-40' 
                : 'text-mm-black bg-mm-teal hover:bg-mm-cyan shadow-[0_0_15px_rgba(14,231,199,0.3)] hover:shadow-[0_0_25px_rgba(71,243,255,0.4)]'
              }
            `}
          >
            <Send className="w-4 h-4" />
            
            {/* Glow effect on hover */}
            {input.trim() && !isProcessing && (
              <div className="absolute inset-0 rounded bg-mm-teal/20 blur-md 
                              opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
            )}
          </button>
        </div>
        
        {/* Footer info */}
        <div className="mt-3 flex justify-between items-center">
          <div className="flex items-center gap-4 text-[10px] text-mm-steel font-mono uppercase tracking-wider">
            <div className="flex items-center gap-2">
              <Terminal className="w-3 h-3" />
              <span>Mode: Engineering Assistance</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <Zap className="w-3 h-3" />
              <span>Shift+Enter for new line</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-wider">
            {/* Character count */}
            <span className={`
              transition-colors duration-200
              ${input.length > 0 
                ? input.length > 2000 
                  ? 'text-mm-warning' 
                  : 'text-mm-teal' 
                : 'text-mm-steel'
              }
            `}>
              {input.length} chars
            </span>
            
            {/* Status indicator */}
            <div className="flex items-center gap-1.5">
              <span className={`
                w-1.5 h-1.5 rounded-full transition-all duration-300
                ${isProcessing 
                  ? 'bg-mm-warning animate-pulse shadow-[0_0_6px_rgba(243,198,35,0.5)]' 
                  : 'bg-mm-teal shadow-[0_0_4px_rgba(14,231,199,0.3)]'
                }
              `} />
              <span className={isProcessing ? 'text-mm-warning' : 'text-mm-steel'}>
                {isProcessing ? 'Computing' : 'Ready'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
