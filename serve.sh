#!/bin/bash

# Simple script to serve the static site locally
# After running this, use ngrok in another terminal: ngrok http 8000

PORT=8000

echo "🚀 Starting local server on port $PORT..."
echo ""
echo "📝 To expose this with ngrok, run in another terminal:"
echo "   ngrok http $PORT"
echo ""
echo "🌐 Local URL: http://localhost:$PORT"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Try Python 3 first, then Python 2, then suggest alternatives
if command -v python3 &> /dev/null; then
    python3 -m http.server $PORT
elif command -v python &> /dev/null; then
    python -m SimpleHTTPServer $PORT
else
    echo "❌ Python not found. Please install Python or use one of these alternatives:"
    echo "   - Node.js: npx http-server -p $PORT"
    echo "   - PHP: php -S localhost:$PORT"
    exit 1
fi

