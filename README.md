# Worker VPN Proxy Tester

A Python proxy checker that downloads public proxy lists, tests them against Google, and writes the fastest working proxies to `best_proxies.json`.

## Features

- Loads HTTP, HTTPS, SOCKS4, and SOCKS5 proxies from public sources.
- Tests proxies concurrently with `aiohttp`.
- Sorts successful proxies by response time.
- Saves all successful results as JSON.
- Includes a GitHub Actions workflow for scheduled or manual runs.

## Requirements

- Python 3.11 or newer
- Network access to the configured proxy list sources and `https://www.google.com`

Install dependencies:

```bash
pip install -r requirements.txt
```

## Usage

Run the proxy tester locally:

```bash
python main.py
```

When successful proxies are found, the script creates:

```text
best_proxies.json
```

The JSON file contains:

- `total_proxies`: number of working proxies found
- `timestamp`: time the test completed
- `test_url`: URL used for testing
- `proxies`: sorted proxy results, fastest first

Example result entry:

```json
{
  "status": "success",
  "ip": "203.0.113.10",
  "port": "8080",
  "time_ms": 245.6,
  "proxy_str": "203.0.113.10:8080"
}
```

## Configuration

The main settings are defined near the top of `main.py`:

```python
CONCURRENT = 200
BATCH_SIZE = 400
PROXY_LIMIT = 600
```

Proxy sources are configured in the `APIs` dictionary in `main.py`. Each source defines:

- `url`: source URL
- `format`: `json` or `txt`
- `filter`: source-specific filter function
- `type`: proxy protocol, such as `http`, `https`, `socks4`, or `socks5`

## GitHub Actions

The workflow at `.github/workflows/proxy-tester.yml`:

- Runs daily at `02:00 UTC`
- Can be started manually with `workflow_dispatch`
- Installs Python dependencies
- Runs `python main.py`
- Commits and pushes `best_proxies.json` back to the repository when the file is generated or changed

The workflow uses `contents: write` permission so GitHub Actions can update the JSON file in the project. Because `best_proxies.json` may be ignored by `.gitignore`, the workflow force-adds that file with `git add -f best_proxies.json`.

## Notes

Public proxy lists are unreliable by nature. Results can change on every run, and many proxies may fail, be slow, or disappear quickly.
