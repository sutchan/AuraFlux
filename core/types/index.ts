/**
 * File: core/types/index.ts
 * Version: 1.2.0
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 */

// Re-export all types from domain-specific files
export * from './common';
export * from './audio';
export * from './visuals';

export type AIProvider = 'GEMINI' | 'OPENAI' | 'GROQ' | 'MOCK';
