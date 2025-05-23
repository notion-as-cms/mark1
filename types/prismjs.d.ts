// Type definitions for prismjs/components/prism-*.js

declare module 'prismjs/components/prism-markup';
declare module 'prismjs/components/prism-markup-templating';
declare module 'prismjs/components/prism-markdown';
declare module 'prismjs/components/prism-css';
declare module 'prismjs/components/prism-javascript';
declare module 'prismjs/components/prism-jsx';
declare module 'prismjs/components/prism-typescript';
declare module 'prismjs/components/prism-tsx';
// Add other Prism language components as needed

// Extend the PrismJS namespace to include the loadedLanguages function
declare namespace Prism {
  const loadedLanguages: Record<string, boolean>;
}
