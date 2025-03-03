const API_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0enFuZmJzYW10dXZqYWhzdWZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2ODc5NDEsImV4cCI6MjA1NjI2Mzk0MX0.8YhzFk1XYXrHuzmE6ctAoHMf5PjfbbXza_Z445MF9_E";
const SUPABASE_URL = "https://vtzqnfbsamtuvjahsufw.supabase.co/rest/v1/VPN-Connections?select=*";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0enFuZmJzYW10dXZqYWhzdWZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2ODc5NDEsImV4cCI6MjA1NjI2Mzk0MX0.8YhzFk1XYXrHuzmE6ctAoHMf5PjfbbXza_Z445MF9_E";

export default {
    async fetch(request) {
      const url = new URL(request.url);
      
      // اعتبارسنجی مسیر و احراز هویت
      if (url.pathname !== '/api') {
        return new Response('Not Found', { status: 404 });
      }
  
      if (request.method !== 'GET') {
        return new Response('Method Not Allowed', { status: 405 });
      }
  
      try {
        // دریافت داده از Supabase
        const response = await fetch(SUPABASE_URL, {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
          }
        });
  
        if (!response.ok) {
          throw new Error(`Supabase error: ${response.status}`);
        }
  
        const supabaseData = await response.json();
  
        // تبدیل ساختار داده
        const transformedData = {
          data: supabaseData.map(item => ({
            ipPort: `${item.ip}:${item.port}`,
            ip: item.ip,
            port: item.port,
            country: item.country || 'EU',
            last_checked: item.last_checked,
            proxy_level: item.proxy_level?.toLowerCase() || 'anonymous',
            type: item.type,
            speed: item.speed,
            support: {
              https: item.support?.https ? 1 : 0,
              get: item.support?.get ? 1 : 0,
              post: item.support?.post ? 1 : 0,
              cookies: item.support?.cookies ? 1 : 0,
              referer: item.support?.referer ? 1 : 0,
              user_agent: item.support?.user_agent ? 1 : 0,
              google: item.support?.google ? 1 : 0
            }
          })),
          count: supabaseData.length
        };
  
        return new Response(JSON.stringify(transformedData), {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'max-age=300'
          }
        });
  
      } catch (error) {
        return new Response(JSON.stringify({
          error: error.message,
          success: false
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
};
