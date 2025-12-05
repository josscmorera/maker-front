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

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE COMPLETENESS DETECTION
// ─────────────────────────────────────────────────────────────────────────────

interface CompletenessCheck {
  isComplete: boolean;
  reason: string;
  missingIndicators: string[];
  lastContent: string; // Last ~200 chars for context
}

/**
 * Analyze if a response appears to be complete or was cut off
 */
function checkResponseCompleteness(text: string): CompletenessCheck {
  const trimmedText = text.trim();
  const lastContent = trimmedText.slice(-200);
  const missingIndicators: string[] = [];
  
  // Minimum viable response length (a real engineering response should be substantial)
  if (trimmedText.length < 500) {
    return {
      isComplete: false,
      reason: 'Response too short for engineering analysis',
      missingIndicators: ['insufficient_length'],
      lastContent
    };
  }
  
  // Check for incomplete code blocks (opened but not closed)
  const codeBlockStarts = (trimmedText.match(/```/g) || []).length;
  if (codeBlockStarts % 2 !== 0) {
    missingIndicators.push('unclosed_code_block');
  }
  
  // Check for incomplete tables (started table but unfinished)
  const tableRows = trimmedText.match(/^\|.*\|$/gm) || [];
  if (tableRows.length > 0) {
    const lastTableRow = tableRows[tableRows.length - 1];
    // Check if table might be incomplete (missing closing row or columns inconsistent)
    if (lastTableRow && lastTableRow.split('|').length < 3) {
      missingIndicators.push('incomplete_table');
    }
  }
  
  // Check for incomplete lists (ends with a list item marker)
  if (/[-*•]\s*$/.test(trimmedText) || /^\d+\.\s*$/m.test(trimmedText.slice(-50))) {
    missingIndicators.push('incomplete_list');
  }
  
  // Check for incomplete sentences (ends mid-word or with common incomplete patterns)
  const endsWithIncomplete = /[\w,;:\-–—]\s*$/i.test(trimmedText) && 
                             !/[.!?)"'\]}\n]\s*$/i.test(trimmedText);
  if (endsWithIncomplete) {
    missingIndicators.push('mid_sentence_cutoff');
  }
  
  // Check for "to be continued" patterns
  const continuePatterns = [
    /\bwill\s+(?:be|need|require)\s*$/i,
    /\bincluding\s*$/i,
    /\bsuch\s+as\s*$/i,
    /\bfor\s+example\s*$/i,
    /\bthe\s+following\s*$/i,
    /:\s*$/,
    /\bsteps?\s*:\s*$/i,
    /\bcomponents?\s*:\s*$/i,
  ];
  
  for (const pattern of continuePatterns) {
    if (pattern.test(trimmedText.slice(-100))) {
      missingIndicators.push('trailing_continuation_pattern');
      break;
    }
  }
  
  // Check for expected engineering sections (at least 3 of 5 expected)
  const sectionPatterns = [
    /project\s*understanding/i,
    /engineering\s*decomposition/i,
    /calculations?|technical\s*logic/i,
    /build\s*blueprint|bill\s*of\s*materials|bom/i,
    /testing|failure\s*analysis/i
  ];
  
  const foundSections = sectionPatterns.filter(p => p.test(trimmedText)).length;
  // Only flag if it looks like an engineering response but missing sections
  const looksLikeEngineeringResponse = /^\d+\.\s/m.test(trimmedText) || 
                                       sectionPatterns.some(p => p.test(trimmedText));
  
  if (looksLikeEngineeringResponse && foundSections < 3) {
    missingIndicators.push('missing_engineering_sections');
  }
  
  // Check for incomplete JSON block at end
  const lastJsonBlockStart = trimmedText.lastIndexOf('```json');
  if (lastJsonBlockStart !== -1) {
    const afterJson = trimmedText.slice(lastJsonBlockStart);
    const hasClosingFence = afterJson.includes('```', 7);
    if (!hasClosingFence) {
      missingIndicators.push('unclosed_json_block');
    }
  }
  
  // Determine overall completeness
  const isComplete = missingIndicators.length === 0;
  
  return {
    isComplete,
    reason: isComplete 
      ? 'Response appears complete' 
      : `Potential issues: ${missingIndicators.join(', ')}`,
    missingIndicators,
    lastContent
  };
}

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
   * Verify if a response is complete and request continuation if needed.
   * Uses a separate one-shot call to avoid polluting the chat history.
   */
  public async verifyAndCompleteResponse(
    originalPrompt: string,
    currentResponse: string,
    completenessCheck: CompletenessCheck,
    onChunk?: (text: string) => void
  ): Promise<{ continuation: string; wasIncomplete: boolean }> {
    
    // If already complete, return early
    if (completenessCheck.isComplete) {
      return { continuation: '', wasIncomplete: false };
    }

    console.log('🔧 Response appears incomplete:', completenessCheck.reason);
    console.log('📝 Missing indicators:', completenessCheck.missingIndicators);

    const continuationPrompt = `You are continuing an incomplete AI response. The previous response was cut off.

ORIGINAL USER REQUEST:
${originalPrompt}

PREVIOUS RESPONSE (truncated, showing last part):
...${completenessCheck.lastContent}

DETECTED ISSUES:
${completenessCheck.missingIndicators.map(i => `- ${i.replace(/_/g, ' ')}`).join('\n')}

INSTRUCTIONS:
1. Continue EXACTLY from where the response was cut off.
2. Do NOT repeat any content that was already written.
3. Complete any unfinished sections, tables, code blocks, or sentences.
4. If sections are missing (like Testing & Failure Analysis), add them.
5. Make sure to close any open code blocks with \`\`\`.
6. If a JSON metrics block was expected but missing, include it.
7. Write as if you're seamlessly continuing the previous text.

CONTINUE THE RESPONSE:`;

    try {
      let continuation = '';
      
      // Use streaming for continuation too
      const response = await this.ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: continuationPrompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.2,
          maxOutputTokens: 4096, // Smaller limit for continuation
        }
      });

      for await (const chunk of response) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
          continuation += c.text;
          onChunk?.(c.text);
        }
      }

      console.log('✅ Response continuation complete, added', continuation.length, 'chars');
      return { continuation, wasIncomplete: true };
      
    } catch (error) {
      console.error('❌ Failed to complete response:', error);
      return { continuation: '', wasIncomplete: true };
    }
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
    onChunk: (text: string) => void,
    options?: {
      autoComplete?: boolean; // Enable auto-completion for incomplete responses
      maxCompletionAttempts?: number;
    }
  ): Promise<SystemMetrics | null> {
    const { autoComplete = true, maxCompletionAttempts = 2 } = options || {};
    
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

      // ─────────────────────────────────────────────────────────────────────
      // AUTO-COMPLETION: Verify response completeness and continue if needed
      // ─────────────────────────────────────────────────────────────────────
      if (autoComplete && fullText.length > 0) {
        let completionAttempts = 0;
        let currentText = fullText;
        
        while (completionAttempts < maxCompletionAttempts) {
          const completenessCheck = checkResponseCompleteness(currentText);
          
          if (completenessCheck.isComplete) {
            console.log('✅ Response verified complete');
            break;
          }
          
          completionAttempts++;
          console.log(`🔄 Attempting response completion (attempt ${completionAttempts}/${maxCompletionAttempts})`);
          
          // Add a visual separator before continuation
          const separator = '\n\n'; // Simple continuation
          onChunk(separator);
          fullText += separator;
          
          const { continuation, wasIncomplete } = await this.verifyAndCompleteResponse(
            message,
            currentText,
            completenessCheck,
            onChunk
          );
          
          if (continuation) {
            fullText += continuation;
            currentText = fullText;
          } else {
            // No continuation received, break to avoid infinite loop
            break;
          }
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

  /**
   * Check if a response is complete (exposed for external use)
   */
  public checkCompleteness(text: string): CompletenessCheck {
    return checkResponseCompleteness(text);
  }
}

export const geminiService = new GeminiService();
