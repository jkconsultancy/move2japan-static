# Moving to Japan Checklist - Static Site

A comprehensive checklist application for moving to Japan from the US.

## Local Development & Testing with ngrok

### Option 1: Python HTTP Server (Recommended - Built-in)

1. **Start a local server:**
   ```bash
   # Python 3
   python3 -m http.server 8000
   
   # Or Python 2
   python -m SimpleHTTPServer 8000
   ```

2. **In a new terminal, start ngrok:**
   ```bash
   ngrok http 8000
   ```

3. **Access your site:**
   - Local: http://localhost:8000
   - Public (via ngrok): Use the HTTPS URL shown by ngrok (e.g., `https://abc123.ngrok.io`)

### Option 2: Node.js HTTP Server

1. **Install http-server globally:**
   ```bash
   npm install -g http-server
   ```

2. **Start the server:**
   ```bash
   http-server -p 8000
   ```

3. **Start ngrok in another terminal:**
   ```bash
   ngrok http 8000
   ```

### Option 3: PHP Built-in Server

```bash
php -S localhost:8000
```

Then use ngrok as above.

## Testing ContentSquare/Hotjar

Once ngrok is running:

1. Copy the HTTPS URL from ngrok (e.g., `https://abc123.ngrok.io`)
2. Open that URL in your browser
3. ContentSquare should now track properly since it's a public URL
4. Check browser DevTools → Network tab for ContentSquare requests
5. Check cookies for `_uxa`, `_uxs` cookies

## Quick Start Script

You can also use the provided `serve.sh` script:

```bash
chmod +x serve.sh
./serve.sh
```

This will start a Python server and provide instructions for ngrok.

## Deployment to Vercel

This static site is ready to deploy to Vercel with zero configuration. Vercel will automatically detect and serve the `index.html` file.

### Quick Deploy

1. **Install Vercel CLI (optional):**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```
   
   Or simply connect your GitHub repository to Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your repository
   - Vercel will auto-detect it's a static site and deploy

### Configuration

The included `vercel.json` adds security headers. No build step is required - the site works as-is.

### Environment Variables

No environment variables are needed. The site loads checklist data from a GitHub Gist URL (configurable via `checklist_url` query parameter).

### Notes

- The site fetches JSON data from an external GitHub Gist URL
- All assets (CSS, fonts) are loaded from CDNs
- No build process required - pure static HTML/CSS/JavaScript

