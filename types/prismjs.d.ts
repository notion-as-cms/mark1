// Type definitions for prismjs/components/prism-*.js

// Core components
declare module 'prismjs/components/prism-core.js';
declare module 'prismjs/components/prism-markup.js';
declare module 'prismjs/components/prism-markup-templating.js';

// Languages
declare module 'prismjs/components/prism-bash.js';
declare module 'prismjs/components/prism-c.js';
declare module 'prismjs/components/prism-clike.js';
declare module 'prismjs/components/prism-coffeescript.js';
declare module 'prismjs/components/prism-cpp.js';
declare module 'prismjs/components/prism-csharp.js';
declare module 'prismjs/components/prism-css.js';
declare module 'prismjs/components/prism-diff.js';
declare module 'prismjs/components/prism-docker.js';
declare module 'prismjs/components/prism-git.js';
declare module 'prismjs/components/prism-go.js';
declare module 'prismjs/components/prism-graphql.js';
declare module 'prismjs/components/prism-handlebars.js';
declare module 'prismjs/components/prism-java.js';
declare module 'prismjs/components/prism-javascript.js';
declare module 'prismjs/components/prism-js-templates.js';
declare module 'prismjs/components/prism-jsx.js';
declare module 'prismjs/components/prism-json.js';
declare module 'prismjs/components/prism-json5.js';
declare module 'prismjs/components/prism-jsonp.js';
declare module 'prismjs/components/prism-less.js';
declare module 'prismjs/components/prism-makefile.js';
declare module 'prismjs/components/prism-markdown.js';
declare module 'prismjs/components/prism-objectivec.js';
declare module 'prismjs/components/prism-ocaml.js';
declare module 'prismjs/components/prism-python.js';
declare module 'prismjs/components/prism-reason.js';
declare module 'prismjs/components/prism-ruby.js';
declare module 'prismjs/components/prism-rust.js';
declare module 'prismjs/components/prism-sass.js';
declare module 'prismjs/components/prism-scss.js';
declare module 'prismjs/components/prism-solidity.js';
declare module 'prismjs/components/prism-sql.js';
declare module 'prismjs/components/prism-stylus.js';
declare module 'prismjs/components/prism-swift.js';
declare module 'prismjs/components/prism-typescript.js';
declare module 'prismjs/components/prism-tsx.js';
declare module 'prismjs/components/prism-wasm.js';
declare module 'prismjs/components/prism-yaml.js';

// Extend the PrismJS namespace to include the loadedLanguages function
declare namespace Prism {
  const loadedLanguages: Record<string, boolean>;
}
