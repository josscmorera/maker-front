# MakerMind

<div align="center">

```
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║   ███╗   ███╗ █████╗ ██╗  ██╗███████╗██████╗ ███╗   ███╗██╗███╗  ║
║   ████╗ ████║██╔══██╗██║ ██╔╝██╔════╝██╔══██╗████╗ ████║██║████╗ ║
║   ██╔████╔██║███████║█████╔╝ █████╗  ██████╔╝██╔████╔██║██║██╔██╗║
║   ██║╚██╔╝██║██╔══██║██╔═██╗ ██╔══╝  ██╔══██╗██║╚██╔╝██║██║██║██║║
║   ██║ ╚═╝ ██║██║  ██║██║  ██╗███████╗██║  ██║██║ ╚═╝ ██║██║██║╚██║
║   ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝╚═╝ ╚═║
║                                                                  ║
║            E N G I N E E R I N G   I N T E L L I G E N C E       ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

**AI-Powered Mechanical Reasoning Engine**

*Design. Analyze. Build.*

</div>

---

## Overview

MakerMind is an AI-powered engineering assistant that helps you design, analyze, and build real-world physical systems. From drones and robots to mechanisms and electronics, MakerMind provides structured engineering guidance with calculations, specifications, and build blueprints.

### Key Features

- 🎯 **Structured Engineering Reasoning** — Systematic decomposition of complex projects
- 📐 **Technical Calculations** — Formulas, stress analysis, power budgets, and more
- 📋 **Bill of Materials** — Complete parts lists with cost estimates
- 🔧 **Build Blueprints** — Step-by-step assembly instructions
- 🧪 **Testing Plans** — Failure analysis and testing procedures
- 📊 **Visual Telemetry** — Real-time data visualization

---

## Design Language

MakerMind uses a **Techno-Minimal Industrial** design language inspired by:
- CAD/CAM software interfaces
- NASA mission control aesthetics
- Industrial control systems
- Blueprint drafting conventions

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Background | `#0C0D0F` | Primary background (graphite black) |
| Panel | `#1A1D1F` | Card/panel backgrounds (carbon) |
| Border | `#2A2F33` | Blueprint grid lines |
| Accent | `#0EE7C7` | Primary accent (industrial teal) |
| Cyan | `#47F3FF` | Secondary accent (neon cyan) |
| Warning | `#F3C623` | Safety yellow for alerts |

### Typography

- **Headings**: Saira Condensed — Industrial, condensed, technical
- **Body**: Inter — Clean, readable, professional
- **Code/Data**: JetBrains Mono — Monospace for technical content

---

## Reasoning Structure

When you describe a project, MakerMind outputs a comprehensive engineering document:

```
1. PROJECT UNDERSTANDING
   ├── Goals & objectives
   ├── Constraints & requirements
   ├── Assumptions
   └── Safety considerations

2. ENGINEERING DECOMPOSITION
   ├── Mechanical subsystems
   ├── Electrical subsystems
   ├── Control systems
   └── Integration points

3. CALCULATIONS & TECHNICAL LOGIC
   ├── Force/torque analysis
   ├── Power requirements
   ├── Stress calculations
   └── Performance estimates

4. BILL OF MATERIALS
   ├── Component list
   ├── Specifications
   └── Cost breakdown

5. BUILD BLUEPRINT
   ├── Assembly sequence
   ├── Wiring diagrams
   └── Mounting details

6. TESTING & FAILURE ANALYSIS
   ├── Test procedures
   ├── Failure modes
   └── Safety checks
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Google Gemini API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/makermind.git
   cd makermind
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API Key**
   
   Create a `.env.local` file:
   ```bash
   API_KEY=your_gemini_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5173
   ```

---

## Project Structure

```
makermind/
├── index.html          # Entry HTML with design tokens
├── index.tsx           # React entry point
├── index.css           # Global styles & design system
├── App.tsx             # Main application component
├── constants.ts        # Design tokens & configuration
├── types.ts            # TypeScript interfaces
│
├── components/
│   ├── Header.tsx          # CAD-style header with branding
│   ├── InputConsole.tsx    # Engineering command input
│   ├── MessageDisplay.tsx  # AI response with section blocks
│   ├── TelemetryPanel.tsx  # Real-time metrics visualization
│   ├── Block.tsx           # Engineering block components
│   └── ReasonFlow.tsx      # Reasoning path visualization
│
└── services/
    └── geminiService.ts    # Gemini AI integration
```

---

## Usage Examples

### Drone Design
```
Design a 5-inch FPV racing drone capable of 100mph+ speeds.
Include motor selection, frame requirements, and power system calculations.
```

### Robot Arm
```
Help me build a 6-DOF robotic arm for pick and place operations.
Payload: 500g, reach: 50cm, precision: 1mm.
```

### Custom Mechanism
```
Design a cam mechanism that converts rotary motion to linear motion 
with 20mm stroke and 1:3 dwell ratio.
```

---

## Technology Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS with custom design tokens
- **AI**: Google Gemini 2.5 Flash
- **Charts**: Recharts
- **Icons**: Lucide React
- **Build**: Vite

---

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

**Built for Engineers, by Engineers**

`SYS.ONLINE` · `v2.5.0-F` · `ENGINEERING_REASONING`

</div>
