const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8000;

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

function fetchUrl(urlStr) {
    return new Promise((resolve, reject) => {
        const protocol = urlStr.startsWith('https') ? https : http;
        protocol.get(urlStr, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5'
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, data }));
        }).on('error', reject);
    });
}

function extractVttUrls(html, baseUrl) {
    const vttUrls = new Set();
    
    // Match .vtt URLs in various formats
    const patterns = [
        /"(https?:\/\/[^"]*\.vtt[^"]*)"/g,
        /'(https?:\/\/[^']*\.vtt[^']*)'/g,
        /url\s*:\s*"(https?:\/\/[^"]*\.vtt[^"]*)"/g,
        /src\s*:\s*"(https?:\/\/[^"]*\.vtt[^"]*)"/g,
        /(https?:\/\/[^\s<>"']*\.vtt[^\s<>"']*)/g
    ];
    
    patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(html)) !== null) {
            vttUrls.add(match[1]);
        }
    });
    
    return Array.from(vttUrls);
}

async function getVimeoVttUrls(vimeoUrl) {
    const videoIdMatch = vimeoUrl.match(/vimeo\.com\/(\d+)/);
    if (!videoIdMatch) {
        throw new Error('Invalid Vimeo URL');
    }
    
    const videoId = videoIdMatch[1];
    const hashMatch = vimeoUrl.match(/\/(\w+)(?:\?|$)/);
    const unlockHash = hashMatch ? hashMatch[1] : null;
    
    let configUrl = `https://player.vimeo.com/video/${videoId}`;
    if (unlockHash && unlockHash !== videoId) {
        configUrl += `/${unlockHash}`;
    }
    configUrl += '/config';
    
    console.log('Fetching Vimeo config:', configUrl);
    
    try {
        const configRes = await fetchUrl(configUrl);
        
        if (configRes.statusCode !== 200) {
            console.log('Config fetch failed with status:', configRes.statusCode);
            throw new Error('Failed to fetch Vimeo config');
        }
        
        const config = JSON.parse(configRes.data);
        const vttUrls = [];
        
        if (config.request && config.request.text_tracks) {
            config.request.text_tracks.forEach(track => {
                if (track.url) {
                    vttUrls.push(track.url);
                }
            });
        }
        
        return vttUrls;
    } catch (error) {
        console.error('Vimeo API error:', error);
        throw new Error('Could not retrieve captions from Vimeo. The video may be private or require authentication.');
    }
}

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    
    if (parsedUrl.pathname === '/api/find-vtt') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        
        if (req.method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            return;
        }
        
        try {
            const targetUrl = parsedUrl.query.url;
            
            if (!targetUrl) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Missing URL parameter' }));
                return;
            }
            
            // Check if it's a Vimeo URL
            if (targetUrl.includes('vimeo.com')) {
                console.log('Detected Vimeo URL, using API method');
                const vttUrls = await getVimeoVttUrls(targetUrl);
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    vttUrls: vttUrls
                }));
            } else {
                // For other sites, try HTML parsing
                console.log('Fetching page:', targetUrl);
                const pageRes = await fetchUrl(targetUrl);
                
                if (pageRes.statusCode !== 200) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Failed to fetch page' }));
                    return;
                }
                
                const vttUrls = extractVttUrls(pageRes.data, targetUrl);
                
                console.log('Found VTT URLs:', vttUrls);
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    vttUrls: vttUrls
                }));
            }
            
        } catch (error) {
            console.error('Error:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
    } else if (parsedUrl.pathname === '/api/vimeo-proxy') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        
        if (req.method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            return;
        }
        
        try {
            const vimeoUrl = parsedUrl.query.url;
            
            if (!vimeoUrl) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Missing URL parameter' }));
                return;
            }
            
            const videoIdMatch = vimeoUrl.match(/vimeo\.com\/(\d+)/);
            if (!videoIdMatch) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid Vimeo URL' }));
                return;
            }
            
            const videoId = videoIdMatch[1];
            const hashMatch = vimeoUrl.match(/\/(\w+)\?/);
            const unlockHash = hashMatch ? hashMatch[1] : null;
            
            let configUrl = `https://player.vimeo.com/video/${videoId}`;
            if (unlockHash) {
                configUrl += `/${unlockHash}`;
            }
            configUrl += '/config';
            
            console.log('Fetching config:', configUrl);
            const configRes = await fetchUrl(configUrl);
            
            if (configRes.statusCode !== 200) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Failed to fetch video config' }));
                return;
            }
            
            const config = JSON.parse(configRes.data);
            
            let vttUrl = null;
            if (config.request && config.request.text_tracks && config.request.text_tracks.length > 0) {
                vttUrl = config.request.text_tracks[0].url;
            }
            
            if (!vttUrl) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'No captions found for this video' }));
                return;
            }
            
            console.log('Fetching VTT:', vttUrl);
            const vttRes = await fetchUrl(vttUrl);
            
            if (vttRes.statusCode !== 200) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Failed to fetch VTT file' }));
                return;
            }
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                vtt_content: vttRes.data,
                vtt_url: vttUrl
            }));
            
        } catch (error) {
            console.error('Error:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
    } else {
        let filePath = '.' + parsedUrl.pathname;
        if (filePath === './') {
            filePath = './index.html';
        }
        
        const extname = String(path.extname(filePath)).toLowerCase();
        const contentType = mimeTypes[extname] || 'application/octet-stream';
        
        fs.readFile(filePath, (error, content) => {
            if (error) {
                if (error.code === 'ENOENT') {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end('404 Not Found', 'utf-8');
                } else {
                    res.writeHead(500);
                    res.end('Server Error: ' + error.code);
                }
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        });
    }
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`Open your browser and go to: http://localhost:${PORT}/`);
});
