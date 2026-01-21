
/**
 * File: core/services/geminiService.ts
 * Version: 1.2.0
 * Author: Aura Flux Team
 * Copyright (c) 2024 Aura Flux. All rights reserved.
 */

import { GoogleGenAI, Type } from "@google/genai";
import { GEMINI_MODEL, REGION_NAMES } from '../constants';
import { SongInfo, Language, Region } from '../types';
import { generateFingerprint, saveToLocalCache, findLocalMatch } from './fingerprintService';

const REQUEST_TIMEOUT_MS = 25000;

// Provider Persona Definitions
// Since we only have a Gemini API Key, we use Gemini's advanced instruction following 
// to mimic the analytical style and personality of other models.
const PROVIDER_PROFILES: Record<string, string> = {
    GEMINI: "Role: Google Gemini. Style: Balanced, helpful, and precise. Focus on accurate metadata and broad emotional context.",
    
    GROK: "Role: Grok (xAI). Style: Witty, rebellious, slightly edgy, and fun. Use informal language. In the 'mood' field, use creative or slang terms. If you don't know the song, roast the audio quality slightly.",
    
    CLAUDE: "Role: Claude (Anthropic). Style: Academic, poetic, and nuanced. Focus on music theory, instrumentation texture, and emotional depth. Descriptions should be articulate and sophisticated.",
    
    OPENAI: "Role: GPT-4. Style: Professional, concise, encyclopedic, and neutral. Focus on factual accuracy, genre classification, and release history.",
    
    DEEPSEEK: "Role: DeepSeek (Coder/Tech). Style: Highly analytical, technical, and precise. Focus on production quality, frequency spectrum analysis, mixing techniques, and synthesis types.",
    
    QWEN: "Role: Qwen (Alibaba). Style: Polite, cross-cultural, and detailed. Pay extra attention to melody, lyrical context, and Asian music markets if applicable."
};

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

  // 2. Real AI Mode (Gemini Backend for All Personas)
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
        // Preserve the requested provider in the match source so UI stays consistent
        return { ...localMatch, matchSource: provider };
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

        // Select persona profile
        const personaInstruction = PROVIDER_PROFILES[provider] || PROVIDER_PROFILES['GEMINI'];

        const systemInstruction = `
          You are the "Aura Flux Synesthesia Engine".
          ${personaInstruction}
          
          Your task: Analyze the audio snapshot (approx 6s) to identify music or describe the soundscape.
          
          CONTEXT: User Market: ${regionName}. Language: ${targetLang}.
          
          INSTRUCTIONS:
          1. IDENTIFICATION: Try to match the song. If matched, set "identified": true.
          2. FALLBACK: If NO specific song is recognized (or it's just noise/speech), set "identified": false.
             - In this case, populate "title" with a creative short description of the sound (e.g., "Ethereal Pad Swell", "Distorted Bass Kick").
             - Populate "artist" with the genre or sound category (e.g., "Ambient", "Techno").
          3. TRANSLATION: Translate "mood" and "lyricsSnippet" (or sound description) to ${targetLang}.
          4. FORMAT: Return strict JSON only. No markdown code blocks.
        `;

        const generatePromise = aiClient.models.generateContent({
          model: GEMINI_MODEL,
          contents: { 
            parts: [
              { inlineData: { mimeType: mimeType, data: base64Audio } }, 
              { text: `Analyze audio. Return JSON.` }
            ] 
          },
          config: { 
            tools: [{ googleSearch: {} }], 
            systemInstruction: systemInstruction,
            temperature: 0.45, // Slightly higher to allow personality to shine
            topP: 0.95,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "Track title OR creative sound description." },
                artist: { type: Type.STRING, description: "Artist name OR genre category." },
                lyricsSnippet: { type: Type.STRING, description: "Key lyrics OR a description of the sound texture in the persona's style." },
                mood: { type: Type.STRING, description: "2-3 word aesthetic mood matching the persona's style." },
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

        // Robustness: Clean Markdown code blocks if present
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
        
        // Critical: Set the match source to the requested provider so the UI reflects the persona
        songInfo.matchSource = provider;
        
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
  // Note: We don't cache the persona-specific description, only the raw song match
  if (aiResult && aiResult.identified && features.length > 0) {
      saveToLocalCache(features, aiResult);
  }
  
  return aiResult;
};
