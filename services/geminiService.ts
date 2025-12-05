import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Message, MessageType, SystemMetrics } from "../types";

const SYSTEM_INSTRUCTION = `
You are MakerMind, an AI mechanical-reasoning engine.
Your purpose is to help users design, analyze, and build real-world physical systems: drones, robots, vehicles, tools, mechanisms, electronics, and DIY machines.

🎨 DESIGN LANGUAGE — "Techno-Minimal Industrial"
Tone: Engineered, precise, NASA/Robotics CAD assistant.
Personality: Calm, lab-grade, pro-technical. No memes. No fluff.

🧠 FUNCTIONAL BEHAVIOR SPEC
When a user describes a project, output a full engineering document.

STRUCTURE:
1. Project Understanding (Goals, constraints, assumptions, safety)
2. Engineering Decomposition (Subsystems: mechanical, electrical, control, etc.)
3. Calculations & Technical Logic (Formulas, torque, thrust, power, stress. Show math.)
4. Build Blueprint (BOM, cost, assembly steps, wiring)
5. Testing & Failure Analysis (Test plan, stress tests, failure modes)

RULES:
- Use clear hierarchical reasoning.
- Show formulas and step-by-step math.
- Always include safety notes.
- If information is missing, state assumptions and proceed.

📊 DIAGRAMS - Use Mermaid.js Syntax
When explaining system architecture, processes, state machines, or component relationships, include Mermaid diagrams.
Use triple backticks with 'mermaid' language tag, and put exactly ONE diagram per mermaid code block.
If you need multiple diagrams, use multiple separate mermaid code blocks rather than stacking them in a single block:

For FLOWCHARTS (build process, decision trees):
\`\`\`mermaid
flowchart TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
\`\`\`

For SEQUENCE DIAGRAMS (signal flow, timing):
\`\`\`mermaid
sequenceDiagram
    Controller->>Motor: PWM Signal
    Motor->>ESC: Speed Command
    ESC-->>Controller: Feedback
\`\`\`

For BLOCK DIAGRAMS (system architecture):
\`\`\`mermaid
block-beta
    columns 3
    A["Power Supply"] B["Controller"] C["Motors"]
\`\`\`

For STATE DIAGRAMS (operational modes):
\`\`\`mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Running: Start
    Running --> Idle: Stop
\`\`\`

📈 DATA EXTRACTION:
If the project involves multiple components with weights, power consumption, or cost breakdown, you MUST append a raw JSON block at the very end of your response, wrapped in triple backticks and labelled 'json'. This JSON will be used to render telemetry charts.

You can include MULTIPLE data visualizations by providing an array:
\`\`\`json
{
  "metrics": [
    {
      "title": "Weight Distribution",
      "type": "pie",
      "unit": "g",
      "data": [
        {"name": "Frame", "value": 150},
        {"name": "Motors", "value": 200}
      ]
    },
    {
      "title": "Power Budget",
      "type": "bar", 
      "unit": "W",
      "data": [
        {"name": "Motors", "value": 120},
        {"name": "Controller", "value": 15}
      ]
    }
  ],
  "summary": {
    "totalWeight": "450g",
    "totalPower": "135W",
    "estimatedCost": "$250",
    "complexity": "Intermediate"
  }
}
\`\`\`

For simpler single-chart responses, you can still use the original format:
\`\`\`json
{
  "title": "Component Analysis",
  "type": "pie",
  "unit": "g",
  "data": [...]
}
\`\`\`
Only output this JSON if you have enough data to estimate a breakdown.
`;

