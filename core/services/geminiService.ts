/**
 * File: core/services/geminiService.ts
 * Version: 1.0.6
 * Author: Aura Flux Team
 * Copyright (c) 2024 Aura Flux. All rights reserved.
 */

import { GoogleGenAI, Type } from "@google/genai";
import { GEMINI_MODEL, REGION_NAMES } from '../constants';
import { SongInfo, Language, Region } from '../types';
import { generateFingerprint, saveToLocalCache, findLocalMatch } from './fingerprintService';

const REQUEST_TIMEOUT_MS = 20000; // 20s Hard Timeout for Robustness

export const identifySongFromAudio = async (
  base64Audio: string, 
  mimeType: string, 
  language: Language = 'en', 
  region: Region = 'global',
  provider: 'GEMINI' | 'MOCK' | 'OPENAI' | 'CLAUDE' | 'GROK' | 'DEEPSEEK' | 'QWEN' = 'GEMINI'
): Promise<SongInfo | null> => {
  if (provider === 'MOCK') {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { title: "Midnight City", artist: "M83", lyricsSnippet: "Waiting in the car...", mood: "Electric", identified: true, matchSource: 'MOCK', searchUrl: 'https://google.com' };
  }

  // ROBUSTNESS: Check for API Key presence before initialization
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey.trim() === '') {
      console.warn("[AI] API Key is missing or empty. Identification feature disabled.");
      return null;
  }

  // ROBUSTNESS: Wrap client initialization in try-catch to prevent crashes on invalid keys
  let aiClient: GoogleGenAI;
  try {
      aiClient = new GoogleGenAI({ apiKey });
  } catch (error) {
      console.error("[AI] Failed to initialize GoogleGenAI client:", error);
      return null;
  }

  let features: number[] = [];
  try {
    features = await generateFingerprint(base64Audio);
    const localMatch = findLocalMatch(features);
    if (localMatch) {
        console.debug("[AI] Local fingerprint match found:", localMatch.title);
        return localMatch;
    }
  } catch (e) {
    console.warn("[Recognition] Local match failed", e);
  }

  const callGemini = async (retryCount = 0): Promise<SongInfo | null> => {
    try {
        const regionName = region === 'global' ? 'Global' : (REGION_NAMES[region] || region);
        
        // Map language code to full language name for the prompt
        const langMap: Record<string, string> = {
            en: 'English', zh: 'Simplified Chinese', tw: 'Traditional Chinese', 
            ja: 'Japanese', es: 'Spanish', ko: 'Korean', de: 'German', 
            fr: 'French', ru: 'Russian', ar: 'Arabic'
        };
        const targetLang = langMap[language] || 'English';

        const systemInstruction = `
          You are the "Aura Flux AI Synesthesia Engine". Your specialty is Identifying tracks from low-fidelity 6-second microphone snapshots.
          
          MARKET CONTEXT: The user is in the '${regionName}' market. 
          USER LANGUAGE: ${targetLang}.
          
          CORE CAPABILITIES:
          1. SPECTRAL ANALYSIS: Listen past background noise to find the primary melodic signature.
          2. SEARCH GROUNDING: Use Google Search to verify Title/Artist.
          3. REGIONAL BIAS: Prioritize tracks popular in ${regionName}.
          4. LINGUISTIC ADAPTATION: 
             - Return 'mood' and 'lyricsSnippet' translated into ${targetLang}.
             - Keep Title/Artist in their original script (e.g. Kanji for Japanese songs) BUT if the user's language is different, provide a ${targetLang} translation in parentheses.
          
          NOISE POLICY:
          - If NO music is heard, set "identified" to false.
          
          MOOD ANALYSIS:
          - Provide a evocative 2-3 word aesthetic mood tag in ${targetLang} (e.g., 'Retro Synthwave' -> '复古合成波' if Chinese).
          
          STRICT OUTPUT:
          - Return valid JSON only.
        `;

        const identifyPromise = aiClient.models.generateContent({
          model: GEMINI_MODEL,
          contents: { 
            parts: [
              { inlineData: { mimeType: mimeType, data: base64Audio } }, 
              { text: `Analyze this audio. Identify the song and describe its mood in ${targetLang}.` }
            ] 
          },
          config: { 
            tools: [{ googleSearch: {} }], 
            systemInstruction: systemInstruction,
            temperature: 0.15, 
            topP: 0.8,
            topK: 20,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { 
                  type: Type.STRING, 
                  description: `The track title. If different from ${targetLang}, keep original script and include ${targetLang} translation in parentheses.` 
                },
                artist: { 
                  type: Type.STRING, 
                  description: `The artist name. If different from ${targetLang}, keep original script and include ${targetLang} translation in parentheses.` 
                },
                lyricsSnippet: { type: Type.STRING, description: `A relevant line or chorus translated into ${targetLang}.` },
                mood: { type: Type.STRING, description: `2-3 word mood description in ${targetLang}.` },
                identified: { type: Type.BOOLEAN, description: "True only if a specific song was found." },
              },
              required: ['title', 'artist', 'identified']
            }
          }
        });

        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("AI_TIMEOUT")), REQUEST_TIMEOUT_MS)
        );

        const response: any = await Promise.race([identifyPromise, timeoutPromise]);

        const text = response.text;
        if (!text) return null;

        let songInfo: SongInfo = JSON.parse(text.trim());
        if (!songInfo.identified) return null;

        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (groundingChunks) {
          const webSource = groundingChunks.find((chunk: any) => chunk.web?.uri);
          if (webSource?.web?.uri) songInfo.searchUrl = webSource.web.uri;
        }
        
        songInfo.matchSource = 'AI';
        return songInfo;
    } catch (error: any) {
        const errorMsg = error.message || error.toString();
        console.error(`[AI] Identification Error (Attempt ${retryCount + 1}):`, errorMsg);
        
        // Don't retry if it's a timeout or explicit API key issue to save quotas/time
        if (errorMsg === "AI_TIMEOUT" || errorMsg.includes("API key") || errorMsg.includes("401") || errorMsg.includes("403")) {
            return null;
        }
        
        if (retryCount < 1) return callGemini(retryCount + 1);
        return null;
    }
  };

  const aiResult = await callGemini();
  if (aiResult && aiResult.identified && features.length > 0) saveToLocalCache(features, aiResult);
  return aiResult;
};