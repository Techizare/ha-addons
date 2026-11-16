FROM python:3.12-slim-bookworm

# Libraries the Camoufox (Firefox) browser needs to run headless. It is only used to sign in.
RUN apt-get update && apt-get install -y --no-install-recommends \
      libgtk-3-0 libdbus-glib-1-2 libx11-xcb1 libxt6 libxtst6 libasound2 libpci3 \
      libxcomposite1 libxdamage1 libxrandr2 libgbm1 fonts-liberation ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir "woolies-nz-cli==0.1.1" "aiohttp>=3.9,<4" \
    && python -m camoufox fetch

COPY bridge.py /bridge.py
CMD ["python", "-u", "/bridge.py"]
