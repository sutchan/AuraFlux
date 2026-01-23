/**
 * File: core/services/aiService.ts
 * Version: 2.2.3
 * Author: Aura Flux Team
 * Copyright (c) 2025 Aura Flux. All rights reserved.
 * Updated: 2025-02-26 00:00
 */

import { GoogleGenAI, Type } from "@google/genai";
import { GEMINI_MODEL, REGION_NAMES } from '../constants';
import { SongInfo, Language, Region, AIProvider } from '../types';
import { generateFingerprint, saveToLocalCache, findLocalMatch } from './fingerprintService';

const REQUEST_TIMEOUT_MS = 30000;

const PROVIDERS = {
    GEMINI: { name: 'Gemini 3.0', endpoint: '', model: GEMINI_MODEL },
    OPENAI: { name: 'GPT-4o Audio', endpoint: 'https://api.openai.com/v1/chat/completions', model: 'gpt-4o-audio-preview' },
    GROQ: { 
        name: 'Groq (Whisper+Llama)', 
        transcribeEndpoint: 'https://api.groq.com/openai/v1/audio/transcriptions', 
        chatEndpoint: 'https://api.groq.com/openai/v1/audio/transcriptions',
        audioModel: 'distil-whisper-large-v3-en',
        chatModel: 'llama-3.3-70b-versatile'
    },
    MOCK: { name: 'Simulation', endpoint: '', model: '' }
};

const base64ToBlob = (base64: string, mimeType: string): Blob => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
};

const generateSystemPrompt = (lang: string, region: string, persona: string) => `
You are the "Aura Flux Synesthesia Intelligence", a world-class musicologist.
${persona}

**CRITICAL MISSION**: Identify the song in the audio exactly.

**ACCURACY PROTOCOLS (STRICT ORDER):**
1.  🎤 **LYRICS TRANSCRIPTION (HIGHEST PRIORITY)**: Listen intently for *any* vocals. Transcribe the lyrics exactly. Use these lyrics to search your knowledge base.
2.  🌍 **REGION BIAS**: The listener is in **${region}**. Prioritize matches popular in this market.
3.  🎼 **Audio Fingerprint**: Analyze melody, rhythm, and instrumentation.

**OUTPUT RULES:**
1.  **Identified**: Set true if matched.
2.  **Unknown**: Set title/artist with poetic texture (e.g. "Velvet Static") if unmatched.
3.  **Mood**: Vivid 3-5 word summary in ${lang}.
4.  **Lyrics Snippet**: Quote lyrics or describe texture in ${lang}.

Return ONLY raw JSON. No markdown backticks.
`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    artist: { type: Type.STRING },
    lyricsSnippet: { type: Type.STRING },
    mood: { type: Type.STRING },
    identified: { type: Type.BOOLEAN },
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
  } catch (e) {}

  const regionName = region === 'global' ? 'Global' : (REGION_NAMES[region] || region);
  const langMap: Record<string, string> = { en: 'English', zh: 'Simplified Chinese', tw: 'Traditional Chinese', ja: 'Japanese', es: 'Spanish', ko: 'Korean', de: 'German', fr: 'French', ru: 'Russian', ar: 'Arabic' };
  const targetLang = langMap[language] || 'English';

  const callGemini = async (retryCount = 0): Promise<SongInfo | null> => {
    try {
        if (provider === 'GEMINI') { 
            const apiKey = customKey || process.env.API_KEY;
            if (!apiKey || apiKey.includes('YOUR_API_KEY')) throw new Error("Missing API Key");

            const client = new GoogleGenAI({ apiKey });
            const sysPrompt = generateSystemPrompt(targetLang, regionName, "Role: Google Gemini. Precision identification.");

            const response = await client.models.generateContent({
                model: GEMINI_MODEL,
                contents: [{ parts: [{ inlineData: { mimeType, data: base64Audio } }, { text: "Identify track." }] }],
                config: { tools: [{ googleSearch: {} }], systemInstruction: sysPrompt, responseMimeType: "application/json", responseSchema: RESPONSE_SCHEMA }
            });

            // ROBUST PARSING: Handle potential backticks from AI
            let rawText = response.text || "";
            rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
            
            let songInfo: SongInfo = JSON.parse(rawText);
            const chunk = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.[0];
            if (chunk?.web?.uri) songInfo.searchUrl = chunk.web.uri;
            songInfo.matchSource = provider;
            if (songInfo.identified && features.length > 0) saveToLocalCache(features, songInfo);
            return songInfo;
        } 
        return null;
    } catch (error: any) {
        if (retryCount < 1) return callGemini(retryCount + 1);
        return null;
    }
  };

  return callGemini();
};