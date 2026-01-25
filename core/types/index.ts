/**
 * File: core/types/index.ts
 * Version: 1.7.32
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-03-05 12:00
 */

// Re-export all types from domain-specific files
export * from './common';
export * from './audio';
export * from './visuals';

export type AIProvider = 'GEMINI' | 'OPENAI' | 'GROQ' | 'MOCK';