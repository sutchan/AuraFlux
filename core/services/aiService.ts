/**
 * File: core/services/aiService.ts
 * Version: 3.0.4
 * Author: Aura Flux Team
 * Copyright (c) 2025 Aura Flux. All rights reserved.
 * Updated: 2025-03-05 12:00
 * Description: Corrected the AI persona for Groq to reflect its speed and efficiency.
 */

import { GoogleGenAI, Type } from "@google/genai";
import { GEMINI_MODEL, REGION_NAMES } from '../constants';
import { SongInfo, Language, Region, AIProvider } from '../types';
import { generateFingerprint, saveToLocalCache, findLocalMatch } from './fingerprintService';

const REQUEST_TIMEOUT_MS = 25000; // Increased from 15s to improve reliability

const PROVIDER_PROFILES: Record<string, string> = {
    GEMINI: "Role: Google Gemini. Style: Balanced, high-fidelity analysis. Focus on accurate metadata and holistic emotional context. Use rich, evocative language for moods.",
    GROQ: "Role: Groq LPU Service. Style: Extremely fast, direct, and efficient. Utilizes models like Llama 3. Focus on low-latency, concise answers. Moods should be clear and to the point.",
    OPENAI: "Role: GPT-4o. Style: Encyclopedic, precise, and professional. Prioritize technical genre accuracy and historical context. Moods should be descriptive and formal, e.g., 'Pensive Neoclassical Composition'.",
    CLAUDE: "Role: Anthropic Claude 3. Style: Analytical, verbose, and nuanced. Focus on music theory, instrumentation, and complex emotional undertones. Describe moods with literary and precise language.",
    DEEPSEEK: "Role: DeepSeek. Style: Technical, code-aware, and concise. Excel at identifying electronic subgenres and structural patterns. Moods should be direct and based on sonic texture, e.g., 'Syncopated, Glitchy, Minimal'.",
    QWEN: "Role: Alibaba Qwen. Style: Globally-focused, multilingual, and culturally aware. Strong at identifying non-western and eclectic genres. Moods should reflect a broad cultural context.",
};

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Track title or poetic audio description." },
    artist: { type: Type.STRING, description: "Artist name or audio category/genre." },
    lyricsSnippet: { type: Type.STRING, description: "Key lyrics, lyrical themes, or sensory description of the music's texture." },
    mood: { type: Type.STRING, description: "Descriptive aesthetic mood summary (3-5 words) including genre hints." },
    mood_en_keywords: { type: Type.STRING, description: "Canonical, comma-separated English keywords for styling (e.g., 'dark, industrial, driving')." },
    identified: { type: Type.BOOLEAN, description: "True if it is a known commercial track." },
  },
  required: ['title', 'artist', 'mood', 'mood_en_keywords', 'identified']
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
      return { title: "Echoes of Eternity", artist: "Aura Synth", lyricsSnippet: "Floating in a digital dream...", mood: "Hypnotic Cyber", mood_en_keywords: 'hypnotic, cyber, ambient', identified: true, matchSource: 'MOCK' };
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
      return { title: "API Config Missing", artist: "System Alert", lyricsSnippet: "Please configure your API Key in the settings to enable AI recognition.", mood: "Configuration Required", mood_en_keywords: 'error, alert', identified: false, matchSource: 'MOCK' };
  }

  const regionName = region === 'global' ? 'Global' : (REGION_NAMES[region] || region);
  const langMap: Record<string, string> = { en: 'English', zh: 'Simplified Chinese', tw: 'Traditional Chinese', ja: 'Japanese', es: 'Spanish', ko: 'Korean', de: 'German', fr: 'French', ru: 'Russian', ar: 'Arabic' };
  const targetLang = langMap[language] || 'English';

  const personaInstruction = PROVIDER_PROFILES[provider] || PROVIDER_PROFILES['GEMINI'];

  // --- v1.7.43: Stricter Prompt Engineering for Accuracy ---
  const systemInstruction = `
    You are the "Aura Flux Synesthesia Intelligence".
    ${personaInstruction}
    
    PRIMARY GOAL: Your main task is to identify the commercial song title and artist from the provided 6-second audio snippet. Use your tools for this.

    SECONDARY GOAL (FALLBACK): ONLY IF you are absolutely certain no commercial track matches, then you must provide a poetic, synesthetic description of the soundscape.
    
    STRICT RULES:
    1.  **Identification vs. Description**: 
        *   If you successfully identify a commercial song, you MUST set \`"identified": true\`.
        *   If you are describing the audio instead of identifying a specific track, you MUST set \`"identified": false\`. In this case, the "title" and "artist" fields should contain a CREATIVE DESCRIPTION (e.g., Title: "Velvet Static", Artist: "Lofi Ambient"), not a guess at a real song.
    2.  **Translation**: The "mood" and "lyricsSnippet" fields MUST be translated into ${targetLang}.
    3.  **Mood Field**: Provide a vivid 3-5 word summary combining emotion and genre (e.g., "Melancholic Cyberpunk Rain", "High-Energy Industrial Techno"). Avoid generic single words.
    4.  **Mood Keywords Field**: The "mood_en_keywords" MUST contain 3-5 comma-separated, lowercase English keywords for styling (e.g., 'sad, futuristic, calm' or 'energetic, electronic, aggressive').
    5.  **Lyrics/Texture Field**: If lyrics are audible, quote key lines. If instrumental, describe the visual texture, instrumentation, or genre elements (e.g., "Distorted synth arpeggios over a heavy bassline.").
    6.  **Response Format**: You MUST return RAW JSON only. Do not wrap it in markdown.
  `;

  try {
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
      
      const errorMessage = error.toString().toLowerCase();
      if (errorMessage.includes('api key not valid') || errorMessage.includes('permission denied') || (error.httpStatus === 403 || error.httpStatus === 400)) {
        return { 
          title: "Invalid API Key", 
          artist: "System Alert", 
          lyricsSnippet: `Your ${provider} API key appears to be invalid or lacks permissions. Please verify it in the AI settings panel.`, 
          mood: "Configuration Error", 
          mood_en_keywords: 'error, alert, invalid',
          identified: false, 
          matchSource: 'MOCK' 
        };
      }
      
      if (error.message === 'AI_TIMEOUT') {
        return { 
          title: "Request Timed Out", 
          artist: "System Alert", 
          lyricsSnippet: "The AI service is taking too long to respond. This might be due to network issues or high server load. Please try again in a moment.", 
          mood: "Network Issue", 
          mood_en_keywords: 'error, alert, network',
          identified: false, 
          matchSource: 'MOCK' 
        };
      }
      
      return null;
  }
};