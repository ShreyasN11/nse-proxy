export default async function handler(req, res) {
  try {
    const base = "https://www.nseindia.com";

    // Accept multiple symbols: ?symbols=RELIANCE,TCS,INFY
    const symbolsParam = req.query.symbols || "RELIANCE";
    const symbols = symbolsParam.split(",");

    const from = req.query.from || "01-01-2025";
    const to = req.query.to || "31-12-2025";

    // Step 1: Get session cookies
    const session = await fetch(`${base}/api/marketStatus`, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json"
      }
    });

    const cookies = session.headers.get("set-cookie");

    const results = {};

    // Step 2: Loop all symbols
    for (const symbol of symbols) {
      try {
        const url = `${base}/api/historicalOR/generateSecurityWiseHistoricalData?from=${from}&to=${to}&symbol=${symbol}&type=priceVolumeDeliverable&series=EQ`;

        const response = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0",
            "Referer": "https://www.nseindia.com/",
            "Cookie": cookies,
            "Accept": "application/json"
          }
        });

        if (!response.ok) {
          results[symbol] = { error: `HTTP ${response.status}` };
          continue;
        }

        const data = await response.json();
        results[symbol] = data;

        // 🔒 Prevent NSE rate limit
        await new Promise(r => setTimeout(r, 500));

      } catch (err) {
        results[symbol] = { error: err.message };
      }
    }

    res.status(200).json(results);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}