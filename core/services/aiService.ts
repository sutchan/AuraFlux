/**
 * File: core/services/aiService.ts
 * Version: 3.0.0
 * Author: Aura Flux Team
 * Copyright (c) 2025 Aura Flux. All rights reserved.
 * Updated: 2025-03-05 12:00
 * Description: Merged superior logic from geminiService.ts, adding provider personas,
 * detailed prompts, and robust error handling. This resolves redundancy and fixes bugs
 * related to unhandled AI providers.
 */

import { GoogleGenAI, Type } from "@google/genai";
import { GEMINI_MODEL, REGION_NAMES } from '../constants';
import { SongInfo, Language, Region, AIProvider } from '../types';
import { generateFingerprint, saveToLocalCache, findLocalMatch } from './fingerprintService';

const REQUEST_TIMEOUT_MS = 30000;

// Merged from geminiService.ts for richer AI interactions
const PROVIDER_PROFILES: Record<string, string> = {
    GEMINI: "Role: Google Gemini. Style: Balanced, high-fidelity analysis. Focus on accurate metadata and holistic emotional context.",
    GROQ: "Role: Grok (xAI). Style: Witty, rebellious, and raw. Use punchy, creative language. In the 'mood' field, feel free to use unconventional or high-energy descriptors. If the track is unknown, describe its 'vibe' with an edgy twist.",
    OPENAI: "Role: GPT-4o. Style: Encyclopedic, precise, and professional. Prioritize technical genre accuracy and historical context.",
};

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Track title or poetic audio description." },
    artist: { type: Type.STRING, description: "Artist name or audio category/genre." },
    lyricsSnippet: { type: Type.STRING, description: "Key lyrics, lyrical themes, or sensory description of the music's texture." },
    mood: { type: Type.STRING, description: "Descriptive aesthetic mood summary (3-5 words) including genre hints." },
    identified: { type: Type.BOOLEAN, description: "True if it is a known commercial track." },
  },
  required: ['title', 'artist', 'mood', 'identified']
};

export const validateApiKey = async (provider: AIProvider, key: string): Promise<boolean> => {
    if (!key || key.length < 5) return false;
    try {
        if (provider === 'GEMINI') {
            const client = new GoogleGenAI({ apiKey: key });
            await client.models.generateContent({ model: GEMINI_MODEL, contents: 'ping' });
            return true;
        }
        // Basic validation for other providers for now.
        return true; 
    } catch (e) {
        return false;
    }
};

export const identifySongFromAudio = async (
  base64Audio: string, 
  mimeType: string, 
  language: Language = 'en', 
  region: Region = 'global',
  provider: AIProvider = 'GEMINI',
  customKey?: string
): Promise<SongInfo | null> => {
  if (provider === 'MOCK') {
      await new Promise(r => setTimeout(r, 1000));
      return { title: "Echoes of Eternity", artist: "Aura Synth", lyricsSnippet: "Floating in a digital dream...", mood: "Hypnotic Cyber", identified: true, matchSource: 'MOCK' };
  }

  let features: number[] = [];
  try {
    features = await generateFingerprint(base64Audio);
    const localMatch = findLocalMatch(features);
    if (localMatch) return { ...localMatch, matchSource: 'LOCAL' };
  } catch (e) {
      console.warn("[AI] Fingerprint generation/matching failed:", e);
  }

  const apiKey = customKey || process.env.API_KEY;
  if (!apiKey || apiKey.includes('YOUR_API_KEY')) {
      return { title: "API Config Missing", artist: "System Alert", lyricsSnippet: "Please configure your API Key in the settings to enable AI recognition.", mood: "Configuration Required", identified: false, matchSource: 'MOCK' };
  }

  const regionName = region === 'global' ? 'Global' : (REGION_NAMES[region] || region);
  const langMap: Record<string, string> = { en: 'English', zh: 'Simplified Chinese', tw: 'Traditional Chinese', ja: 'Japanese', es: 'Spanish', ko: 'Korean', de: 'German', fr: 'French', ru: 'Russian', ar: 'Arabic' };
  const targetLang = langMap[language] || 'English';

  // Although only Gemini is called, the persona changes the prompt style.
  const personaInstruction = PROVIDER_PROFILES[provider] || PROVIDER_PROFILES['GEMINI'];

  // Enhanced system prompt from geminiService.ts
  const systemInstruction = `
    You are the "Aura Flux Synesthesia Intelligence".
    ${personaInstruction}
    
    TASK: Analyze the 6-second audio snapshot provided. Identify commercial tracks OR provide a poetic synesthetic description of the soundscape.
    
    SPECIFIC RULES:
    1. Commercial Match: If identified, set "identified": true and provide exact metadata.
    2. Generative Description: If NO song is identified (identified: false), fill "title" and "artist" with a creative, evocative description of the audio texture (e.g., Title: "Velvet Static", Artist: "Lofi Ambient").
    3. Mood & Lyrics: Always translate the "mood" and "lyricsSnippet" into ${targetLang}.
        - MOOD: Provide a vivid 3-5 word summary combining emotion and genre (e.g., "Melancholic Cyberpunk Rain", "High-Energy Industrial Techno"). Avoid generic single words.
        - LYRICS/TEXTURE: If lyrics are audible, quote key lines. If instrumental, describe the visual texture or genre elements.
    4. Style: Mirror the characteristic speech patterns of your assigned persona.
    5. Response Format: Return RAW JSON only. No markdown.
  `;

  try {
      // NOTE: Currently, only Gemini provider is implemented for API calls.
      // The `provider` variable primarily influences the prompt's persona.
      const client = new GoogleGenAI({ apiKey });

      const generatePromise = client.models.generateContent({
          model: GEMINI_MODEL,
          contents: [{ parts: [{ inlineData: { mimeType, data: base64Audio } }, { text: `Identify audio. Region: ${regionName}. Language: ${targetLang}.` }] }],
          config: { 
              tools: [{ googleSearch: {} }], 
              systemInstruction: systemInstruction,
              temperature: 0.7,
              topP: 0.95,
              topK: 40,
              responseMimeType: "application/json",
              responseSchema: RESPONSE_SCHEMA
          }
      });
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("AI_TIMEOUT")), REQUEST_TIMEOUT_MS)
      );

      const response = await Promise.race([generatePromise, timeoutPromise]) as any;

      let rawText = response.text || "";
      rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
      
      let songInfo: SongInfo;
      try {
        songInfo = JSON.parse(rawText);
      } catch (jsonError) {
        console.error("[AI] Robustness: Failed to parse JSON response.", jsonError, "Raw Text:", rawText);
        throw new Error("Invalid JSON response from AI.");
      }

      const chunk = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.[0];
      if (chunk?.web?.uri) songInfo.searchUrl = chunk.web.uri;
      songInfo.matchSource = provider;
      if (songInfo.identified && features.length > 0) saveToLocalCache(features, songInfo);
      return songInfo;

  } catch (error: any) {
      console.error(`[AI] Identification failed:`, error.message);
      return null;
  }
};