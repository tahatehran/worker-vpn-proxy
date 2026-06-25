import aiohttp
import asyncio
import time
from datetime import datetime
import requests
import json

# ===================== تنظیمات =====================
CONCURRENT = 100
BATCH_SIZE = 300
PROXY_LIMIT = 500

# ===================== APIهای تست =====================
APIs = {
    "LumiProxy (HTTP)": {
        "url": "https://api.lumiproxy.com/web_v1/free-proxy/list?page_size=60&page=1&language=en-us",
        "format": "json",
        "filter": lambda item: item.get("protocol") == 2,
        "type": "http"
    },
    "Proxifly All": {
        "url": "https://cdn.jsdelivr.net/gh/proxifly/free-proxy-list@main/proxies/all/data.txt",
        "format": "txt",
        "filter": lambda _: True,
        "type": "mixed"
    },
    "Proxifly HTTP": {
        "url": "https://cdn.jsdelivr.net/gh/proxifly/free-proxy-list@main/proxies/protocols/http/data.txt",
        "format": "txt",
        "filter": lambda _: True,
        "type": "http"
    },
    "Proxifly HTTPS": {
        "url": "https://cdn.jsdelivr.net/gh/proxifly/free-proxy-list@main/proxies/protocols/https/data.txt",
        "format": "txt",
        "filter": lambda _: True,
        "type": "https"
    },
    "Proxifly SOCKS4": {
        "url": "https://cdn.jsdelivr.net/gh/proxifly/free-proxy-list@main/proxies/protocols/socks4/data.txt",
        "format": "txt",
        "filter": lambda _: True,
        "type": "socks4"
    },
    "Proxifly SOCKS5": {
        "url": "https://cdn.jsdelivr.net/gh/proxifly/free-proxy-list@main/proxies/protocols/socks5/data.txt",
        "format": "txt",
        "filter": lambda _: True,
        "type": "socks5"
    },
    "openproxylist All": {
        "url": "https://cdn.jsdelivr.net/gh/roosterkid/openproxylist@main/HTTPS_RAW.txt",
        "format": "txt",
        "filter": lambda _: True,
        "type": "mixed"
    },
    "openproxylist HTTP": {
        "url": "https://cdn.jsdelivr.net/gh/roosterkid/openproxylist@main/HTTPS_RAW.txt",
        "format": "txt",
        "filter": lambda _: True,
        "type": "http"
    },
    "hideip.me All": {
        "url": "https://cdn.jsdelivr.net/gh/zloi-user/hideip.me@main/http.txt",
        "format": "txt",
        "filter": lambda _: True,
        "type": "http"
    },
    "hideip.me HTTP": {
        "url": "https://cdn.jsdelivr.net/gh/zloi-user/hideip.me@main/http.txt",
        "format": "txt",
        "filter": lambda _: True,
        "type": "http"
    },
    "ErcinDedeoglu All": {
        "url": "https://cdn.jsdelivr.net/gh/ErcinDedeoglu/proxies@main/proxies/http.txt",
        "format": "txt",
        "filter": lambda _: True,
        "type": "http"
    },
    "ErcinDedeoglu HTTP": {
        "url": "https://cdn.jsdelivr.net/gh/ErcinDedeoglu/proxies@main/proxies/http.txt",
        "format": "txt",
        "filter": lambda _: True,
        "type": "http"
    },
    "vakhov fresh All": {
        "url": "https://cdn.jsdelivr.net/gh/vakhov/fresh-proxy-list@main/http.txt",
        "format": "txt",
        "filter": lambda _: True,
        "type": "http"
    },
    "vakhov fresh HTTP": {
        "url": "https://cdn.jsdelivr.net/gh/vakhov/fresh-proxy-list@main/http.txt",
        "format": "txt",
        "filter": lambda _: True,
        "type": "http"
    },
    "gfpcom free All": {
        "url": "https://cdn.jsdelivr.net/gh/gfpcom/free-proxy-list@main/http.txt",
        "format": "txt",
        "filter": lambda _: True,
        "type": "http"
    },
    "gfpcom free HTTP": {
        "url": "https://cdn.jsdelivr.net/gh/gfpcom/free-proxy-list@main/http.txt",
        "format": "txt",
        "filter": lambda _: True,
        "type": "http"
    },
    "VPSLab All": {
        "url": "https://cdn.jsdelivr.net/gh/VPSLabCloud/VPSLab-Free-Proxy-List@main/http_ssl_anonymous.txt",
        "format": "txt",
        "filter": lambda _: True,
        "type": "http"
    },
    "VPSLab HTTP": {
        "url": "https://cdn.jsdelivr.net/gh/VPSLabCloud/VPSLab-Free-Proxy-List@main/http_ssl_anonymous.txt",
        "format": "txt",
        "filter": lambda _: True,
        "type": "http"
    },
    "iplocate All": {
        "url": "https://cdn.jsdelivr.net/gh/iplocate/free-proxy-list@main/protocols/http.txt",
        "format": "txt",
        "filter": lambda _: True,
        "type": "http"
    },
    "iplocate HTTP": {
        "url": "https://cdn.jsdelivr.net/gh/iplocate/free-proxy-list@main/protocols/http.txt",
        "format": "txt",
        "filter": lambda _: True,
        "type": "http"
    },
    "Vann-Dev All": {
        "url": "https://cdn.jsdelivr.net/gh/Vann-Dev/proxy-list@main/proxies/http.txt",
        "format": "txt",
        "filter": lambda _: True,
        "type": "http"
    },
    "Vann-Dev HTTP": {
        "url": "https://cdn.jsdelivr.net/gh/Vann-Dev/proxy-list@main/proxies/http.txt",
        "format": "txt",
        "filter": lambda _: True,
        "type": "http"
    }
}

