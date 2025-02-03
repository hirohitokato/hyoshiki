// src/context/ImageListContext.tsx
import React from 'react';


// Context の初期値は空の配列（後で App.tsx で更新）
export const ImageListContext = React.createContext<string[]>([]);
