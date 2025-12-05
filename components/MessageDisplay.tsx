import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Message, MessageType } from '../types';
import { 
  Bot, User, CheckCircle2, Cpu, Zap, Terminal, Copy, Check, Code2, Table2,
  Download, FileText, FileJson, Printer, ChevronDown, FileCode, Share2,
  GitBranch, Workflow, Box, RefreshCw, Sparkles, AlertCircle, WandSparkles
} from 'lucide-react';
import { Block, SectionHeader } from './Block';
import { MiniFlow } from './ReasonFlow';
import { geminiService } from '../services/geminiService';
import mermaid from 'mermaid';

// Initialize Mermaid with MakerMind theme
// Note: Mermaid v11 can be finicky with custom themes, so we keep it minimal
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  logLevel: 'error', // Reduce noise
  securityLevel: 'loose', // Allow more flexibility
  themeVariables: {
    primaryColor: '#38B2AC',
    primaryTextColor: '#E2E8F0',
    primaryBorderColor: '#1E2329',
    lineColor: '#4FD1C5',
    secondaryColor: '#0A0C10',
    tertiaryColor: '#020405',
    background: '#020405',
    mainBkg: '#0A0C10',
    nodeBorder: '#38B2AC',
    clusterBkg: '#0A0C10',
    clusterBorder: '#1E2329',
    titleColor: '#38B2AC',
    edgeLabelBackground: '#0A0C10',
    textColor: '#E2E8F0',
    nodeTextColor: '#E2E8F0',
  },
  flowchart: {
    curve: 'basis',
    padding: 20,
    htmlLabels: true,
    useMaxWidth: true,
  },
  sequence: {
    mirrorActors: false,
    bottomMarginAdj: 10,
  },
});