# ===================================================

async def test_single_proxy(session: aiohttp.ClientSession, proxy: str, proxy_type: str) -> dict:
    ip, port = parse_proxy(proxy)
    if not ip or not port:
        return None
    proxy_url = f"{proxy_type}://{ip}:{port}"
    start = time.time()
    try:
        async with session.get(
            "https://www.google.com",
            proxy=proxy_url,
            timeout=aiohttp.ClientTimeout(total=15),
            headers={"User-Agent": "Mozilla/5.0 (ProxyTest/1.0)"}
        ) as response:
            elapsed = round((time.time() - start) * 1000, 1)
            if response.status != 200:
                return {"status": "fail", "reason": f"HTTP status: {response.status}", "time_ms": 0}
            return {
                "status": "success",
                "ip": ip,
                "port": port,
                "time_ms": elapsed,
                "proxy_str": proxy
            }
    except Exception as e:
        return {"status": "fail", "reason": f"Error: {str(e)}", "time_ms": 0}

def parse_proxy(line: str) -> tuple[str, str]:
    line = line.strip()
    if not line or line.startswith("#"):
        return None, None
    if "://" in line:
        ip, port = line.split("://")[1].split(":", 1)
    else:
        ip, port = line.split(":", 1)
    return ip, port

def load_proxies(url: str, fmt: str, filter_func, proxy_type: str):
    if fmt == "json":
        try:
            r = requests.get(url, timeout=15)
            data = r.json()
            proxies = []
            for item in data.get("data", {}).get("list", [])[:PROXY_LIMIT]:
                if filter_func(item):
                    proxies.append(f"{item['ip']}:{item['port']}")
            return proxies
        except Exception as e:
            print(f"Error loading JSON {url}: {e}")
            return []
    else:
        try:
            r = requests.get(url, timeout=15)
            return [line.strip() for line in r.text.splitlines() if line.strip() and not line.startswith("#")]
        except Exception as e:
            print(f"Error loading TXT {url}: {e}")
            return []

async def test_batch(session: aiohttp.ClientSession, proxies: list[str], source_name: str, offset: int, proxy_type: str):
    tasks = [asyncio.create_task(test_single_proxy(session, p, proxy_type)) for p in proxies[:CONCURRENT]]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    results = [r for r in results if r is not None]
    successful = [r for r in results if r["status"] == "success"]
    successful.sort(key=lambda x: x["time_ms"])
    return successful

def main():
    print("🚀 Starting Proxy Tester (All GitHub Lists + SOCKS5 + Google Test) - " + datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    print("=" * 70)
    
    all_results = []
    for name, info in APIs.items():
        proxies = load_proxies(info["url"], info["format"], info["filter"], info.get("type", "http"))
        print(f"📥 Downloading {name} ({len(proxies)} proxies)...")
        
        async def run_batch():
            async with aiohttp.ClientSession() as session:
                return await test_batch(session, proxies, name, len(all_results), info.get("type", "http"))
        
        batch_results = asyncio.run(run_batch())
        all_results.extend(batch_results)
        print(f"  ✅ {len(batch_results)} successful")
    
    print("=" * 70)
    if all_results:
        all_results.sort(key=lambda x: x["time_ms"])
        print(f"\n🌟 Total good proxies found ({len(all_results)}):")
        for res in all_results[:20]:
            print(f"   {res['ip']}:{res['port']} → {res['time_ms']}ms")
        
        # ذخیره JSON
        result = {
            "total_proxies": len(all_results),
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "test_url": "https://www.google.com",
            "proxies": all_results
        }
        with open("best_proxies.json", "w") as f:
            json.dump(result, f, indent=4)
        print("💾 Saved to best_proxies.json")
    else:
        print("❌ No successful proxies found!")

if __name__ == "__main__":
    main()
