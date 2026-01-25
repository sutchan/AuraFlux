/**
 * File: core/services/geminiService.ts
 * Version: 1.7.32
 * Author: Aura Flux Team
 * Copyright (c) 2024 Aura Flux. All rights reserved.
 * Updated: 2025-03-05 12:00
 */

import { GoogleGenAI, Type } from "@google/genai";
import { GEMINI_MODEL, REGION_NAMES } from '../constants';
import { SongInfo, Language, Region } from '../types';
import { generateFingerprint, saveToLocalCache, findLocalMatch } from './fingerprintService';

// Increased timeout to 30s as requested for robust processing
const REQUEST_TIMEOUT_MS = 30000;

// Provider Persona Definitions with enhanced descriptors
const PROVIDER_PROFILES: Record<string, string> = {
    GEMINI: "Role: Google Gemini. Style: Balanced, high-fidelity analysis. Focus on accurate metadata and holistic emotional context.",
    
    GROQ: "Role: Grok (xAI). Style: Witty, rebellious, and raw. Use punchy, creative language. In the 'mood' field, feel free to use unconventional or high-energy descriptors. If the track is unknown, describe its 'vibe' with an edgy twist.",
    
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
  provider: 'GEMINI' | 'MOCK' | 'OPENAI' | 'CLAUDE' | 'GROQ' | 'DEEPSEEK' | 'QWEN' = 'GEMINI'
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

  // 2. Client Initialization with Robust Check
  // Ensure process.env.API_KEY is actually populated at build time or runtime
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey.length < 10 || apiKey.includes('YOUR_API_KEY')) {
      console.warn("[AI] Invalid or missing API Key. Falling back to Mock data.");
      return {
          title: "API Config Missing",
          artist: "System Alert",
          lyricsSnippet: "Please configure your Google Gemini API Key in the environment variables to enable real AI recognition.",
          mood: "Configuration Required",
          identified: false,
          matchSource: 'MOCK'
      };
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

        // Updated Instruction v1.3.1: Encouraging richer mood analysis and genre hints
        const systemInstruction = `
          You are the "Aura Flux Synesthesia Intelligence".
          ${personaInstruction}
          
          TASK: Analyze the 6-second audio snapshot provided. Identify commercial tracks OR provide a poetic synesthetic description of the soundscape.
          
          SPECIFIC RULES:
          1. Commercial Match: If identified, set "identified": true and provide exact metadata.
          2. Generative Description: If NO song is identified (identified: false), fill "title" and "artist" with a creative, evocative description of the audio texture (e.g., Title: "Velvet Static", Artist: "Lofi Ambient").
          3. Mood & Lyrics: Always translate the "mood" and "lyricsSnippet" into ${targetLang}.
             - MOOD: Provide a vivid 3-5 word summary combining emotion and genre (e.g., "Melancholic Cyberpunk Rain", "High-Energy Industrial Techno", "Warm Acoustic Nostalgia"). Avoid generic single words.
             - LYRICS/TEXTURE: If lyrics are audible, quote the key lines. If instrumental or unclear, describe the visual texture, lyrical themes, or specific genre elements (e.g., "Distorted basslines with ethereal pads", "Upbeat funky guitar riffs").
          4. Style: If using non-Gemini persona, mirror their characteristic speech patterns.
          5. Response Format: Return RAW JSON only.
        `;

        const generatePromise = aiClient.models.generateContent({
          model: GEMINI_MODEL,
          contents: { 
            parts: [
              { inlineData: { mimeType: mimeType, data: base64Audio } }, 
              { text: `Identify audio. Region: ${regionName}. Output Language: ${targetLang}. Include genre hints in mood.` }
            ] 
          },
          config: { 
            tools: [{ googleSearch: {} }], 
            systemInstruction: systemInstruction,
            temperature: 0.7, // Optimized for creative interpretation
            topP: 0.95,
            topK: 40, // Added topK for diverse vocabulary in descriptions
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "Track title or poetic audio description." },
                artist: { type: Type.STRING, description: "Artist name or audio category/genre." },
                lyricsSnippet: { type: Type.STRING, description: "Key lyrics, lyrical themes, or sensory description of the music's texture." },
                mood: { type: Type.STRING, description: "Descriptive aesthetic mood summary (3-5 words) including genre hints." },
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