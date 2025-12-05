import React, { useState } from 'react';
import { Cpu, Activity, Hexagon, Zap, Plus, RotateCcw, X } from 'lucide-react';
import { APP_NAME, VERSION } from '../constants';

interface HeaderProps {
  onNewChat?: () => void;
  hasMessages?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onNewChat, hasMessages = false }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleNewChat = () => {
    if (hasMessages) {
      setShowConfirm(true);
    } else {
      onNewChat?.();
    }
  };

  const confirmNewChat = () => {
    onNewChat?.();
    setShowConfirm(false);
  };

  return (
    <header className="h-16 border-b border-mm-graphite bg-mm-black/95 backdrop-blur-sm 
                       flex items-center px-4 md:px-6 justify-between sticky top-0 z-50">
      {/* Left: Logo & Brand */}
      <div className="flex items-center gap-3">
        {/* Logo Mark */}
        <div className="relative w-10 h-10 flex items-center justify-center group">
          {/* Outer hexagon border */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Hexagon className="w-10 h-10 text-mm-teal/30 stroke-[1]" />
          </div>
          
          {/* Inner glow */}
          <div className="absolute inset-1 rounded-full bg-gradient-to-br from-mm-teal/10 to-transparent" />
          
          {/* Icon */}
          <Cpu className="w-5 h-5 text-mm-teal relative z-10 
                          group-hover:drop-shadow-[0_0_8px_rgba(56,178,172,0.6)]
                          transition-all duration-300" />
          
          {/* Pulse effect */}
          <div className="absolute inset-0 rounded-full bg-mm-teal/5 animate-ping opacity-75" 
               style={{ animationDuration: '3s' }} />
        </div>
        
        {/* Brand Text */}
        <div>
          <h1 className="font-display font-bold text-xl tracking-widest text-white uppercase 
                         flex items-center gap-0.5">
            <span>Maker</span>
            <span className="text-mm-teal text-glow-teal">Mind</span>
          </h1>
          
          {/* Status line */}
          <div className="flex items-center gap-2 text-[10px] text-white/60 font-mono leading-none">
            <span className="w-1.5 h-1.5 bg-mm-teal rounded-full animate-pulse 
                             shadow-[0_0_6px_rgba(56,178,172,0.5)]" />
            <span className="uppercase tracking-widest">Sys.Online</span>
            <span className="text-white/20">│</span>
            <span className="text-mm-teal/80">v{VERSION}</span>
          </div>
        </div>

        {/* New Chat Button */}
        {onNewChat && (
          <button
            onClick={handleNewChat}
            className="ml-4 flex items-center gap-2 px-3 py-1.5 rounded
                       border border-mm-blueprint/50 bg-mm-graphite/30
                       text-white/60 hover:text-mm-teal hover:border-mm-teal/50 hover:bg-mm-teal/5
                       transition-all duration-200 group"
            title="Start new conversation"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
            <span className="font-mono text-[10px] uppercase tracking-wider hidden sm:inline">
              New Chat
            </span>
          </button>
        )}
      </div>
      
      {/* Right: System Info */}
      <div className="flex items-center gap-6 font-mono text-xs text-white/70 hidden md:flex">
        {/* Module indicator */}
        <div className="flex flex-col items-end">
          <span className="text-[9px] uppercase tracking-widest text-white/40 mb-0.5">
            Active Module
          </span>
          <span className="text-mm-cyan uppercase tracking-wide text-[11px]">
            Engineering_Reasoning
          </span>
        </div>
        
        {/* Divider */}
        <div className="h-8 w-px bg-mm-graphite" />
        
        {/* System metrics */}
        <div className="flex items-center gap-4">
          {/* Activity indicator */}
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-mm-teal" />
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-widest text-white/40">
                Load
              </span>
              <span className="text-mm-teal text-[11px]">0.2%</span>
            </div>
          </div>
          
          {/* Power indicator */}
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-mm-warning" />
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-widest text-white/40">
                Status
              </span>
              <span className="text-mm-teal text-[11px]">Optimal</span>
            </div>
          </div>
        </div>
        
        {/* Divider */}
        <div className="h-8 w-px bg-mm-graphite" />
        
        {/* Decorative data blocks */}
        <div className="hidden lg:flex items-center gap-2">
          <DataPill label="FPS" value="60" />
          <DataPill label="MEM" value="128M" />
        </div>
      </div>

      {/* Mobile: Compact status */}
      <div className="flex md:hidden items-center gap-2">
        <Activity className="w-4 h-4 text-mm-teal" />
        <span className="text-[10px] font-mono text-mm-teal uppercase">Active</span>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-mm-black/80 backdrop-blur-sm">
          <div className="bg-mm-graphite border border-mm-blueprint rounded-lg overflow-hidden 
                          max-w-sm mx-4 animate-fade-slide-in shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-mm-blueprint/30
                            bg-gradient-to-b from-mm-warning/10 to-transparent">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-mm-warning" />
                <span className="font-display text-sm font-semibold text-mm-warning uppercase tracking-wider">
                  Clear Session
                </span>
              </div>
              <button 
                onClick={() => setShowConfirm(false)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-4">
              <p className="text-sm text-white/80 mb-4">
                This will clear the current conversation and start a new session. 
                The AI will no longer remember previous messages.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 px-4 py-2 rounded border border-mm-blueprint/50
                             font-mono text-xs uppercase tracking-wider text-white/60
                             hover:text-white hover:border-white/30 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmNewChat}
                  className="flex-1 px-4 py-2 rounded bg-mm-teal
                             font-mono text-xs uppercase tracking-wider text-mm-black font-semibold
                             hover:bg-mm-cyan transition-colors"
                >
                  New Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DATA PILL — Small data indicator
// ─────────────────────────────────────────────────────────────────────────────

interface DataPillProps {
  label: string;
  value: string;
}

const DataPill: React.FC<DataPillProps> = ({ label, value }) => (
  <div className="flex items-center gap-1.5 bg-mm-graphite/50 border border-mm-blueprint/30 
                  rounded px-2 py-1">
    <span className="text-[9px] uppercase tracking-wider text-white/50">
      {label}
    </span>
    <span className="text-[10px] text-mm-cyan font-medium">
      {value}
    </span>
  </div>
);
