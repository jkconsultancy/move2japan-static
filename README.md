# Moving to Japan Checklist - Static Site

A comprehensive checklist application for moving to Japan from the US.

## Local Development & Testing with ngrok

### Option 1: Python HTTP Server (Recommended - Built-in)

1. **Start a local server:**
   ```bash
   # Python 3
   python3 -m http.server 8001
   
   # Or Python 2
   python -m SimpleHTTPServer 8001
   ```

2. **In a new terminal, start ngrok:**
   ```bash
   ngrok http 8001
   ```

3. **Access your site:**
   - Local: http://localhost:8001
   - Public (via ngrok): Use the HTTPS URL shown by ngrok (e.g., `https://abc123.ngrok.io`)

### Option 2: Node.js HTTP Server

1. **Install http-server globally:**
   ```bash
   npm install -g http-server
   ```

2. **Start the server:**
   ```bash
   http-server -p 8001
   ```

3. **Start ngrok in another terminal:**
   ```bash
   ngrok http 8001
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

The included `vercel.json` adds security headers and a build command that generates `config.js` from environment variables.

### Environment Variables

The site uses environment variables to configure the backend API URL. The `config.js` file is automatically generated during the Vercel build process.

**Setting Environment Variables in Vercel:**

1. Go to your project settings in Vercel Dashboard
2. Navigate to "Environment Variables"
3. Add the following variable:
   - **Name:** `BACKEND_API_URL`
   - **Value:** Your production backend URL (e.g., `https://api.yourdomain.com`)
   - **Environment:** Production, Preview, Development (as needed)

**Local Development:**

For local development, you can:
1. Manually create `config.js` from `config.example.js`
2. Or run `node generate-config.js` (it will use `http://localhost:8000` as default)
3. Or set the `BACKEND_API_URL` environment variable before running the build script

The build command (`node generate-config.js`) reads the `BACKEND_API_URL` environment variable and generates `config.js` with the appropriate backend URL.

No environment variables are needed. The site loads checklist data from a GitHub Gist URL (configurable via `checklist_url` query parameter).

### Notes

- The site fetches JSON data from an external GitHub Gist URL
- All assets (CSS, fonts) are loaded from CDNs
- No build process required - pure static HTML/CSS/JavaScript

## Analytics Setup

### Cloudflare Web Analytics

The site includes Cloudflare Web Analytics for privacy-focused, free analytics.

**To set up:**

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → Web Analytics
2. Click "Add a site" and enter your domain
3. Copy your token from the dashboard
4. Replace `YOUR_CLOUDFLARE_TOKEN_HERE` in `index.html` (line 12) with your actual token

**Benefits:**
- ✅ Free forever
- ✅ Privacy-focused (no cookies, GDPR compliant)
- ✅ Lightweight (~1KB script)
- ✅ No cookie banner required
- ✅ Real-time analytics

**Note:** You don't need to use Cloudflare as your CDN/DNS provider to use Web Analytics - it works with any hosting provider.

## Testing & Resetting User State

### Clearing Cookies and Local Storage for Testing

To test the site as if visiting for the first time, you need to clear both cookies and localStorage:

#### Option 1: Browser DevTools (Recommended)

1. **Open Browser DevTools** (F12 or Cmd+Option+I on Mac)
2. **Go to Application tab** (Chrome/Edge) or **Storage tab** (Firefox)
3. **Clear Cookies:**
   - In the left sidebar, expand "Cookies"
   - Select your site's domain (e.g., `localhost:8001` or your domain)
   - Right-click and select "Clear" or delete the `japan_checklist_data` cookie
4. **Clear Local Storage:**
   - In the left sidebar, expand "Local Storage"
   - Select your site's domain
   - Right-click and select "Clear" or delete the following keys:
     - `move2japan_anonymous_user_id`
     - `move2japan_auth_token`
     - `move2japan_user_info`

#### Option 2: Browser Console (Easiest!)

The site includes a built-in function to clear everything with a single command:

1. **Open Browser Console** (F12 or Cmd+Option+I)
2. **Type and press Enter:**
   ```javascript
   clearAllUserData()
   ```

This single function will:
- Clear all cookies
- Clear all localStorage items
- Reset in-memory state
- Automatically reload the page

**Alternative manual method** (if you prefer):
```javascript
// Clear all cookies
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});

// Clear localStorage
localStorage.removeItem('move2japan_anonymous_user_id');
localStorage.removeItem('move2japan_auth_token');
localStorage.removeItem('move2japan_user_info');

// Reload the page
location.reload();
```

#### Option 3: Incognito/Private Mode

Another simple way to test as a first-time visitor:
1. Open a new incognito/private browser window
2. Navigate to your site
3. This will start with a clean slate (no cookies or localStorage)

**Note:** The `clearAllUserData()` function (Option 2) is the easiest method if you're already on the site.

### What Gets Cleared

- **Cookies:**
  - `japan_checklist_data` - Contains checklist progress and completed tasks

- **Local Storage:**
  - `move2japan_anonymous_user_id` - Anonymous user tracking ID
  - `move2japan_auth_token` - Supabase authentication token (if logged in)
  - `move2japan_user_info` - User account information (if logged in)

After clearing, the site will:
- Show the email modal (MailerLite) on first visit
- Create a new anonymous user ID
- Start with a fresh checklist state

