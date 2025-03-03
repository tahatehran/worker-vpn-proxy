export default {
    async fetch(request, env) {
        const url = new URL(request.url);
      
        // اعتبارسنجی مسیر و احراز هویت
        if (url.pathname !== '/api') {
            return new Response('Not Found', { status: 404 });
        }
  
        if (request.method !== 'GET') {
            return new Response('Method Not Allowed', { status: 405 });
        }

        const authHeader = request.headers.get('Authorization');
        if (!authHeader || authHeader !== `Bearer ${env.API_TOKEN}`) {
            return new Response('Unauthorized', { status: 401 });
        }

        try {
            // دریافت داده از Supabase
            const response = await fetch(env.SUPABASE_URL, {
                headers: {
                    'apikey': env.SUPABASE_KEY,
                    'Authorization': `Bearer ${env.SUPABASE_KEY}`
                }
            });

            if (!response.ok) {
                throw new Error(`Supabase error: ${response.status}`);
            }

            const supabaseData = await response.json();

            return new Response(JSON.stringify(supabaseData), {
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
