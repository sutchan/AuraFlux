
/**
 * File: core/services/geminiService.ts
 * Version: 1.1.0
 * Author: Aura Flux Team
 * Copyright (c) 2024 Aura Flux. All rights reserved.
 */

import { GoogleGenAI, Type } from "@google/genai";
import { GEMINI_MODEL, REGION_NAMES } from '../constants';
import { SongInfo, Language, Region } from '../types';
import { generateFingerprint, saveToLocalCache, findLocalMatch } from './fingerprintService';

const REQUEST_TIMEOUT_MS = 25000; // Increased to 25s for better stability

export const identifySongFromAudio = async (
  base64Audio: string, 
  mimeType: string, 
  language: Language = 'en', 
  region: Region = 'global',
  provider: 'GEMINI' | 'MOCK' | 'OPENAI' | 'CLAUDE' | 'GROK' | 'DEEPSEEK' | 'QWEN' = 'GEMINI'
): Promise<SongInfo | null> => {
  // 1. Mock Mode (Demo)
  if (provider === 'MOCK') {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { 
          title: "Midnight City", 
          artist: "M83", 
          lyricsSnippet: "Waiting in the car...\nWaiting for a ride in the dark...", 
          mood: "Electric / Midnight", 
          identified: true, 
          matchSource: 'MOCK', 
          searchUrl: 'https://google.com' 
      };
  }

  // 2. Real AI Mode (Gemini Powered)
  // NOTE: Currently, this app relies solely on the Google GenAI SDK.
  // Selections for other providers (OpenAI, etc.) serve as UI placeholders 
  // or "Persona" modifiers in this version, gracefully falling back to Gemini
  // to ensure functionality is always available.

  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey.trim() === '') {
      console.warn("[AI] API Key is missing. Identification disabled.");
      return null;
  }

  let aiClient: GoogleGenAI;
  try {
      aiClient = new GoogleGenAI({ apiKey });
  } catch (error) {
      console.error("[AI] Client Init Failed:", error);
      return null;
  }

  // 3. Local Fingerprint Check (Optimization)
  let features: number[] = [];
  try {
    features = await generateFingerprint(base64Audio);
    const localMatch = findLocalMatch(features);
    if (localMatch) {
        console.debug("[AI] Local cache hit:", localMatch.title);
        return localMatch;
    }
  } catch (e) {
    console.warn("[AI] Fingerprinting skipped:", e);
  }

  const callGemini = async (retryCount = 0): Promise<SongInfo | null> => {
    try {
        const regionName = region === 'global' ? 'Global' : (REGION_NAMES[region] || region);
        const langMap: Record<string, string> = {
            en: 'English', zh: 'Simplified Chinese', tw: 'Traditional Chinese', 
            ja: 'Japanese', es: 'Spanish', ko: 'Korean', de: 'German', 
            fr: 'French', ru: 'Russian', ar: 'Arabic'
        };
        const targetLang = langMap[language] || 'English';

        // Dynamic persona based on "provider" selection to simulate different AI flavors
        let personaContext = "";
        if (provider === 'GROK') personaContext = "Style: Witty, edgy, and rebellious. ";
        if (provider === 'CLAUDE') personaContext = "Style: Academic, precise, and articulate. ";
        if (provider === 'DEEPSEEK') personaContext = "Style: Analytical, concise, and technical. ";

        const systemInstruction = `
          You are the "Aura Flux Synesthesia Engine". ${personaContext}
          Your task: Analyze the audio snapshot (approx 6s) to identify music or describe the soundscape.
          
          CONTEXT: User Market: ${regionName}. Language: ${targetLang}.
          
          INSTRUCTIONS:
          1. IDENTIFICATION: Try to match the song. If matched, set "identified": true.
          2. FALLBACK: If NO specific song is recognized (or it's just noise/speech), set "identified": false, BUT YOU MUST still populate "title" (as a short description of the sound, e.g., "Ambient Noise", "Piano Improv") and "mood".
          3. TRANSLATION: Translate "mood" and "lyricsSnippet" (or sound description) to ${targetLang}.
          4. FORMAT: Return strict JSON.
        `;

        const generatePromise = aiClient.models.generateContent({
          model: GEMINI_MODEL,
          contents: { 
            parts: [
              { inlineData: { mimeType: mimeType, data: base64Audio } }, 
              { text: `Analyze audio. Identify track or describe sound. Return JSON.` }
            ] 
          },
          config: { 
            tools: [{ googleSearch: {} }], 
            systemInstruction: systemInstruction,
            temperature: 0.4, // Increased slightly to allow for creative descriptions when identification fails
            topP: 0.9,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "Track title OR short description of sound (e.g. 'City Traffic', 'Unknown Techno')." },
                artist: { type: Type.STRING, description: "Artist name OR category (e.g. 'Environmental', 'Generative')." },
                lyricsSnippet: { type: Type.STRING, description: "Key lyrics OR a poetic description of the sound texture." },
                mood: { type: Type.STRING, description: "2-3 word aesthetic mood." },
                identified: { type: Type.BOOLEAN, description: "True if a specific commercial track was positively matched." },
              },
              required: ['title', 'artist', 'mood', 'identified']
            }
          }
        });

        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("AI_TIMEOUT")), REQUEST_TIMEOUT_MS)
        );

        const response: any = await Promise.race([generatePromise, timeoutPromise]);
        
        let text = response.text;
        if (!text) throw new Error("Empty response from AI");

        // Robustness: Clean Markdown code blocks if present (though responseMimeType usually handles this)
        text = text.replace(/^```json\s*/, "").replace(/\s*```$/, "");

        let songInfo: SongInfo = JSON.parse(text);

        // Grounding Check
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (groundingChunks && Array.isArray(groundingChunks)) {
          const webSource = groundingChunks.find((chunk: any) => chunk.web?.uri);
          if (webSource?.web?.uri) {
            songInfo.searchUrl = webSource.web.uri;
          }
        }
        
        songInfo.matchSource = 'AI';
        
        // Critical Fix: Return result even if not "identified", so the UI shows the "Mood/Description"
        return songInfo;

    } catch (error: any) {
        const errorMsg = error.message || error.toString();
        console.warn(`[AI] Attempt ${retryCount + 1} failed:`, errorMsg);
        
        if (errorMsg === "AI_TIMEOUT" || errorMsg.includes("API key")) return null;
        
        if (retryCount < 1) return callGemini(retryCount + 1);
        return null;
    }
  };

  const aiResult = await callGemini();
  
  // Only cache if we actually found a specific song
  if (aiResult && aiResult.identified && features.length > 0) {
      saveToLocalCache(features, aiResult);
  }
  
  return aiResult;
};
