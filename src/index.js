export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const clientIP = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'Unknown IP';
        const userAgent = request.headers.get('User-Agent') || 'Unknown User-Agent';
        
        // ثبت ورود درخواست
        console.log(`[${new Date().toISOString()}] Request received from IP: ${clientIP} | User-Agent: ${userAgent} | Path: ${url.pathname}`);
        
        // استفاده از یک مسیر مشخص و بررسی روش درخواست
        if (url.pathname !== '/api' || request.method !== 'GET') {
            console.log(`[${new Date().toISOString()}] Error: Invalid path or method | IP: ${clientIP} | Path: ${url.pathname} | Method: ${request.method}`);
            return new Response('Not Found', { status: 404 });
        }

        // احراز هویت ایمن‌تر
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || authHeader !== `Bearer ${env.API_TOKEN}`) {
            console.log(`[${new Date().toISOString()}] Error: Unauthorized access attempt | IP: ${clientIP}`);
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // دریافت station_id از پارامترهای URL
        const station_id = url.searchParams.get('station_id');
        if (!station_id) {
            console.log(`[${new Date().toISOString()}] Error: Missing station_id parameter | IP: ${clientIP}`);
            return new Response(JSON.stringify({ error: 'Missing station_id parameter' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        try {
            console.log(`[${new Date().toISOString()}] Fetching data for station_id: ${station_id} | IP: ${clientIP}`);
            
            // استفاده از آدرس API مورد نظر
            const targetUrl = `https://www.irantracking.com/FrontEndETA/MOBIL/api/ETA/GetETAText?currentStopId=${station_id}&identifier=1&sequence=2`;
            
            // ارسال درخواست به API مورد نظر
            const response = await fetch(targetUrl, {
                method: 'GET',
                headers: {
                    'Authorization': 'Basic U3RhdGlvbk1vbml0b3I6bUVYbnN0c2dCcmdTakN5MEJuWi9va3lpMElRa2NST05IU2poUHJ4RENNSXp2M2RoMy9LYzB3V3h6M0RQZWJSRUx2WEJ3MFFpUWVkTUVOaG9NUkJtWDYzSXNIRUJ6OTh4aWZBMHNWMDd4OHdzWGhKWk9JUTFzK1g0am1wcUtMaW9IaGZoa0JOdzhYaDBpN2ovYTlxSjAzbG5zVit4US9mQk9Ca3FtTitMMzN1NUNaKzNpbWxkRm9YdmFlbzVybE1RUUgvMXg4Q3VQdzNHdXQ3YXJPSi83T3dGSktKTUU2dWMvWWNtMHBMbTdoWENQdDJnK0M2OEFMOElLbkJkRy9TVk5hbCs0L0UyVlEwZnBNZ1ZRamRURkh1ZUN4Z0pZYmJMYkw2UzVNSTN0MjV3dmFwdURJV1pTc1RGVmd1cnZidHhwSHo0Y0RBbmJacUFwV1IvS2lqblJ3PT0=',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive'
                },
                cf: { cacheTtl: 300, cacheEverything: true } // کشینگ برای کاهش بار سرور
            });

            if (!response.ok) {
                const errorMsg = `API error: ${response.status}`;
                console.log(`[${new Date().toISOString()}] ${errorMsg} | IP: ${clientIP}`);
                throw new Error(errorMsg);
            }

            const apiData = await response.json();
            console.log(`[${new Date().toISOString()}] Successfully fetched data | IP: ${clientIP} | Response size: ${JSON.stringify(apiData).length} bytes`);

            return new Response(JSON.stringify(apiData), {
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'public, max-age=300',
                    'Connection': 'keep-alive'
                }
            });

        } catch (error) {
            console.log(`[${new Date().toISOString()}] Error: ${error.message} | IP: ${clientIP}`);
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