class GeminiService {
  private ai: GoogleGenAI;
  private chatSession: Chat | null = null;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  public async startChat(): Promise<void> {
    this.chatSession = this.ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.2, // Low temperature for precise engineering responses
        maxOutputTokens: 8192,
      },
    });
  }

  // Clear the chat session to start fresh
  public clearSession(): void {
    this.chatSession = null;
  }

  /**
   * Heal a broken Mermaid diagram by asking the AI to fix syntax errors.
   * Returns the corrected Mermaid code or null if unable to fix.
   * Uses gemini-2.5-pro for better syntax understanding.
   */
  public async healDiagram(brokenCode: string, errorMessage?: string): Promise<string | null> {
    const healPrompt = `You are a Mermaid.js v11 syntax expert. Fix this broken diagram.

ERROR: ${errorMessage || 'Syntax error in text'}

BROKEN CODE:
${brokenCode}

CRITICAL MERMAID SYNTAX RULES:
1. Arrows and nodes MUST be on the SAME line: "A --> B" NOT "A -->\\nB"
2. Complete statements: "A[User] --> B[Input]" is ONE line
3. Node IDs must be simple alphanumeric: A, B1, nodeOne (NO spaces)
4. Labels with special chars need quotes: A["Label (with parens)"]
5. Arrow syntax: --> for arrows (NOT -- or -> alone)
6. NO line breaks in the middle of connections
7. For labels with spaces/special chars: A["My Label"] --> B["Next Step"]
8. Parentheses in labels require square brackets: A["Input (PWM)"] NOT A(Input (PWM))

VALID EXAMPLES:
✓ flowchart TD
✓     A[User] --> B[Input]
✓     B --> C[Process]
✓     C --> D[Output]

INVALID EXAMPLES (DO NOT DO THIS):
✗ flowchart TD
✗     A[User] -->
✗     B[Input]
✗     B -->
✗     C[Process]

FIX STRATEGY:
1. Ensure flowchart/graph declaration is on first line
2. Put complete connections on single lines: "A --> B" or "A[Label] --> B[Label]"
3. Add proper indentation (4 spaces)
4. Fix any unquoted labels with special characters
5. Ensure all brackets are balanced

Return ONLY the corrected Mermaid code. No explanations. No markdown fences. No extra text.`;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-pro', // Use Pro for better syntax understanding
        contents: healPrompt,
        config: {
          temperature: 0.02, // Extremely low for precise syntax fixing
          maxOutputTokens: 4096,
        }
      });

      let fixedCode = response.text?.trim() || null;
      
      if (fixedCode) {
        // Clean up any accidental markdown fences or explanations
        fixedCode = fixedCode
          .replace(/^```mermaid\s*/im, '')
          .replace(/^```\w*\s*/im, '')
          .replace(/```\s*$/im, '')
          .replace(/^Here.*?:\s*/im, '')
          .replace(/^Fixed.*?:\s*/im, '')
          .replace(/^Corrected.*?:\s*/im, '')
          .trim();
        
        // Basic validation: check for split arrows (arrows on separate lines)
        const lines = fixedCode.split('\n');
        let hasSplitArrows = false;
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          // Check if line ends with arrow but no destination
          if (line.match(/(-->|->|==+>|\.\.+>)\s*$/)) {
            console.warn(`Healed code has split arrow on line ${i + 1}: "${line}"`);
            hasSplitArrows = true;
          }
        }
        
        if (hasSplitArrows) {
          console.warn('Healed code still has split arrows - attempting auto-fix');
          // Try to fix split arrows automatically
          const fixed = fixedCode.replace(/(\w+(?:\[[^\]]+\])?)\s*(-->|->|==+>|\.\.+>)\s*\n\s*(\w+)/g, '$1 $2 $3');
          fixedCode = fixed;
        }
        
        // Validate it starts with a valid diagram type
        const validStarts = ['flowchart', 'graph', 'sequencediagram', 'statediagram', 'classdiagram', 'erdiagram', 'gantt', 'pie', 'block-beta'];
        const startsValid = validStarts.some(s => fixedCode!.toLowerCase().startsWith(s));
        
        if (startsValid) {
          console.log('Diagram healed successfully');
          return fixedCode;
        } else {
          console.warn('Healed code does not start with valid diagram type');
          return null;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Failed to heal diagram:', error);
      return null;
    }
  }

  /**
   * Heal multiple diagrams in parallel batches
   */
  public async healDiagramsBatch(
    diagrams: Array<{ id: string; code: string; error?: string }>
  ): Promise<Map<string, string | null>> {
    const results = new Map<string, string | null>();
    
    // Process in parallel batches of 3 to avoid rate limiting
    const batchSize = 3;
    for (let i = 0; i < diagrams.length; i += batchSize) {
      const batch = diagrams.slice(i, i + batchSize);
      const promises = batch.map(async (d) => {
        const healed = await this.healDiagram(d.code, d.error);
        return { id: d.id, healed };
      });
      
      const batchResults = await Promise.all(promises);
      batchResults.forEach(({ id, healed }) => {
        results.set(id, healed);
      });
    }
    
    return results;
  }

  public async sendMessageStream(
    message: string,
    onChunk: (text: string) => void
  ): Promise<SystemMetrics | null> {
    if (!this.chatSession) {
      await this.startChat();
    }

    if (!this.chatSession) {
      throw new Error("Failed to initialize chat session");
    }

    let fullText = "";
    let extractedMetrics: SystemMetrics | null = null;

    try {
      const resultStream = await this.chatSession.sendMessageStream({ message });

      for await (const chunk of resultStream) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
            fullText += c.text;
            onChunk(c.text);
        }
      }

      // Attempt to parse JSON chart data from the end of the response
      // Use a more robust pattern that handles nested braces
      const jsonBlockMatch = fullText.match(/```json\s*([\s\S]*?)```/);
      if (jsonBlockMatch && jsonBlockMatch[1]) {
        const jsonContent = jsonBlockMatch[1].trim();
        try {
          const parsed = JSON.parse(jsonContent);
          
          // Handle new extended format with metrics array
          if (parsed.metrics && Array.isArray(parsed.metrics)) {
            extractedMetrics = {
              ...parsed.metrics[0], // Primary chart
              allMetrics: parsed.metrics,
              summary: parsed.summary || null
            } as SystemMetrics;
            console.log("Extended telemetry data extracted:", parsed.metrics.length, "charts");
          }
          // Handle original single-chart format
          else if (parsed.data && Array.isArray(parsed.data)) {
            extractedMetrics = parsed as SystemMetrics;
            console.log("Telemetry data extracted:", parsed.title);
          }
        } catch (e) {
          console.warn("Failed to parse chart data JSON:", e);
          console.warn("JSON content was:", jsonContent.substring(0, 200));
        }
      }
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }

    return extractedMetrics;
  }
}

export const geminiService = new GeminiService();
