/**
 * File: core/services/aiService.ts
 * Version: 2.2.2
 * Author: Aura Flux Team
 * Copyright (c) 2025 Aura Flux. All rights reserved.
 * Updated: 2025-02-24 21:00
 */

import { GoogleGenAI, Type } from "@google/genai";
import { GEMINI_MODEL, REGION_NAMES } from '../constants';
import { SongInfo, Language, Region, AIProvider } from '../types';
import { generateFingerprint, saveToLocalCache, findLocalMatch } from './fingerprintService';

const REQUEST_TIMEOUT_MS = 30000;

// Provider Configurations
const PROVIDERS = {
    GEMINI: { name: 'Gemini 3.0', endpoint: '', model: GEMINI_MODEL },
    OPENAI: { name: 'GPT-4o Audio', endpoint: 'https://api.openai.com/v1/chat/completions', model: 'gpt-4o-audio-preview' },
    GROQ: { 
        name: 'Groq (Whisper+Llama)', 
        transcribeEndpoint: 'https://api.groq.com/openai/v1/audio/transcriptions', 
        chatEndpoint: 'https://api.groq.com/openai/v1/chat/completions',
        audioModel: 'distil-whisper-large-v3-en',
        chatModel: 'llama-3.3-70b-versatile'
    },
    MOCK: { name: 'Simulation', endpoint: '', model: '' }
};

// Utility to convert base64 to Blob
const base64ToBlob = (base64: string, mimeType: string): Blob => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
};

// Prompt Engineering
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

// Simple schema for Llama/GPT to follow via prompt engineering
const JSON_INSTRUCTION = `
Format your response as a valid JSON object with these keys: 
{
  "title": "string",
  "artist": "string",
  "lyricsSnippet": "string",
  "mood": "string",
  "identified": boolean
}
Do not include markdown code blocks. Just the raw JSON string.
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
            await client.models.generateContent({ 
                model: GEMINI_MODEL, 
                contents: { parts: [{ text: "ping" }] } 
            });
            return true;
        } else if (provider === 'OPENAI' || provider === 'GROQ') {
            let endpoint: string;
            let model: string;

            if (provider === 'GROQ') {
                const config = PROVIDERS.GROQ;
                endpoint = config.chatEndpoint;
                model = config.chatModel;
            } else {
                const config = PROVIDERS.OPENAI;
                endpoint = config.endpoint;
                model = config.model;
            }
            
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
                body: JSON.stringify({ 
                    model: model, 
                    messages: [{role: 'user', content: 'ping'}], 
                    max_tokens: 1 
                })
            });
            return res.ok;
        }
        return true; 
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
        if (provider === 'GEMINI') { 
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
        
        // --- GROQ HANDLER (Whisper + Llama) ---
        else if (provider === 'GROQ') {
            if (!customKey) throw new Error("Groq requires a Custom API Key.");
            const config = PROVIDERS.GROQ;
            
            // Step 1: Transcription via Whisper
            const audioBlob = base64ToBlob(base64Audio, mimeType);
            const formData = new FormData();
            formData.append('file', audioBlob, 'audio.webm'); // Filename is needed for Groq
            formData.append('model', config.audioModel);
            formData.append('language', 'en'); // Force EN for better lyrics capture, Llama translates later

            const transRes = await fetch(config.transcribeEndpoint!, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${customKey}` },
                body: formData
            });
            
            if (!transRes.ok) throw new Error(`Groq Transcription Failed: ${transRes.status}`);
            const transJson = await transRes.json();
            const transcript = transJson.text || "";
            
            if (!transcript && retryCount < 2) throw new Error("Empty Transcription");

            // Step 2: Analysis via Llama 3
            const systemPrompt = generateSystemPrompt(targetLang, regionName, "Role: Music Analyst. You analyze lyrics text to identify songs.") + JSON_INSTRUCTION;
            
            const chatRes = await fetch(config.chatEndpoint!, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${customKey}` },
                body: JSON.stringify({
                    model: config.chatModel,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: `Analyze these lyrics/audio transcript: "${transcript}". Identify the song.` }
                    ],
                    temperature: 0.5,
                    response_format: { type: "json_object" }
                })
            });

            if (!chatRes.ok) throw new Error(`Groq Analysis Failed: ${chatRes.status}`);
            const chatJson = await chatRes.json();
            const content = chatJson.choices[0]?.message?.content;
            
            let songInfo: SongInfo = JSON.parse(content);
            songInfo.matchSource = provider;
            
            if (songInfo.identified && features.length > 0) saveToLocalCache(features, songInfo);
            return songInfo;
        }

        // --- OPENAI HANDLER ---
        else if (provider === 'OPENAI') {
            if (!customKey) throw new Error(`${provider} requires a Custom API Key.`);
            throw new Error("OpenAI Audio Analysis is reserved for future updates.");
        }
        return null;

    } catch (error: any) {
        const errMsg = error.message || JSON.stringify(error);
        const isQuota = errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('exceeded quota') || error.status === 429;
        const isServerErr = errMsg.includes('500') || errMsg.includes('503') || error.status === 500;

        if (isQuota) {
             console.warn(`[AI] Quota Exceeded for ${provider}.`);
             return {
                title: "Quota Exceeded",
                artist: "Service Busy",
                lyricsSnippet: "", 
                mood: "System Pause",
                identified: false,
                matchSource: provider
            };
        }

        console.error(`[AI] ${provider} Error (Try ${retryCount}):`, error);
        
        if (retryCount < 2 && !errMsg.includes('API Key') && !isQuota) {
            const delay = 1000 * Math.pow(2, retryCount);
            await new Promise(r => setTimeout(r, delay));
            return callGemini(retryCount + 1);
        }

        if (isServerErr) {
             return {
                title: "Server Error",
                artist: "System Glitch",
                lyricsSnippet: "",
                mood: "Signal Lost",
                identified: false,
                matchSource: provider
            };
        }
        
        return null;
    }
  };

  return callGemini();
};
