export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        
        // استفاده از یک مسیر مشخص و بررسی روش درخواست
        if (url.pathname !== '/api' || request.method !== 'GET') {
            return new Response('Not Found', { status: 404 });
        }

        // احراز هویت ایمن‌تر
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || authHeader !== `Bearer ${env.API_TOKEN}`) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        try {
            // استفاده از Keep-Alive برای کاهش تأخیر و بهبود عملکرد
            const response = await fetch(env.SUPABASE_URL, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${env.SUPABASE_KEY}`,
                    'apikey': env.SUPABASE_KEY,
                    'Connection': 'keep-alive'
                },
                cf: { cacheTtl: 300, cacheEverything: true } // کشینگ برای کاهش بار سرور
            });

            if (!response.ok) {
                throw new Error(`Supabase error: ${response.status}`);
            }

            const supabaseData = await response.json();

            return new Response(JSON.stringify(supabaseData), {
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'public, max-age=300',
                    'Connection': 'keep-alive'
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
