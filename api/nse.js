export default async function handler(req, res) {
  try {
    const symbol = req.query.symbol || "RELIANCE";

    const base = "https://www.nseindia.com";

    // Step 1: Get session cookies
    const session = await fetch(`${base}/api/marketStatus`, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json"
      }
    });

    const cookies = session.headers.get("set-cookie");

    // Step 2: Fetch historical data
    const url = `${base}/api/historicalOR/generateSecurityWiseHistoricalData?from=01-01-2025&to=31-12-2025&symbol=${symbol}&type=priceVolumeDeliverable&series=EQ`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://www.nseindia.com/",
        "Cookie": cookies,
        "Accept": "application/json"
      }
    });

    const data = await response.json();

    res.status(200).json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}