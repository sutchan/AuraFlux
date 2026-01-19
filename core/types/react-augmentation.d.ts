
/**
 * File: core/types/react-augmentation.d.ts
 * Version: 1.0.0
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 */

import React from 'react';

// Define the React Three Fiber (R3F) elements interface
// These are strictly for the Main Thread UI layer.
interface R3FElements {
  mesh: any;
  pointLight: any;
  spotLight: any;
  ambientLight: any;
  group: any;
  primitive: any;
  meshPhysicalMaterial: any;
  meshStandardMaterial: any;
  rectAreaLight: any;
  color: any;
  fog: any;
  directionalLight: any;
  points: any;
  bufferGeometry: any;
  bufferAttribute: any;
  shaderMaterial: any;
  [elemName: string]: any;
}

// Augment the global JSX namespace with R3F elements.
declare global {
  namespace JSX {
    interface IntrinsicElements extends R3FElements {}
  }
}

// Augment React.JSX namespace for newer Typescript/React versions
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends R3FElements {}
  }
}