interface MessageDisplayProps {
  messages: Message[];
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION PARSING — Extract reasoning sections from AI output
// ─────────────────────────────────────────────────────────────────────────────

interface ParsedSection {
  number: string;
  title: string;
  content: string;
  icon: 'target' | 'layers' | 'calculator' | 'list' | 'wrench' | 'shield-check';
}

const SECTION_PATTERNS = [
  { pattern: /project\s*understanding/i, icon: 'target' as const, number: '01' },
  { pattern: /engineering\s*decomposition/i, icon: 'layers' as const, number: '02' },
  { pattern: /calculations|technical\s*logic/i, icon: 'calculator' as const, number: '03' },
  { pattern: /bill\s*of\s*materials|bom|build\s*blueprint/i, icon: 'list' as const, number: '04' },
  { pattern: /build\s*steps|assembly/i, icon: 'wrench' as const, number: '05' },
  { pattern: /testing|failure\s*analysis/i, icon: 'shield-check' as const, number: '06' },
];

function parseSections(content: string): ParsedSection[] {
  const sections: ParsedSection[] = [];
  
  // Match numbered sections like "1. Project Understanding" or "## 1. Project Understanding"
  const sectionRegex = /(?:^|\n)(?:#{1,3}\s*)?(\d+)\.\s*([^\n]+)\n([\s\S]*?)(?=(?:\n(?:#{1,3}\s*)?\d+\.\s)|$)/g;
  
  let match;
  while ((match = sectionRegex.exec(content)) !== null) {
    const [, num, title, sectionContent] = match;
    
    // Find matching icon
    let icon: ParsedSection['icon'] = 'target';
    let number = num.padStart(2, '0');
    
    for (const pattern of SECTION_PATTERNS) {
      if (pattern.pattern.test(title)) {
        icon = pattern.icon;
        break;
      }
    }
    
    sections.push({
      number,
      title: title.trim(),
      content: sectionContent.trim(),
      icon,
    });
  }
  
  return sections;
}

export const MessageDisplay: React.FC<MessageDisplayProps> = ({ messages }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8">
      {/* Empty State */}
      {messages.length === 0 && <EmptyState />}
      
      {/* Messages */}
      <div className="max-w-4xl mx-auto space-y-8">
        {messages.map((msg, index) => (
          <MessageBubble 
            key={msg.id} 
            message={msg} 
            index={index}
          />
        ))}
      </div>
      
      <div ref={bottomRef} className="h-8" />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// EMPTY STATE — Shown when no messages
// ─────────────────────────────────────────────────────────────────────────────

const EmptyState: React.FC = () => {
  const flowSteps = [
    { id: '1', label: 'Input', status: 'active' as const },
    { id: '2', label: 'Analyze', status: 'pending' as const },
    { id: '3', label: 'Compute', status: 'pending' as const },
    { id: '4', label: 'Output', status: 'pending' as const },
  ];

  return (
    <div className="h-full flex flex-col items-center justify-center py-20">
      <div className="text-center max-w-lg animate-fade-slide-in">
        {/* Logo animation */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          {/* Outer ring */}
          <div className="absolute inset-0 border border-mm-teal/30 rounded-full 
                          animate-[spin_20s_linear_infinite]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 
                            w-2 h-2 bg-mm-teal rounded-full" />
          </div>
          
          {/* Middle ring */}
          <div className="absolute inset-4 border border-dashed border-mm-blueprint rounded-full 
                          animate-[spin_15s_linear_infinite_reverse]" />
          
          {/* Inner circle */}
          <div className="absolute inset-8 bg-mm-graphite/50 border border-mm-teal/50 rounded-full
                          flex items-center justify-center">
            <Cpu className="w-10 h-10 text-mm-teal animate-pulse" />
          </div>
          
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-full 
                          bg-[radial-gradient(circle,rgba(56,178,172,0.1)_0%,transparent_70%)]" />
        </div>
        
        {/* Title */}
        <h2 className="font-display text-3xl font-bold uppercase tracking-widest 
                       text-white mb-3">
          System <span className="text-mm-teal">Ready</span>
        </h2>
        
        {/* Subtitle */}
        <p className="font-mono text-sm text-white/60 mb-8 leading-relaxed">
          Awaiting project parameters for analysis.<br />
          Describe a mechanical or physical system to begin decomposition.
        </p>
        
        {/* Mini flow indicator */}
        <div className="inline-block">
          <MiniFlow steps={flowSteps} />
        </div>
        
        {/* Hints */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          <HintCard 
            icon={<Zap className="w-4 h-4" />}
            title="Describe Your Build"
            description="Drones, robots, mechanisms, electronics"
          />
          <HintCard 
            icon={<Terminal className="w-4 h-4" />}
            title="Get Engineering Data"
            description="Calculations, formulas, specifications"
          />
          <HintCard 
            icon={<CheckCircle2 className="w-4 h-4" />}
            title="Receive Blueprints"
            description="BOM, build steps, testing plans"
          />
        </div>
      </div>
    </div>
  );
};

const HintCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ 
  icon, title, description 
}) => (
  <div className="bg-mm-graphite/30 border border-mm-blueprint/30 rounded p-4
                  hover:border-mm-teal/30 transition-colors duration-300">
    <div className="text-mm-teal mb-2">{icon}</div>
    <div className="font-display text-xs uppercase tracking-wider text-white mb-1">
      {title}
    </div>
    <div className="font-mono text-[10px] text-white/50">
      {description}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// MESSAGE BUBBLE — Individual message container
// ─────────────────────────────────────────────────────────────────────────────

interface MessageBubbleProps {
  message: Message;
  index: number;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, index }) => {
  const isAI = message.type === MessageType.AI;
  
  // Clean content (remove JSON blocks for display)
  // Remove JSON blocks from display (they're shown in telemetry panel)
  const cleanContent = message.content.replace(/```json\s*[\s\S]*?```/g, '');
  
  // Parse sections for AI messages
  const sections = isAI ? parseSections(cleanContent) : [];
  const hasSections = sections.length > 0;
  
  return (
    <div 
      className={`
        flex gap-4 animate-fade-slide-in
        ${isAI ? '' : 'flex-row-reverse'}
      `}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Avatar */}
      <div className={`
        flex-shrink-0 w-10 h-10 rounded flex items-center justify-center border
        ${isAI 
          ? 'bg-mm-graphite/50 border-mm-teal/30 text-mm-teal' 
          : 'bg-mm-steel/10 border-mm-steel/30 text-white'
        }
      `}>
        {isAI ? <Bot size={20} /> : <User size={20} />}
      </div>

      {/* Content */}
      <div className={`
        flex-1 max-w-[90%] md:max-w-[85%]
        ${isAI ? '' : 'flex flex-col items-end'}
      `}>
        {isAI ? (
          // AI Message with sections
          <div className="space-y-4">
            {hasSections ? (
              // Render parsed sections as blocks
              sections.map((section, idx) => (
                <Block
                  key={idx}
                  title={section.title}
                  number={section.number}
                  icon={section.icon}
                  status={message.isStreaming && idx === sections.length - 1 ? 'active' : 'complete'}
                  delay={idx * 100}
                >
                  <FormattedContent content={section.content} />
                </Block>
              ))
            ) : (
              // Fallback: render as single block for streaming or simple content
              <div className="bg-mm-graphite/30 border border-mm-blueprint/30 rounded p-6">
                <FormattedContent content={cleanContent} />
              </div>
            )}
            
            {/* Completion footer with export */}
            {!message.isStreaming && cleanContent.length > 0 && (
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2 text-[10px] font-mono text-white/40 
                                uppercase tracking-wider">
                  <CheckCircle2 size={12} className="text-mm-teal" />
                  <span>Computation Complete</span>
                  <span className="mx-1 text-white/20">•</span>
                  <span>{(cleanContent.length / 1000).toFixed(2)}kb Data</span>
                  
                  {/* Auto-healed indicator */}
                  {message.wasHealed && (
                    <>
                      <span className="mx-1 text-white/20">•</span>
                      <span className="flex items-center gap-1 text-mm-cyan">
                        <WandSparkles size={10} />
                        <span>Auto-Completed</span>
                      </span>
                    </>
                  )}
                </div>
                
                <ExportMenu content={cleanContent} timestamp={message.timestamp} />
              </div>
            )}
          </div>
        ) : (
          // User Message
          <div className="bg-mm-graphite/30 border border-mm-teal/20 rounded p-4">
            <p className="font-mono text-sm text-white whitespace-pre-wrap">
              {message.content}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT MENU — Export options for AI responses
// ─────────────────────────────────────────────────────────────────────────────

interface ExportMenuProps {
  content: string;
  timestamp: number;
}

const ExportMenu: React.FC<ExportMenuProps> = ({ content, timestamp }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const getFileName = (extension: string) => {
    const date = new Date(timestamp);
    const dateStr = date.toISOString().split('T')[0];
    const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-');
    return `makermind-blueprint-${dateStr}-${timeStr}.${extension}`;
  };
  
  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setExportStatus('Downloaded!');
    setTimeout(() => setExportStatus(null), 2000);
  };
  
  const exportAsMarkdown = () => {
    const header = `# MakerMind Engineering Blueprint
> Generated: ${new Date(timestamp).toLocaleString()}
> System: MakerMind v2.5.0-F

---

`;
    const markdown = header + content;
    downloadFile(markdown, getFileName('md'), 'text/markdown');
    setIsOpen(false);
  };
  
  const exportAsText = () => {
    const header = `════════════════════════════════════════════════════════════════
                    MAKERMIND ENGINEERING BLUEPRINT
════════════════════════════════════════════════════════════════
Generated: ${new Date(timestamp).toLocaleString()}
System: MakerMind v2.5.0-F
════════════════════════════════════════════════════════════════

`;
    // Clean markdown formatting for plain text
    const plainText = content
      .replace(/\*\*/g, '')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/#{1,3}\s/g, '')
      .replace(/```\w*\n?/g, '\n')
      .replace(/```/g, '\n');
    
    downloadFile(header + plainText, getFileName('txt'), 'text/plain');
    setIsOpen(false);
  };
  
  const exportAsJSON = () => {
    const data = {
      meta: {
        generator: 'MakerMind v2.5.0-F',
        timestamp: new Date(timestamp).toISOString(),
        type: 'engineering-blueprint'
      },
      content: content,
      sections: parseSectionsForExport(content)
    };
    
    downloadFile(JSON.stringify(data, null, 2), getFileName('json'), 'application/json');
    setIsOpen(false);
  };
  
  const exportAsHTML = () => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MakerMind Blueprint - ${new Date(timestamp).toLocaleDateString()}</title>
  <style>
    :root {
      --mm-black: #020405;
      --mm-graphite: #0A0C10;
      --mm-teal: #38B2AC;
      --mm-cyan: #4FD1C5;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', -apple-system, sans-serif;
      background: var(--mm-black);
      color: #DDE1E7;
      line-height: 1.6;
      padding: 40px;
      max-width: 900px;
      margin: 0 auto;
    }
    .header {
      border-bottom: 1px solid var(--mm-graphite);
      padding-bottom: 20px;
      margin-bottom: 40px;
    }
    .header h1 {
      font-family: 'Saira Condensed', sans-serif;
      font-size: 2rem;
      color: var(--mm-teal);
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    .header .meta {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem;
      color: #7E8A98;
      margin-top: 8px;
    }
    .section {
      background: var(--mm-graphite);
      border: 1px solid #2A2F33;
      border-radius: 4px;
      margin-bottom: 20px;
      overflow: hidden;
    }
    .section-header {
      background: linear-gradient(180deg, rgba(56,178,172,0.1) 0%, transparent 100%);
      padding: 12px 16px;
      border-bottom: 1px solid #2A2F33;
      font-family: 'Saira Condensed', sans-serif;
      font-size: 0.875rem;
      color: var(--mm-teal);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .section-content {
      padding: 16px;
      white-space: pre-wrap;
    }
    code {
      font-family: 'JetBrains Mono', monospace;
      background: rgba(0,0,0,0.3);
      padding: 2px 6px;
      border-radius: 3px;
      color: var(--mm-cyan);
      font-size: 0.875rem;
    }
    pre {
      background: var(--mm-black);
      padding: 16px;
      border-radius: 4px;
      overflow-x: auto;
      margin: 12px 0;
    }
    pre code {
      background: none;
      padding: 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
    }
    th, td {
      border: 1px solid #2A2F33;
      padding: 8px 12px;
      text-align: left;
    }
    th {
      background: var(--mm-graphite);
      color: var(--mm-teal);
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem;
      text-transform: uppercase;
    }
    ul { list-style: none; }
    ul li::before {
      content: "◆";
      color: var(--mm-teal);
      margin-right: 8px;
      font-size: 0.625rem;
    }
    @media print {
      body { background: white; color: black; }
      .section { border-color: #ccc; }
      code { background: #f0f0f0; color: #0066cc; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>MakerMind Engineering Blueprint</h1>
    <div class="meta">
      Generated: ${new Date(timestamp).toLocaleString()} | System: MakerMind v2.5.0-F
    </div>
  </div>
  <div class="content">
    ${formatContentAsHTML(content)}
  </div>
</body>
</html>`;
    
    downloadFile(html, getFileName('html'), 'text/html');
    setIsOpen(false);
  };
  
  const printDocument = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>MakerMind Blueprint</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
    h1 { color: #0EE7C7; border-bottom: 2px solid #0EE7C7; padding-bottom: 10px; }
    h2, h3 { color: #333; margin-top: 24px; }
    code { background: #f0f0f0; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
    pre { background: #f5f5f5; padding: 16px; border-radius: 4px; overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background: #f0f0f0; }
    .meta { color: #666; font-size: 12px; margin-bottom: 24px; }
  </style>
</head>
<body>
  <h1>MakerMind Engineering Blueprint</h1>
  <div class="meta">Generated: ${new Date(timestamp).toLocaleString()}</div>
  <div>${formatContentAsHTML(content)}</div>
</body>
</html>`);
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
    
    setIsOpen(false);
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    setExportStatus('Copied!');
    setTimeout(() => setExportStatus(null), 2000);
    setIsOpen(false);
  };
  
  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-mono uppercase
                   tracking-wider border border-mm-blueprint/50 text-white/60
                   hover:text-mm-teal hover:border-mm-teal/50 hover:bg-mm-teal/5
                   transition-all duration-200"
      >
        {exportStatus ? (
          <>
            <Check className="w-3 h-3 text-mm-teal" />
            <span className="text-mm-teal">{exportStatus}</span>
          </>
        ) : (
          <>
            <Download className="w-3 h-3" />
            <span>Export</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 bottom-full mb-2 w-48 bg-mm-graphite border border-mm-blueprint/50
                        rounded-lg shadow-xl overflow-hidden z-50 animate-fade-slide-in">
          {/* Header */}
          <div className="px-3 py-2 border-b border-mm-blueprint/30 bg-mm-black/50">
            <span className="font-mono text-[9px] text-white/40 uppercase tracking-wider">
              Export Blueprint
            </span>
          </div>
          
          {/* Options */}
          <div className="py-1">
            <ExportOption 
              icon={<FileText className="w-4 h-4" />}
              label="Markdown"
              description=".md file"
              onClick={exportAsMarkdown}
            />
            <ExportOption 
              icon={<FileCode className="w-4 h-4" />}
              label="HTML"
              description="Styled document"
              onClick={exportAsHTML}
            />
            <ExportOption 
              icon={<FileText className="w-4 h-4" />}
              label="Plain Text"
              description=".txt file"
              onClick={exportAsText}
            />
            <ExportOption 
              icon={<FileJson className="w-4 h-4" />}
              label="JSON"
              description="Structured data"
              onClick={exportAsJSON}
            />
            
            <div className="h-px bg-mm-blueprint/30 my-1" />
            
            <ExportOption 
              icon={<Printer className="w-4 h-4" />}
              label="Print"
              description="Print or save as PDF"
              onClick={printDocument}
            />
            <ExportOption 
              icon={<Copy className="w-4 h-4" />}
              label="Copy All"
              description="Copy to clipboard"
              onClick={copyToClipboard}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const ExportOption: React.FC<{
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
}> = ({ icon, label, description, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 px-3 py-2 text-left
               hover:bg-mm-teal/10 transition-colors group"
  >
    <span className="text-white/40 group-hover:text-mm-teal transition-colors">
      {icon}
    </span>
    <div className="flex-1 min-w-0">
      <div className="font-mono text-xs text-white group-hover:text-mm-teal transition-colors">
        {label}
      </div>
      <div className="font-mono text-[9px] text-white/30">
        {description}
      </div>
    </div>
  </button>
);

// Helper function to parse sections for JSON export
function parseSectionsForExport(content: string): { title: string; content: string }[] {
  const sections: { title: string; content: string }[] = [];
  const sectionRegex = /(?:^|\n)(?:#{1,3}\s*)?(\d+)\.\s*([^\n]+)\n([\s\S]*?)(?=(?:\n(?:#{1,3}\s*)?\d+\.\s)|$)/g;
  
  let match;
  while ((match = sectionRegex.exec(content)) !== null) {
    sections.push({
      title: match[2].trim(),
      content: match[3].trim()
    });
  }
  
  return sections;
}

// Helper function to format content as HTML
function formatContentAsHTML(content: string): string {
  let html = content
    // Headers (all 6 levels) - process from h6 to h1 to avoid conflicts
    .replace(/^###### (.+)$/gm, '<h6>$1</h6>')
    .replace(/^##### (.+)$/gm, '<h5>$1</h5>')
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Bullet points
    .replace(/^[-*•] (.+)$/gm, '<li>$1</li>')
    // Numbered items
    .replace(/^(\d+)\. (.+)$/gm, '<div class="numbered"><span class="num">$1.</span> $2</div>')
    // Paragraphs (newlines)
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
  
  // Wrap in paragraph
  html = '<p>' + html + '</p>';
  
  // Wrap lists
  html = html.replace(/(<li>.*?<\/li>)+/gs, '<ul>$&</ul>');
  
  return html;
}

// ─────────────────────────────────────────────────────────────────────────────
// CODE BLOCK — Syntax highlighted code display
// ─────────────────────────────────────────────────────────────────────────────

const CodeBlock: React.FC<{ code: string; language?: string }> = ({ code, language }) => {
  const [copied, setCopied] = React.useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="my-4 rounded overflow-hidden border border-mm-blueprint/50 bg-mm-black">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-mm-graphite/50 border-b border-mm-blueprint/30">
        <div className="flex items-center gap-2">
          <Code2 className="w-3.5 h-3.5 text-mm-teal" />
          <span className="font-mono text-[10px] text-mm-teal uppercase tracking-wider">
            {language || 'code'}
          </span>
        </div>
        <button 
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-mono uppercase
                     text-white/50 hover:text-mm-teal hover:bg-mm-teal/10 transition-colors"
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      
      {/* Code */}
      <pre className="p-4 overflow-x-auto">
        <code className="font-mono text-sm text-mm-cyan leading-relaxed whitespace-pre">
          {code}
        </code>
      </pre>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TABLE — Engineering data table
// ─────────────────────────────────────────────────────────────────────────────

const DataTable: React.FC<{ rows: string[][] }> = ({ rows }) => {
  if (!rows || rows.length === 0) return null;
  
  // Ensure we have valid headers
  const headers = rows[0];
  if (!headers || headers.length === 0) return null;
  
  // Filter out separator rows and ensure body rows have content
  const body = rows.slice(1).filter(row => 
    row && row.length > 0 && !row.every(cell => /^[-:]+$/.test(cell || ''))
  );
  
  // Determine table title from headers
  const tableTitle = headers.some(h => h.toLowerCase().includes('item') || h.toLowerCase().includes('part'))
    ? 'Bill of Materials'
    : headers.some(h => h.toLowerCase().includes('spec') || h.toLowerCase().includes('param'))
    ? 'Specifications'
    : 'Data Table';
  
  return (
    <div className="my-4 rounded overflow-hidden border border-mm-blueprint/50 bg-mm-black/30">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2 bg-mm-graphite/50 border-b border-mm-blueprint/30">
        <Table2 className="w-3.5 h-3.5 text-mm-teal" />
        <span className="font-mono text-[10px] text-mm-teal uppercase tracking-wider">
          {tableTitle}
        </span>
        <span className="font-mono text-[9px] text-white/30 ml-auto">
          {body.length} rows × {headers.length} cols
        </span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-mm-graphite/30">
              {headers.map((header, i) => (
                <th key={i} className="px-4 py-3 text-left font-mono text-xs font-semibold 
                                       text-mm-teal uppercase tracking-wider border-b border-mm-blueprint/30">
                  {header.trim()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, i) => (
              <tr key={i} className="border-b border-mm-blueprint/20 hover:bg-mm-graphite/20 transition-colors">
                {headers.map((_, j) => (
                  <td key={j} className="px-4 py-3 font-mono text-sm text-white/90">
                    {formatTableCell(row[j]?.trim() || '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SPEC BLOCK — Key-value specification display
// ─────────────────────────────────────────────────────────────────────────────

const SpecBlock: React.FC<{ specs: { label: string; value: string }[] }> = ({ specs }) => {
  return (
    <div className="my-4 grid grid-cols-2 md:grid-cols-3 gap-2">
      {specs.map((spec, i) => (
        <div key={i} className="bg-mm-black/50 border border-mm-blueprint/30 rounded p-3">
          <div className="font-mono text-[10px] text-white/40 uppercase tracking-wider mb-1">
            {spec.label}
          </div>
          <div className="font-mono text-sm text-mm-cyan font-medium">
            {spec.value}
          </div>
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DIAGRAM — ASCII/Text diagram display
// ─────────────────────────────────────────────────────────────────────────────

const DiagramBlock: React.FC<{ content: string }> = ({ content }) => {
  return (
    <div className="my-4 rounded overflow-hidden border border-mm-teal/30 bg-mm-black">
      <div className="flex items-center gap-2 px-4 py-2 bg-mm-teal/10 border-b border-mm-teal/20">
        <div className="w-2 h-2 rounded-full bg-mm-teal animate-pulse" />
        <span className="font-mono text-[10px] text-mm-teal uppercase tracking-wider">
          Blueprint Diagram
        </span>
      </div>
      <pre className="p-4 overflow-x-auto font-mono text-xs text-mm-cyan leading-relaxed whitespace-pre">
        {content}
      </pre>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MERMAID DIAGRAM — Interactive diagram renderer with auto-healing
// ─────────────────────────────────────────────────────────────────────────────

const MAX_HEAL_ATTEMPTS = 3;

interface MermaidDiagramProps {
  code: string;
  id: string;
  autoHeal?: boolean; // Enable auto-healing on render failure
}

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ code, id, autoHeal = true }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentCode, setCurrentCode] = useState<string>(code);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  
  // Healing state - use refs for values needed in callbacks to avoid stale closures
  const [isHealing, setIsHealing] = useState(false);
  const [healAttempts, setHealAttempts] = useState(0);
  const [healStatus, setHealStatus] = useState<'idle' | 'healing' | 'healed' | 'failed'>('idle');
  const healingInProgress = useRef(false);
  const healAttemptsRef = useRef(0);
  const hasAutoHealTriggered = useRef(false);

  // Determine diagram type for display
  const getDiagramType = (code: string): { type: string; icon: React.ReactNode } => {
    const lowerCode = code.toLowerCase();
    if (lowerCode.includes('flowchart') || lowerCode.includes('graph')) {
      return { type: 'Flowchart', icon: <Workflow className="w-3.5 h-3.5" /> };
    }
    if (lowerCode.includes('sequencediagram')) {
      return { type: 'Sequence Diagram', icon: <GitBranch className="w-3.5 h-3.5" /> };
    }
    if (lowerCode.includes('statediagram')) {
      return { type: 'State Machine', icon: <Box className="w-3.5 h-3.5" /> };
    }
    if (lowerCode.includes('classdiagram')) {
      return { type: 'Class Diagram', icon: <Box className="w-3.5 h-3.5" /> };
    }
    if (lowerCode.includes('erdiagram')) {
      return { type: 'ER Diagram', icon: <Box className="w-3.5 h-3.5" /> };
    }
    if (lowerCode.includes('gantt')) {
      return { type: 'Gantt Chart', icon: <Box className="w-3.5 h-3.5" /> };
    }
    if (lowerCode.includes('pie')) {
      return { type: 'Pie Chart', icon: <Box className="w-3.5 h-3.5" /> };
    }
    if (lowerCode.includes('block-beta')) {
      return { type: 'Block Diagram', icon: <Box className="w-3.5 h-3.5" /> };
    }
    return { type: 'Diagram', icon: <Workflow className="w-3.5 h-3.5" /> };
  };

  const { type: diagramType, icon: diagramIcon } = getDiagramType(currentCode);

  // Validate and auto-fix common Mermaid syntax issues
  const validateAndFixMermaid = (code: string): string => {
    let fixed = code;
    
    // FIX 1: Split arrows (arrow on one line, destination on next)
    // Match: "A[Label] -->" followed by newline and "B[Label]"
    fixed = fixed.replace(/(\w+(?:\[[^\]]+\])?)\s*(-->|->|==+>|\.\.+>)\s*\n\s*(\w+)/g, '$1 $2 $3');
    
    // FIX 2: Ensure proper spacing around arrows
    fixed = fixed.replace(/(\w+(?:\[[^\]]+\])?)\s*(-->|->|==+>|\.\.+>)\s*(\w+(?:\[[^\]]+\])?)/g, '$1 $2 $3');
    
    // FIX 3: Remove double newlines
    fixed = fixed.replace(/\n\s*\n/g, '\n');
    
    return fixed;
  };

  // Clean Mermaid code helper
  const cleanMermaidCode = (rawCode: string): string => {
    let cleanCode = rawCode
      .trim()
      .replace(/^\s*```mermaid\s*/i, '')
      .replace(/```\s*$/, '')
      .trim();
    
    // First: validate and auto-fix common issues (split arrows, etc)
    cleanCode = validateAndFixMermaid(cleanCode);
    
    // Check if code already has proper structure (multiple lines with connections)
    const lines = cleanCode.split('\n');
    const hasProperStructure = lines.length >= 3 && 
                               lines.some(l => l.includes('-->') || l.includes('->'));
    
    // Only apply aggressive reformatting if the code is malformed (single line)
    if (!hasProperStructure) {
      cleanCode = cleanCode
        .replace(/(flowchart\s+(?:TD|TB|LR|RL|BT))/gi, '$1\n')
        .replace(/(graph\s+(?:TD|TB|LR|RL|BT))/gi, '$1\n')
        .replace(/(sequenceDiagram)/gi, '$1\n')
        .replace(/(stateDiagram(?:-v2)?)/gi, '$1\n')
        .replace(/\s+(subgraph)/gi, '\n    subgraph')
        .replace(/(subgraph\s+\w+)/gi, '$1\n        ')
        .replace(/\s+(end)(?=\s|$)/gi, '\n    end')
        .replace(/(\w+\[[^\]]+\])\s*-->\s*(\w+(?:\[[^\]]+\])?)/gi, '$1 --> $2\n        ')
        .replace(/(\w+)\s*-->\s*(\w+\[[^\]]+\])/gi, '$1 --> $2\n        ')
        .replace(/(\])\s+([A-Z](?:\[|\{|\())/gi, '$1\n        $2')
        .replace(/  +/g, ' ')
        .replace(/\n\s*\n/g, '\n')
        .trim();
    }
    
    // Remove double newlines
    cleanCode = cleanCode.replace(/\n\s*\n/g, '\n');
    
    // Final pass: fix any remaining split arrows  
    cleanCode = validateAndFixMermaid(cleanCode);
    
    return cleanCode;
  };

  // Check if SVG is a Mermaid error SVG
  // Error SVGs have aria-roledescription="error" AND contain error-icon/error-text classes
  const isErrorSvg = (svg: string): boolean => {
    if (!svg) return false;
    
    // The ONLY reliable way to detect error SVG is checking aria-roledescription="error"
    // Valid flowcharts have aria-roledescription="flowchart-v2", state diagrams have "stateDiagram-v2", etc.
    if (svg.includes('aria-roledescription="error"')) {
      return true;
    }
    
    // Secondary check: error SVGs have BOTH error-icon AND error-text classes together
    if (svg.includes('class="error-icon"') && svg.includes('class="error-text"')) {
      return true;
    }
    
    // Fallback: Check for explicit "Syntax error" text in the SVG content
    if (svg.includes('>Syntax error in text<')) {
      return true;
    }
    
    return false;
  };

  // Try to render the diagram
  const tryRender = useCallback(async (codeToRender: string): Promise<{ success: boolean; svg?: string; error?: string }> => {
    // Clean and validate the code
    const cleanCode = cleanMermaidCode(codeToRender);
    const uniqueId = `mermaid-${id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`🎨 Rendering Mermaid with ID: ${uniqueId}`);
    console.log(`Code to render:\n${cleanCode}`);
    
    try {
      const { svg: renderedSvg } = await mermaid.render(uniqueId, cleanCode);
      
      const hasError = isErrorSvg(renderedSvg);
      console.log(`SVG length: ${renderedSvg.length}, contains error: ${hasError}`);
      
      if (hasError) {
        console.log(`Error SVG detected. First 500 chars:\n${renderedSvg.substring(0, 500)}`);
      }
      
      // Check for Mermaid's error SVG (v11+ returns error SVG instead of throwing)
      if (hasError) {
        // Clean up the error element from DOM to prevent display
        const errorEl = document.getElementById(uniqueId);
        if (errorEl) errorEl.remove();
        
        // Also try to find and remove any dangling error SVGs
        document.querySelectorAll(`[id^="dmermaid-"]`).forEach(el => {
          if (el.innerHTML.includes('error-icon') || el.innerHTML.includes('Syntax error')) {
            el.remove();
          }
        });
        
        // Extract more specific error from SVG if possible
        const errorTextMatch = renderedSvg.match(/<text class="error-text"[^>]*>([^<]+)</);
        const specificError = errorTextMatch ? errorTextMatch[1] : 'Invalid Mermaid syntax';
        
        console.log(`Extracted error: ${specificError}`);
        
        return { success: false, error: specificError };
      }
      
      return { success: true, svg: renderedSvg };
    } catch (err) {
      // Clean up any error elements that might have been created
      document.querySelectorAll(`[id^="dmermaid-"]`).forEach(el => {
        if (el.innerHTML.includes('error-icon') || el.innerHTML.includes('Syntax error')) {
          el.remove();
        }
      });
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to render diagram';
      console.log(`Mermaid render threw exception: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  }, [id]);

  // Auto-heal function
  const healDiagram = useCallback(async () => {
    // Check current attempt count from ref to avoid stale closures
    const currentAttemptNumber = healAttemptsRef.current + 1;
    
    // Guard: Don't proceed if already healing or max attempts reached
    if (healingInProgress.current) {
      console.log(`⏳ Healing already in progress for diagram ${id}, skipping...`);
      return;
    }
    
    if (currentAttemptNumber > MAX_HEAL_ATTEMPTS) {
      console.log(`❌ Max heal attempts (${MAX_HEAL_ATTEMPTS}) already reached for diagram ${id}`);
      setHealStatus('failed');
      return;
    }
    
    // Update refs and state BEFORE starting
    healingInProgress.current = true;
    healAttemptsRef.current = currentAttemptNumber;
    setHealAttempts(currentAttemptNumber);
    setIsHealing(true);
    setHealStatus('healing');
    
    try {
      console.log(`🔧 Healing attempt ${currentAttemptNumber}/${MAX_HEAL_ATTEMPTS} for diagram ${id}`);
      
      const healedCode = await geminiService.healDiagram(currentCode, error || undefined);
      
      if (healedCode) {
        console.log(`📝 Healed code (full):\n${healedCode}`);
        
        // Apply final validation and fixes before trying to render
        const validatedCode = validateAndFixMermaid(healedCode);
        console.log(`🔍 After validation:\n${validatedCode}`);
        
        // Try to render the healed code
        const result = await tryRender(validatedCode);
        
        console.log(`Render result: success=${result.success}, hasSvg=${!!result.svg}, isError=${result.svg ? isErrorSvg(result.svg) : 'N/A'}`);
        
        if (result.success && result.svg && !isErrorSvg(result.svg)) {
          console.log(`✅ Diagram ${id} healed successfully on attempt ${currentAttemptNumber}!`);
          setCurrentCode(validatedCode);
          setSvg(result.svg);
          setError(null);
          setHealStatus('healed');
          setIsHealing(false);
          healingInProgress.current = false;
          return;
        } else {
          // Healed code still doesn't work, try again if we have attempts left
          console.log(`⚠️ Healed code still has errors (attempt ${currentAttemptNumber}/${MAX_HEAL_ATTEMPTS})`);
          console.log(`Error message: ${result.error}`);
          if (result.svg) {
            console.log(`SVG snippet: ${result.svg.substring(0, 300)}`);
          }
          setCurrentCode(validatedCode); // Use the validated/fixed code for next attempt
          
          if (currentAttemptNumber < MAX_HEAL_ATTEMPTS) {
            console.log(`🔄 Scheduling retry in 1 second...`);
            healingInProgress.current = false;
            setIsHealing(false);
            // Schedule another attempt with a delay
            setTimeout(() => healDiagram(), 1000);
            return;
          } else {
            console.log(`❌ Max heal attempts (${MAX_HEAL_ATTEMPTS}) reached for diagram ${id}`);
            setHealStatus('failed');
          }
        }
      } else {
        console.log(`⚠️ No healed code returned (attempt ${currentAttemptNumber}/${MAX_HEAL_ATTEMPTS})`);
        if (currentAttemptNumber < MAX_HEAL_ATTEMPTS) {
          healingInProgress.current = false;
          setIsHealing(false);
          setTimeout(() => healDiagram(), 1000);
          return;
        } else {
          setHealStatus('failed');
        }
      }
    } catch (err) {
      console.error(`❌ Healing error (attempt ${currentAttemptNumber}/${MAX_HEAL_ATTEMPTS}):`, err);
      if (currentAttemptNumber >= MAX_HEAL_ATTEMPTS) {
        setHealStatus('failed');
      } else {
        healingInProgress.current = false;
        setIsHealing(false);
        setTimeout(() => healDiagram(), 1000);
        return;
      }
    } finally {
      setIsHealing(false);
      healingInProgress.current = false;
    }
  }, [currentCode, error, id, tryRender]);

  // Cleanup orphaned error SVGs on mount and before render
  const cleanupErrorSvgs = useCallback(() => {
    // Remove any Mermaid error SVGs that might be in the DOM
    document.querySelectorAll('svg[aria-roledescription="error"]').forEach(el => el.remove());
    document.querySelectorAll('[id^="dmermaid-"]').forEach(el => {
      if (el.innerHTML.includes('error-icon') || el.innerHTML.includes('Syntax error')) {
        el.remove();
      }
    });
  }, []);

  // Cleanup on mount
  useEffect(() => {
    cleanupErrorSvgs();
    return () => cleanupErrorSvgs();
  }, [cleanupErrorSvgs]);

  // Initial render effect - only runs once on mount and when original code changes
  useEffect(() => {
    // Reset healing state when code prop changes
    if (code !== currentCode && healStatus === 'idle') {
      hasAutoHealTriggered.current = false;
      healAttemptsRef.current = 0;
      setHealAttempts(0);
    }
    
    const renderDiagram = async () => {
      // Skip if already healing
      if (healingInProgress.current) return;
      
      setIsLoading(true);
      setError(null);
      cleanupErrorSvgs(); // Clean before render attempt
      
      const result = await tryRender(currentCode);
      
      if (result.success && result.svg && !isErrorSvg(result.svg)) {
        setSvg(result.svg);
        setError(null);
        setIsLoading(false);
      } else {
        setSvg('');
        setError(result.error || 'Invalid Mermaid syntax');
        cleanupErrorSvgs(); // Clean after failed render
        setIsLoading(false);
        
        // Auto-heal if enabled and hasn't been triggered yet
        if (autoHeal && !hasAutoHealTriggered.current && healStatus !== 'healed' && healStatus !== 'failed') {
          hasAutoHealTriggered.current = true;
          console.log(`🔍 Diagram ${id} failed to render, initiating auto-heal...`);
          setTimeout(() => healDiagram(), 100);
        }
      }
    };

    renderDiagram();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, id]); // Only depend on original code and id, not currentCode

  // Update code if prop changes (reset healing state)
  useEffect(() => {
    if (code !== currentCode && healStatus !== 'healed') {
      setCurrentCode(code);
      setHealAttempts(0);
      healAttemptsRef.current = 0;
      setHealStatus('idle');
      hasAutoHealTriggered.current = false;
    }
  }, [code, currentCode, healStatus]);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportSVG = () => {
    if (!svg) return;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `makermind-diagram-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleManualHeal = () => {
    if (!isHealing && healAttempts < MAX_HEAL_ATTEMPTS) {
      healDiagram();
    }
  };

  return (
    <div className={`my-4 rounded overflow-hidden border bg-mm-black/90 ${
      healStatus === 'healed' ? 'border-mm-teal/50' : 
      healStatus === 'healing' ? 'border-mm-cyan/50' :
      error ? 'border-mm-warning/30' : 'border-mm-teal/30'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-mm-teal/10 to-transparent 
                      border-b border-mm-teal/20">
        <div className="flex items-center gap-2">
          <div className="text-mm-teal">
            {diagramIcon}
          </div>
          <span className="font-mono text-[10px] text-mm-teal uppercase tracking-wider font-semibold">
            {diagramType}
          </span>
          <span className="font-mono text-[9px] text-white/30">• Mermaid.js</span>
          
          {/* Heal status indicator */}
          {healStatus === 'healed' && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-mm-teal/20 rounded text-[9px] text-mm-teal">
              <Sparkles className="w-3 h-3" />
              Auto-healed
            </span>
          )}
          {healStatus === 'healing' && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-mm-cyan/20 rounded text-[9px] text-mm-cyan animate-pulse">
              <RefreshCw className="w-3 h-3 animate-spin" />
              Healing ({healAttempts + 1}/{MAX_HEAL_ATTEMPTS})
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          {/* Manual heal button when failed */}
          {error && !isHealing && healAttempts < MAX_HEAL_ATTEMPTS && (
            <button
              onClick={handleManualHeal}
              className="flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-mono uppercase
                         text-mm-warning hover:text-mm-teal hover:bg-mm-teal/10 transition-colors"
              title="Try to auto-fix this diagram"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Heal</span>
            </button>
          )}
          
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-mono uppercase
                       text-white/50 hover:text-mm-teal hover:bg-mm-teal/10 transition-colors"
            title="Copy source"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          </button>
          {svg && !isErrorSvg(svg) && (
            <button
              onClick={handleExportSVG}
              className="flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-mono uppercase
                         text-white/50 hover:text-mm-cyan hover:bg-mm-cyan/10 transition-colors"
              title="Export SVG"
            >
              <Download className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 bg-gradient-to-b from-mm-graphite/20 to-transparent min-h-[120px] 
                      flex items-center justify-center">
        {(isLoading || isHealing) && (
          <div className="flex flex-col items-center gap-3 text-mm-steel">
            <div className="w-6 h-6 border-2 border-mm-teal/30 border-t-mm-teal rounded-full animate-spin" />
            <span className="font-mono text-xs uppercase tracking-wider">
              {isHealing ? `Auto-healing diagram (attempt ${healAttempts + 1}/${MAX_HEAL_ATTEMPTS})...` : 'Rendering...'}
            </span>
            {isHealing && (
              <span className="font-mono text-[10px] text-white/40 max-w-[300px] text-center">
                AI is analyzing and fixing the diagram syntax
              </span>
            )}
          </div>
        )}
        
        {!isLoading && !isHealing && (error || healStatus === 'healing') && (
          <div className="w-full">
            <div className="flex items-center gap-2 text-mm-warning mb-3">
              <AlertCircle className="w-4 h-4" />
              <span className="font-mono text-xs uppercase">
                {healStatus === 'failed' ? 'Healing Failed' : healStatus === 'healing' ? 'Healing...' : 'Diagram Source'}
              </span>
              <span className="text-[10px] text-white/40">
                ({healAttempts >= MAX_HEAL_ATTEMPTS ? 'Max attempts reached' : error || 'Processing'})
              </span>
            </div>
            
            {healStatus === 'failed' && (
              <div className="mb-3 p-2 bg-mm-warning/10 border border-mm-warning/20 rounded text-[10px] text-white/60">
                Auto-healing couldn't fix this diagram after {MAX_HEAL_ATTEMPTS} attempts. 
                The syntax may require manual correction.
              </div>
            )}
            
            {/* Show source code as fallback */}
            <pre className="p-4 bg-mm-black/50 rounded border border-mm-blueprint/30 
                           font-mono text-xs text-mm-cyan overflow-x-auto whitespace-pre-wrap break-words">
              {currentCode.split(/\s+(?=subgraph|end|[A-Z]\[|[A-Z]\{|[A-Z]\()/).join('\n    ')}
            </pre>
          </div>
        )}
        
        {!isLoading && !isHealing && !error && svg && !isErrorSvg(svg) && (
          <div 
            ref={containerRef}
            className="mermaid-container w-full overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// FORMULA BLOCK — Mathematical equations and formulas
// ─────────────────────────────────────────────────────────────────────────────

const FormulaBlock: React.FC<{ formula: string; label?: string }> = ({ formula, label }) => {
  return (
    <div className="my-3 flex items-center gap-4 bg-mm-black/50 border border-mm-blueprint/30 
                    rounded px-4 py-3">
      <div className="flex-shrink-0 w-8 h-8 rounded bg-mm-teal/10 border border-mm-teal/30 
                      flex items-center justify-center">
        <span className="text-mm-teal text-sm font-bold">∫</span>
      </div>
      <div className="flex-1">
        {label && (
          <div className="font-mono text-[10px] text-white/40 uppercase tracking-wider mb-1">
            {label}
          </div>
        )}
        <div className="font-mono text-mm-cyan text-base tracking-wide">
          {formatFormula(formula)}
        </div>
      </div>
    </div>
  );
};

// Format mathematical formulas with proper styling
function formatFormula(formula: string): React.ReactNode {
  // Replace common patterns with styled versions
  const parts: React.ReactNode[] = [];
  let remaining = formula;
  let key = 0;
  
  // Pattern for superscripts (x^2, x^n, etc.)
  const formatted = formula
    .replace(/\^(\d+|[a-z])/gi, (_, exp) => `<sup>${exp}</sup>`)
    .replace(/(\d+)\/(\d+)/g, '<span class="frac">$1/$2</span>')
    .replace(/sqrt\(([^)]+)\)/gi, '√($1)')
    .replace(/pi/gi, 'π')
    .replace(/theta/gi, 'θ')
    .replace(/alpha/gi, 'α')
    .replace(/beta/gi, 'β')
    .replace(/delta/gi, 'Δ')
    .replace(/omega/gi, 'ω')
    .replace(/sigma/gi, 'σ')
    .replace(/mu/gi, 'μ');
  
  // Use dangerouslySetInnerHTML for superscripts
  return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// FORMATTED CONTENT — Enhanced markdown-like content renderer
// ─────────────────────────────────────────────────────────────────────────────

const FormattedContent: React.FC<{ content: string }> = ({ content }) => {
  const elements: React.ReactNode[] = [];
  
  // Parse code blocks first
  const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
  // Improved table regex - matches lines starting with | 
  const tableRegex = /(?:^|\n)((?:\|[^\n]+\|[ \t]*\n?)+)/gm;
  
  // Collect all special blocks with their positions
  interface SpecialBlock {
    start: number;
    end: number;
    type: 'code' | 'table' | 'diagram' | 'mermaid';
    content: any;
  }
  
  const specialBlocks: SpecialBlock[] = [];
  
  // Find code blocks
  let match;
  while ((match = codeBlockRegex.exec(content)) !== null) {
    const codeContent = match[2].trim();
    const language = match[1]?.toLowerCase() || '';
    
    // Check if it's a Mermaid diagram
    const isMermaid = language === 'mermaid' || 
                      codeContent.startsWith('flowchart') ||
                      codeContent.startsWith('graph') ||
                      codeContent.startsWith('sequenceDiagram') ||
                      codeContent.startsWith('stateDiagram') ||
                      codeContent.startsWith('classDiagram') ||
                      codeContent.startsWith('erDiagram') ||
                      codeContent.startsWith('gantt') ||
                      codeContent.startsWith('pie') ||
                      codeContent.startsWith('block-beta');
    
    // Check if it's an ASCII diagram
    const isAsciiDiagram = codeContent.includes('┌') || codeContent.includes('─') || 
                           codeContent.includes('│') || codeContent.includes('└') ||
                           codeContent.includes('+--') || codeContent.includes('|--');
    
    if (isMermaid) {
      // A single ```mermaid block can (incorrectly) contain multiple diagrams.
      // Detect additional diagram starts and split them into separate blocks.
      const diagramStartRegex = /^\s*(graph\s+(?:TD|TB|LR|RL|BT)|flowchart\s+(?:TD|TB|LR|RL|BT)|sequenceDiagram|stateDiagram(?:-v2)?|classDiagram|erDiagram|gantt|pie|block-beta)\b/gm;
      const starts: number[] = [];
      let dMatch: RegExpExecArray | null;
      while ((dMatch = diagramStartRegex.exec(codeContent)) !== null) {
        starts.push(dMatch.index);
      }

      // Helper to push one diagram segment as a special block
      const pushDiagramSegment = (segment: string) => {
        const trimmed = segment.trim();
        if (!trimmed) return;
        specialBlocks.push({
          start: match!.index, // all segments share the same outer block range
          end: match!.index + match![0].length,
          type: 'mermaid',
          content: { code: trimmed }
        });
      };

      if (starts.length <= 1) {
        // Single diagram – use as-is
        pushDiagramSegment(codeContent);
      } else {
        // Multiple diagrams – slice between start indices
        for (let i = 0; i < starts.length; i++) {
          const startIdx = starts[i];
          const endIdx = i + 1 < starts.length ? starts[i + 1] : codeContent.length;
          const segment = codeContent.slice(startIdx, endIdx);
          pushDiagramSegment(segment);
        }
      }
    } else if (isAsciiDiagram) {
      specialBlocks.push({
        start: match.index,
        end: match.index + match[0].length,
        type: 'diagram',
        content: { language: match[1], code: codeContent }
      });
    } else {
      specialBlocks.push({
        start: match.index,
        end: match.index + match[0].length,
        type: 'code',
        content: { language: match[1], code: codeContent }
      });
    }
  }
  
  // Find tables - improved detection
  const tableMatches = content.matchAll(/(?:^|\n)((?:\|[^\n]+\|[ \t]*(?:\n|$))+)/gm);
  for (const tableMatch of tableMatches) {
    const tableContent = tableMatch[1].trim();
    const tableLines = tableContent.split('\n').filter(line => line.trim());
    
    // Parse rows - handle both | col | col | and leading/trailing pipes
    const rows = tableLines.map(row => {
      // Remove leading/trailing pipes and split
      const cells = row.replace(/^\||\|$/g, '').split('|').map(cell => cell.trim());
      return cells;
    }).filter(row => {
      // Filter out separator rows (----, :---:, etc.)
      return !row.every(cell => /^[-:]+$/.test(cell));
    });
    
    // Check if this overlaps with a code block
    const startIdx = tableMatch.index || 0;
    const overlaps = specialBlocks.some(
      block => startIdx >= block.start && startIdx < block.end
    );
    
    if (!overlaps && rows.length > 0 && rows[0].length > 1) {
      specialBlocks.push({
        start: startIdx,
        end: startIdx + tableMatch[0].length,
        type: 'table',
        content: rows
      });
    }
  }
  
  // Sort by position
  specialBlocks.sort((a, b) => a.start - b.start);
  
  // Process content
  let lastEnd = 0;
  specialBlocks.forEach((block, i) => {
    // Add text before this block
    if (block.start > lastEnd) {
      const textBefore = content.slice(lastEnd, block.start);
      elements.push(
        <TextContent key={`text-${i}`} content={textBefore} />
      );
    }
    
    // Add the special block
    if (block.type === 'code') {
      elements.push(
        <CodeBlock key={`code-${i}`} code={block.content.code} language={block.content.language} />
      );
    } else if (block.type === 'table') {
      elements.push(
        <DataTable key={`table-${i}`} rows={block.content} />
      );
    } else if (block.type === 'diagram') {
      elements.push(
        <DiagramBlock key={`diagram-${i}`} content={block.content.code} />
      );
    } else if (block.type === 'mermaid') {
      elements.push(
        <MermaidDiagram key={`mermaid-${i}`} code={block.content.code} id={`msg-${i}`} />
      );
    }
    
    lastEnd = block.end;
  });
  
  // Add remaining text
  if (lastEnd < content.length) {
    elements.push(
      <TextContent key="text-final" content={content.slice(lastEnd)} />
    );
  }
  
  // If no special blocks, just render text
  if (elements.length === 0) {
    return <TextContent content={content} />;
  }
  
  return <div className="space-y-2">{elements}</div>;
};

// ─────────────────────────────────────────────────────────────────────────────
// TEXT CONTENT — Regular text with inline formatting
// ─────────────────────────────────────────────────────────────────────────────

const TextContent: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.split('\n');
  
  return (
    <div className="space-y-2 text-sm text-white leading-relaxed">
      {lines.map((line, i) => {
        const trimmedLine = line.trim();
        
        // Skip empty lines but maintain spacing
        if (!trimmedLine) {
          return <div key={i} className="h-1" />;
        }
        
        // Headers (### Header)
        if (trimmedLine.match(/^#{1,3}\s/)) {
          const level = trimmedLine.match(/^(#{1,3})/)?.[1].length || 1;
          const text = trimmedLine.replace(/^#{1,3}\s*/, '');
          const sizes = ['text-lg', 'text-base', 'text-sm'];
          return (
            <h4 key={i} className={`font-display font-semibold text-mm-teal uppercase tracking-wide 
                                    ${sizes[level - 1]} mt-4 first:mt-0`}>
              {formatInlineText(text)}
            </h4>
          );
        }
        
        // Section sub-headers (starts with **Bold Text**: or **Bold Text** at start of line)
        const sectionHeaderMatch = trimmedLine.match(/^\*\*([^*]+)\*\*:?\s*(.*)?$/);
        if (sectionHeaderMatch) {
          const [, title, rest] = sectionHeaderMatch;
          if (!rest || rest.trim() === '') {
            // Full line header
            return (
              <p key={i} className="font-display text-sm font-semibold text-mm-cyan 
                                    uppercase tracking-wide mt-4 first:mt-0">
                {title}
              </p>
            );
          } else {
            // Header with content after (like **Size:** 200-250mm)
            return (
              <div key={i} className="flex items-baseline gap-2 pl-2 mt-2">
                <span className="text-mm-teal text-xs">▸</span>
                <span className="text-mm-cyan font-semibold text-sm">{title}:</span>
                <span className="text-white/90">{formatInlineText(rest)}</span>
              </div>
            );
          }
        }
        
        // Bullet points (-, *, •) - handle with or without bold inside
        if (trimmedLine.match(/^[-•*]\s+/)) {
          const text = trimmedLine.replace(/^[-•*]\s+/, '');
          return (
            <div key={i} className="flex gap-2 pl-2 text-white">
              <span className="text-mm-teal mt-0.5 text-xs flex-shrink-0">◆</span>
              <span className="flex-1 text-white/90">{formatInlineText(text)}</span>
            </div>
          );
        }
        
        // Numbered items (1. 2. etc)
        const numMatch = trimmedLine.match(/^(\d+)\.\s+(.*)$/);
        if (numMatch) {
          return (
            <div key={i} className="flex gap-3 pl-2">
              <span className="font-mono text-mm-teal text-xs min-w-[20px] flex-shrink-0">{numMatch[1]}.</span>
              <span className="flex-1 text-white/90">{formatInlineText(numMatch[2])}</span>
            </div>
          );
        }
        
        // Lettered sub-items (a., b., etc.)
        const letterMatch = trimmedLine.match(/^([a-z])\.\s+(.*)$/i);
        if (letterMatch) {
          return (
            <div key={i} className="flex gap-2 pl-6 text-white">
              <span className="font-mono text-mm-cyan text-xs flex-shrink-0">{letterMatch[1]}.</span>
              <span className="flex-1 text-white/90">{formatInlineText(letterMatch[2])}</span>
            </div>
          );
        }
        
        // Indented content (starts with spaces/tabs)
        const indentMatch = line.match(/^(\s{2,})(.*)$/);
        if (indentMatch) {
          const indentLevel = Math.min(Math.floor(indentMatch[1].length / 2), 4);
          return (
            <p key={i} className="whitespace-pre-wrap text-white/90" 
               style={{ paddingLeft: `${indentLevel * 12}px` }}>
              {formatInlineText(indentMatch[2])}
            </p>
          );
        }
        
        // Regular paragraph
        return (
          <p key={i} className="whitespace-pre-wrap text-white/90">
            {formatInlineText(trimmedLine)}
          </p>
        );
      })}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// INLINE FORMATTING HELPERS
// ─────────────────────────────────────────────────────────────────────────────

// Units for technical values
const UNITS_PATTERN = /(\d+(?:\.\d+)?)\s*(mm|cm|m|km|kg|g|mg|lb|oz|V|mV|A|mA|W|kW|mW|Hz|kHz|MHz|GHz|mAh|Ah|°C|°F|°|%|ms|s|min|hr|rpm|mph|kph|fps|dB|Ω|kΩ|MΩ|pF|nF|µF|mF|F|H|mH|µH|N|kN|Pa|kPa|MPa|psi|bar|atm)\b/gi;

// Simple formatter for table cells - no LaTeX, minimal highlighting
function formatTableCell(text: string): React.ReactNode {
  if (!text || text === '—') return text;
  
  // Just highlight currency values and keep everything else as-is
  // Match $XX.XX or $XX patterns
  if (text.includes('$')) {
    return <span className="text-mm-teal">{text}</span>;
  }
  
  // For dimension patterns like "50x50x100mm" or "35x35x350mm", keep as single unit
  if (/^\d+x\d+x?\d*\s*(?:mm|cm|m)$/i.test(text)) {
    return <span className="text-mm-cyan">{text}</span>;
  }
  
  // For ranges like "10 - 30" or "5-15", keep as-is
  if (/^\d+\s*-\s*\d+$/.test(text)) {
    return <span className="text-mm-cyan">{text}</span>;
  }
  
  // For simple numbers, highlight them
  if (/^\d+(?:\.\d+)?$/.test(text)) {
    return <span className="text-mm-cyan">{text}</span>;
  }
  
  return text;
}

function formatInlineValue(text: string): React.ReactNode {
  if (!text) return text;
  
  // Split by units pattern
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  const regex = new RegExp(UNITS_PATTERN);
  
  while ((match = regex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    // Add highlighted number with unit
    parts.push(
      <span key={`val-${match.index}`} className="text-mm-cyan font-medium font-mono">
        {match[0]}
      </span>
    );
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  
  return parts.length > 0 ? <>{parts}</> : text;
}

function formatInlineText(text: string): React.ReactNode {
  if (!text) return null;
  
  // Combined regex to match all inline formatting
  // Order: LaTeX display ($$), LaTeX inline ($), code, bold, italic
  const inlineRegex = /(\$\$[^$]+\$\$)|(\$[^$]+\$)|(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(_[^_]+_)/g;
  
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let keyIndex = 0;
  
  while ((match = inlineRegex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      const before = text.slice(lastIndex, match.index);
      parts.push(<React.Fragment key={`t-${keyIndex++}`}>{formatInlineValue(before)}</React.Fragment>);
    }
    
    const fullMatch = match[0];
    
    // LaTeX display math ($$...$$)
    if (match[1]) {
      const latex = fullMatch.slice(2, -2).trim();
      parts.push(
        <LatexFormula key={`latex-${keyIndex++}`} formula={latex} display={true} />
      );
    }
    // LaTeX inline math ($...$)
    else if (match[2]) {
      const latex = fullMatch.slice(1, -1).trim();
      parts.push(
        <LatexFormula key={`latex-${keyIndex++}`} formula={latex} display={false} />
      );
    }
    // Inline code (`code`)
    else if (match[3]) {
      parts.push(
        <code key={`c-${keyIndex++}`} className="font-mono text-mm-cyan bg-mm-black/50 
                                                  px-1.5 py-0.5 rounded text-xs mx-0.5">
          {fullMatch.slice(1, -1)}
        </code>
      );
    }
    // Bold (**text**)
    else if (match[4]) {
      const boldContent = fullMatch.slice(2, -2);
      // Check if it's a label (ends with :)
      if (boldContent.endsWith(':')) {
        parts.push(
          <span key={`b-${keyIndex++}`} className="text-mm-cyan font-semibold">
            {boldContent}
          </span>
        );
      } else {
        parts.push(
          <strong key={`b-${keyIndex++}`} className="text-white font-semibold">
            {boldContent}
          </strong>
        );
      }
    }
    // Italic (*text* or _text_)
    else if (match[5] || match[6]) {
      parts.push(
        <em key={`i-${keyIndex++}`} className="text-white/80 italic">
          {fullMatch.slice(1, -1)}
        </em>
      );
    }
    
    lastIndex = match.index + fullMatch.length;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    const remaining = text.slice(lastIndex);
    parts.push(<React.Fragment key={`t-${keyIndex++}`}>{formatInlineValue(remaining)}</React.Fragment>);
  }
  
  // If no matches, just format values
  if (parts.length === 0) {
    return formatInlineValue(text);
  }
  
  return <>{parts}</>;
}

// ─────────────────────────────────────────────────────────────────────────────
// LATEX FORMULA — Render LaTeX math expressions
// ─────────────────────────────────────────────────────────────────────────────

const LatexFormula: React.FC<{ formula: string; display?: boolean }> = ({ formula, display = false }) => {
  // Convert LaTeX to readable format
  const rendered = convertLatexToReadable(formula);
  
  if (display) {
    // Display mode - centered block
    return (
      <div className="my-3 py-3 px-4 bg-mm-black/50 border border-mm-teal/20 rounded
                      flex items-center justify-center">
        <div className="flex items-center gap-2">
          <span className="text-mm-teal/50 text-lg">⟨</span>
          <span className="font-mono text-mm-cyan text-lg tracking-wide"
                dangerouslySetInnerHTML={{ __html: rendered }} />
          <span className="text-mm-teal/50 text-lg">⟩</span>
        </div>
      </div>
    );
  }
  
  // Inline mode
  return (
    <span className="inline-flex items-center mx-1 px-2 py-0.5 bg-mm-black/30 
                     border border-mm-blueprint/30 rounded font-mono text-mm-cyan"
          dangerouslySetInnerHTML={{ __html: rendered }} />
  );
};

// Convert LaTeX notation to HTML with proper symbols
function convertLatexToReadable(latex: string): string {
  return latex
    // Fractions: \frac{a}{b} → a/b with styled fraction
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '<span class="inline-flex flex-col items-center text-xs leading-none"><span class="border-b border-mm-cyan/50 px-1">$1</span><span class="px-1">$2</span></span>')
    // Square root: \sqrt{x} → √x
    .replace(/\\sqrt\{([^}]+)\}/g, '√<span class="border-t border-mm-cyan/50 px-0.5">$1</span>')
    // Subscripts: _x or _{xy}
    .replace(/\_\{([^}]+)\}/g, '<sub class="text-xs">$1</sub>')
    .replace(/\_([a-zA-Z0-9])/g, '<sub class="text-xs">$1</sub>')
    // Superscripts: ^x or ^{xy}
    .replace(/\^\{([^}]+)\}/g, '<sup class="text-xs">$1</sup>')
    .replace(/\^([a-zA-Z0-9])/g, '<sup class="text-xs">$1</sup>')
    // Greek letters
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\gamma/g, 'γ')
    .replace(/\\delta/g, 'δ')
    .replace(/\\Delta/g, 'Δ')
    .replace(/\\epsilon/g, 'ε')
    .replace(/\\theta/g, 'θ')
    .replace(/\\lambda/g, 'λ')
    .replace(/\\mu/g, 'μ')
    .replace(/\\nu/g, 'ν')
    .replace(/\\pi/g, 'π')
    .replace(/\\rho/g, 'ρ')
    .replace(/\\sigma/g, 'σ')
    .replace(/\\tau/g, 'τ')
    .replace(/\\phi/g, 'φ')
    .replace(/\\omega/g, 'ω')
    .replace(/\\Omega/g, 'Ω')
    // Operators
    .replace(/\\times/g, '×')
    .replace(/\\cdot/g, '·')
    .replace(/\\div/g, '÷')
    .replace(/\\pm/g, '±')
    .replace(/\\neq/g, '≠')
    .replace(/\\leq/g, '≤')
    .replace(/\\geq/g, '≥')
    .replace(/\\approx/g, '≈')
    .replace(/\\infty/g, '∞')
    .replace(/\\sum/g, '∑')
    .replace(/\\prod/g, '∏')
    .replace(/\\int/g, '∫')
    .replace(/\\partial/g, '∂')
    .replace(/\\nabla/g, '∇')
    // Formatting
    .replace(/\\text\{([^}]+)\}/g, '<span class="font-sans">$1</span>')
    .replace(/\\mathbf\{([^}]+)\}/g, '<strong>$1</strong>')
    .replace(/\\left\(/g, '(')
    .replace(/\\right\)/g, ')')
    .replace(/\\left\[/g, '[')
    .replace(/\\right\]/g, ']')
    // Clean up remaining backslashes
    .replace(/\\/g, '');
}
