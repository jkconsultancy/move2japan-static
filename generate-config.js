const fs = require('fs');

// Read from Vercel environment variables (or .env for local dev)
// Vercel exposes env vars, and for client-side access, use NEXT_PUBLIC_ prefix or just the var name
const backendUrl = process.env.BACKEND_API_URL || 
                   process.env.NEXT_PUBLIC_BACKEND_API_URL || 
                   'http://localhost:8000';

const configJs = `// This file is auto-generated during build - do not edit directly
// Generated from environment variable BACKEND_API_URL
window.APP_CONFIG = {
  BACKEND_API_URL: ${JSON.stringify(backendUrl)}
};
`;

fs.writeFileSync('config.js', configJs);
console.log('✅ Generated config.js with BACKEND_API_URL:', backendUrl);

