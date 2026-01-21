/**
 * File: core/services/geminiService.ts
 * Version: 1.3.0
 * Author: Aura Flux Team
 * Copyright (c) 2024 Aura Flux. All rights reserved.
 * Updated: 2025-02-19 12:00
 */

import { GoogleGenAI, Type } from "@google/genai";
import { GEMINI_MODEL, REGION_NAMES } from '../constants';
import { SongInfo, Language, Region } from '../types';
import { generateFingerprint, saveToLocalCache, findLocalMatch } from './fingerprintService';

// Increased timeout to 30s as requested
const REQUEST_TIMEOUT_MS = 30000;

// Provider Persona Definitions with enhanced descriptors
const PROVIDER_PROFILES: Record<string, string> = {
    GEMINI: "Role: Google Gemini. Style: Balanced, high-fidelity analysis. Focus on accurate metadata and holistic emotional context.",
    
    GROK: "Role: Grok (xAI). Style: Witty, rebellious, and raw. Use punchy, creative language. In the 'mood' field, feel free to use unconventional or high-energy descriptors. If the track is unknown, describe its 'vibe' with an edgy twist.",
    
    CLAUDE: "Role: Claude (Anthropic). Style: Sophisticated, poetic, and musicological. Focus on texture, harmonic depth, and the 'soul' of the sound. Use elegant and descriptive terminology.",
    
    OPENAI: "Role: GPT-4o. Style: Encyclopedic, precise, and professional. Prioritize technical genre accuracy and historical context.",
    
    DEEPSEEK: "Role: DeepSeek. Style: Technical and efficient. Focus on production quality, transient response, and spectral density. Describe sounds through a 'producer's lens'.",
    
    QWEN: "Role: Qwen. Style: Culturally aware and detailed. Excellent at recognizing Eastern and global pop nuances. Provide balanced, context-rich descriptions."
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
      await new Promise(resolve => setTimeout(resolve, 1200));
      return { 
          title: "Echoes of Eternity", 
          artist: "Aura Synth", 
          lyricsSnippet: "Floating in a digital dream...\nNeon lights across the stream.", 
          mood: "Hypnotic / Cyber", 
          identified: true, 
          matchSource: 'MOCK', 
          searchUrl: 'https://google.com' 
      };
  }

  // 2. Client Initialization
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey.trim() === '') {
      console.warn("[AI] API Key missing.");
      return null;
  }

  let aiClient: GoogleGenAI;
  try {
      aiClient = new GoogleGenAI({ apiKey });
  } catch (error) {
      console.error("[AI] Initialization Error:", error);
      return null;
  }

  // 3. Local Fingerprint Pre-check
  let features: number[] = [];
  try {
    features = await generateFingerprint(base64Audio);
    const localMatch = findLocalMatch(features);
    if (localMatch) {
        return { ...localMatch, matchSource: provider };
    }
  } catch (e) {
    console.debug("[AI] Fingerprint skipped.");
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
        const personaInstruction = PROVIDER_PROFILES[provider] || PROVIDER_PROFILES['GEMINI'];

        const systemInstruction = `
          You are the "Aura Flux Synesthesia Intelligence".
          ${personaInstruction}
          
          TASK: Analyze the 6-second audio snapshot provided. Identify commercial tracks OR provide a poetic synesthetic description of the soundscape.
          
          SPECIFIC RULES:
          1. Commercial Match: If identified, set "identified": true and provide exact metadata.
          2. Generative Description: If NO song is identified (identified: false), fill "title" and "artist" with a creative, evocative description of the audio texture (e.g., Title: "Velvet Static", Artist: "Lofi Ambient").
          3. Mood & Lyrics: Always translate the "mood" and "lyricsSnippet" into ${targetLang}. Use 2-3 words for mood. 
          4. Style: If using non-Gemini persona, mirror their characteristic speech patterns.
          5. Response Format: Return RAW JSON only.
        `;

        const generatePromise = aiClient.models.generateContent({
          model: GEMINI_MODEL,
          contents: { 
            parts: [
              { inlineData: { mimeType: mimeType, data: base64Audio } }, 
              { text: `Identify audio. Region: ${regionName}. Output Language: ${targetLang}.` }
            ] 
          },
          config: { 
            tools: [{ googleSearch: {} }], 
            systemInstruction: systemInstruction,
            temperature: 0.7, // Increased to 0.7 for richer, more creative responses
            topP: 0.95,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "Track title or poetic audio description." },
                artist: { type: Type.STRING, description: "Artist name or audio category/genre." },
                lyricsSnippet: { type: Type.STRING, description: "Key lyrics or sensory description of the audio's texture." },
                mood: { type: Type.STRING, description: "2-3 word aesthetic mood summary." },
                identified: { type: Type.BOOLEAN, description: "True if it is a known commercial track." },
              },
              required: ['title', 'artist', 'mood', 'identified']
            }
          }
        });

        // Hard timeout at 30s
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("AI_TIMEOUT")), REQUEST_TIMEOUT_MS)
        );

        const response: any = await Promise.race([generatePromise, timeoutPromise]);
        
        const rawText = response.text;
        if (!rawText) throw new Error("Null response");

        // Clean potentially wrapped JSON
        const cleanedJson = rawText.replace(/^```json\s*/, "").replace(/\s*```$/, "").trim();
        let songInfo: SongInfo = JSON.parse(cleanedJson);

        // Grounding Metadata Check
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (groundingChunks && Array.isArray(groundingChunks)) {
          const webSource = groundingChunks.find((chunk: any) => chunk.web?.uri);
          if (webSource?.web?.uri) {
            songInfo.searchUrl = webSource.web.uri;
          }
        }
        
        songInfo.matchSource = provider;
        return songInfo;

    } catch (error: any) {
        console.error(`[AI] Identification failed (Try ${retryCount}):`, error.message);
        if (error.message === "AI_TIMEOUT") return null;
        if (retryCount < 1) return callGemini(retryCount + 1);
        return null;
    }
  };

  const aiResult = await callGemini();
  
  // Cache successful identifications
  if (aiResult && aiResult.identified && features.length > 0) {
      saveToLocalCache(features, aiResult);
  }
  
  return aiResult;
};