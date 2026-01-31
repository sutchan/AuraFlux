/**
 * File: core/services/aiService.ts
 * Version: 2.1.0
 * Author: Sut
 * Updated: 2025-03-25 22:15 - Added generateArtisticBackground logic.
 */

import { GoogleGenAI, Type } from "@google/genai";
import { SongInfo, Language, AIProvider, Region } from '../types';

const GEMINI_MODEL = 'gemini-3-flash-preview';
const IMAGEN_MODEL = 'gemini-2.5-flash-image';

const SONG_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Track title or poetic description." },
    artist: { type: Type.STRING, description: "Artist or genre description." },
    lyricsSnippet: { type: Type.STRING, description: "A key lyric or description of the sound texture." },
    mood: { type: Type.STRING, description: "A 3-5 word aesthetic summary." },
    mood_en_keywords: { type: Type.STRING, description: "Comma-separated keywords for visual styling." },
    identified: { type: Type.BOOLEAN, description: "True if a known song." }
  },
  required: ['title', 'artist', 'mood', 'mood_en_keywords', 'identified']
};

const VISUAL_CONFIG_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    mode: { type: Type.STRING, description: "Selected visual mode name." },
    colors: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Array of 3 hex colors." },
    speed: { type: Type.NUMBER, description: "Visual speed (0.1 to 3.0)" },
    sensitivity: { type: Type.NUMBER, description: "Audio sensitivity (0.5 to 4.0)" },
    glow: { type: Type.BOOLEAN },
    explanation: { type: Type.STRING, description: "Short explanation of the aesthetic choice." }
  },
  required: ['mode', 'colors', 'speed', 'sensitivity', 'glow', 'explanation']
};

export const validateApiKey = async (provider: AIProvider, apiKey: string): Promise<boolean> => {
    if (provider !== 'GEMINI') return true; 
    if (!apiKey || !apiKey.startsWith('AIza')) return false;
    try {
        const aiInstance = new GoogleGenAI({ apiKey });
        const response = await aiInstance.models.generateContent({
            model: GEMINI_MODEL,
            contents: "hi",
            config: { maxOutputTokens: 5, thinkingConfig: { thinkingBudget: 0 } }
        });
        return !!response.text;
    } catch (e) {
        console.error("[AI] Key Validation Failed:", e);
        return false;
    }
};

export const generateVisualConfigFromAudio = async (base64Audio: string, apiKey: string, language: Language = 'en'): Promise<any> => {
    const key = apiKey || process.env.API_KEY;
    if (!key) return null;
    const aiInstance = new GoogleGenAI({ apiKey: key });
    const systemInstruction = `Analyze the provided audio snippet. Determine the most appropriate visualizer settings to match the rhythm, genre, and mood. Return choices in JSON. Explanation in ${language}.`;
    try {
        const response = await aiInstance.models.generateContent({
            model: GEMINI_MODEL,
            contents: [{ parts: [{ inlineData: { mimeType: 'audio/wav', data: base64Audio } }, { text: "Generate visual config for this audio." }] }],
            config: { systemInstruction, responseMimeType: "application/json", responseSchema: VISUAL_CONFIG_SCHEMA }
        });
        return JSON.parse(response.text || "{}");
    } catch (e) {
        console.error("[AI] Visual Config Generation Failed:", e);
        return null;
    }
};

/**
 * Generates an artistic background image based on provided mood keywords.
 */
export const generateArtisticBackground = async (moodKeywords: string, apiKey: string): Promise<string | null> => {
    const key = apiKey || process.env.API_KEY;
    if (!key) return null;
    
    const aiInstance = new GoogleGenAI({ apiKey: key });
    const prompt = `A highly detailed, professional, immersive digital art background that represents the mood: ${moodKeywords}. Abstract, cinematic lighting, aesthetic, high-fidelity, VJ style, 4k.`;
    
    try {
        const response = await aiInstance.models.generateContent({
            model: IMAGEN_MODEL,
            contents: { parts: [{ text: prompt }] },
            config: {
                imageConfig: {
                    aspectRatio: "16:9"
                }
            }
        });
        
        // Find image part in the response
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
        return null;
    } catch (e) {
        console.error("[AI] Background Generation Failed:", e);
        return null;
    }
};

export const identifySongFromAudio = async (base64Audio: string, mimeType: string, language: Language = 'en', region: Region = 'global', provider: AIProvider = 'GEMINI', apiKey?: string): Promise<SongInfo | null> => {
    const key = apiKey || process.env.API_KEY;
    if (!key) return null;
    const aiInstance = new GoogleGenAI({ apiKey: key });
    const systemInstruction = `You are an expert music identifier and visual director. Analyze the audio snippet. Identify the song if possible. Provide mood and English keywords for visualization. Region: ${region}. Language: ${language}.`;
    try {
        const response = await aiInstance.models.generateContent({
            model: GEMINI_MODEL,
            contents: [{ parts: [{ inlineData: { mimeType, data: base64Audio } }, { text: "Identify this song." }] }],
            config: { systemInstruction, responseMimeType: "application/json", responseSchema: SONG_SCHEMA }
        });
        const result = JSON.parse(response.text || "{}");
        return { ...result, matchSource: provider };
    } catch (e) {
        console.error("[AI] Song Identification Failed:", e);
        return null;
    }
};