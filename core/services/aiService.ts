/**
 * File: core/services/aiService.ts
 * Version: 2.1.2
 * Author: Aura Flux Team
 * Copyright (c) 2025 Aura Flux. All rights reserved.
 * Updated: 2025-02-24 17:00
 */

import { GoogleGenAI, Type } from "@google/genai";
import { GEMINI_MODEL, REGION_NAMES } from '../constants';
import { SongInfo, Language, Region, AIProvider } from '../types';
import { generateFingerprint, saveToLocalCache, findLocalMatch } from './fingerprintService';

const REQUEST_TIMEOUT_MS = 30000;

// Provider Configurations
const PROVIDERS = {
    GEMINI: { name: 'Gemini 3.0', endpoint: '', model: GEMINI_MODEL },
    OPENAI: { name: 'GPT-4o', endpoint: 'https://api.openai.com/v1/chat/completions', model: 'gpt-4o' },
    DEEPSEEK: { name: 'DeepSeek V3', endpoint: 'https://api.deepseek.com/chat/completions', model: 'deepseek-chat' },
    QWEN: { name: 'Qwen Max', endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', model: 'qwen-max' },
    GROK: { name: 'Grok Beta', endpoint: 'https://api.x.ai/v1/chat/completions', model: 'grok-beta' },
    // Mock/Persona providers use Gemini under the hood if no custom key is provided
    CLAUDE: { name: 'Claude 3.5 (Sim)', endpoint: '', model: '' },
    MOCK: { name: 'Simulation', endpoint: '', model: '' }
};

// Prompt Engineering: Optimized for Accuracy via Lyrics & Region
const generateSystemPrompt = (lang: string, region: string, persona: string) => `
You are the "Aura Flux Synesthesia Intelligence", a world-class musicologist.
${persona}

**CRITICAL MISSION**: Identify the song in the audio exactly.

**ACCURACY PROTOCOLS (STRICT ORDER):**
1.  🎤 **LYRICS TRANSCRIPTION (HIGHEST PRIORITY)**: Listen intently for *any* vocals. Transcribe the lyrics exactly. Use these lyrics to search your knowledge base. This is the #1 way to fix identification errors.
2.  🌍 **REGION BIAS**: The listener is in **${region}**. If the audio matches a song popular in ${region}, prioritize that match over obscure global tracks.
3.  🎼 **Audio Fingerprint**: Analyze the melody, rhythm, and instrumentation.

**OUTPUT RULES:**
1.  **Identified**: If you find a commercial match, set "identified": true.
2.  **Unknown**: If NO song is identified, fill "title" and "artist" with a creative description of the sound (e.g., Title: "Velvet Static", Artist: "Lofi Ambient") and set "identified": false.
3.  **Mood**: Provide a vivid 3-5 word aesthetic summary in ${lang} (e.g., "Melancholic Cyberpunk Rain").
4.  **Lyrics Snippet**: 
    - IF IDENTIFIED: Quote the actual lyrics heard. 
    - IF UNKNOWN: Describe the sound texture or genre elements in ${lang}.

Return ONLY raw JSON. No markdown.
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
            // Simple dry run
            await client.models.generateContent({ 
                model: GEMINI_MODEL, 
                contents: { parts: [{ text: "ping" }] } 
            });
            return true;
        } else if (['OPENAI', 'DEEPSEEK', 'QWEN', 'GROK'].includes(provider)) {
            const config = PROVIDERS[provider as keyof typeof PROVIDERS];
            const res = await fetch(config.endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
                body: JSON.stringify({ model: config.model, messages: [{role: 'user', content: 'ping'}], max_tokens: 1 })
            });
            return res.ok;
        }
        return true; // Mock/Others assumed valid for now
    } catch (e) {
        console.warn(`[AI] Validation failed for ${provider}:`, e);
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { 
          title: "Echoes of Eternity", artist: "Aura Synth", 
          lyricsSnippet: "Floating in a digital dream...", mood: "Hypnotic Cyber", 
          identified: true, matchSource: 'MOCK', searchUrl: 'https://google.com' 
      };
  }

  // 1. Local Fingerprint Check (Optimization)
  let features: number[] = [];
  try {
    features = await generateFingerprint(base64Audio);
    const localMatch = findLocalMatch(features);
    if (localMatch) return { ...localMatch, matchSource: 'LOCAL' };
  } catch (e) {}

  const regionName = region === 'global' ? 'Global' : (REGION_NAMES[region] || region);
  const langMap: Record<string, string> = {
      en: 'English', zh: 'Simplified Chinese', tw: 'Traditional Chinese', 
      ja: 'Japanese', es: 'Spanish', ko: 'Korean', de: 'German', 
      fr: 'French', ru: 'Russian', ar: 'Arabic'
  };
  const targetLang = langMap[language] || 'English';

  const callGemini = async (retryCount = 0): Promise<SongInfo | null> => {
    try {
        // --- GEMINI HANDLER ---
        if (provider === 'GEMINI' || provider === 'CLAUDE') { 
            const apiKey = customKey || process.env.API_KEY;
            if (!apiKey || apiKey.includes('YOUR_API_KEY')) throw new Error("Missing Gemini API Key");

            const client = new GoogleGenAI({ apiKey });
            const systemInstruction = generateSystemPrompt(targetLang, regionName, "Role: Google Gemini. Style: Precise & Emotional.");

            const response = await client.models.generateContent({
                model: GEMINI_MODEL,
                contents: { 
                  parts: [
                    { inlineData: { mimeType: mimeType, data: base64Audio } }, 
                    { text: `Identify this song. Focus on lyrics detection.` }
                  ] 
                },
                config: { 
                  tools: [{ googleSearch: {} }], 
                  systemInstruction: systemInstruction,
                  temperature: 0.4, 
                  topP: 0.95,
                  responseMimeType: "application/json",
                  responseSchema: RESPONSE_SCHEMA
                }
            });

            const rawText = response.text;
            if (!rawText) throw new Error("Empty AI Response");
            
            let songInfo: SongInfo = JSON.parse(rawText);
            
            // Extract Search URL
            const chunk = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.[0];
            if (chunk?.web?.uri) songInfo.searchUrl = chunk.web.uri;

            songInfo.matchSource = provider;
            
            if (songInfo.identified && features.length > 0) saveToLocalCache(features, songInfo);
            return songInfo;
        } 
        
        // --- OPENAI COMPATIBLE HANDLER ---
        else if (['OPENAI', 'DEEPSEEK', 'QWEN', 'GROK'].includes(provider)) {
            if (!customKey) throw new Error(`${provider} requires a Custom API Key.`);
            
            const config = PROVIDERS[provider as keyof typeof PROVIDERS];
            const systemPrompt = generateSystemPrompt(targetLang, regionName, `Role: ${config.name}.`);
            
            if (provider === 'OPENAI') {
               throw new Error("OpenAI Audio not fully implemented in client-side build.");
            }
            
            throw new Error("This provider does not support direct audio analysis in this version.");
        }
        return null;

    } catch (error: any) {
        // Determine error type before logging
        const errMsg = error.message || JSON.stringify(error);
        const isQuota = errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || error.status === 429 || error?.error?.code === 429;
        
        if (isQuota) {
             console.warn(`[AI] Quota Exceeded for ${provider}. Displaying fallback UI.`);
             return {
                title: "Quota Exceeded",
                artist: "Service Busy",
                lyricsSnippet: "The free AI limit has been reached. Please try again later or add your own API Key in Settings.",
                mood: "System Pause",
                identified: false,
                matchSource: provider
            };
        }

        // Only log actual errors if it's not a quota issue
        console.error(`[AI] ${provider} Error (Try ${retryCount}):`, error);
        
        // Retry Logic for transient errors
        if (retryCount < 1 && !errMsg.includes('API Key')) {
            await new Promise(r => setTimeout(r, 1000));
            return callGemini(retryCount + 1);
        }
        
        return null;
    }
  };

  return callGemini();
};
