/**
 * File: core/types/index.ts
 * Version: 1.8.23
 * Author: Aura Flux Team
 * Copyright (c) 2024 Aura Flux. All rights reserved.
 */

// Re-export all types from domain-specific files
export * from './common';
export * from './audio';
export * from './visuals';

export type AIProvider = 'GEMINI' | 'OPENAI' | 'GROQ' | 'CLAUDE' | 'DEEPSEEK' | 'QWEN' | 'MOCK';