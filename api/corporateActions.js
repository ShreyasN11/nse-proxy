const BASE_URL = "https://www.nseindia.com";

export default async function handler(req, res) {
  try {
    const symbol = (req.query.symbol || "MASTEK").toUpperCase();

    const headers = {
      "User-Agent": "Mozilla/5.0",
      "Accept": "application/json",
      "Referer": `${BASE_URL}/get-quote/equity/${symbol}`,
      "Accept-Language": "en-US,en;q=0.9",
      "Connection": "keep-alive",
    };

    // ✅ Step 1: Establish session (same as your working code)
    const session = await fetch(`${BASE_URL}/api/marketStatus`, {
      headers
    });

    const cookies = session.headers.get("set-cookie");

    if (!cookies) {
      return res.status(500).json({ error: "Failed to establish NSE session" });
    }

    // ✅ Step 2: Fetch corporate actions
    const url = `${BASE_URL}/api/corporates-corporateActions?index=equities&symbol=${symbol}`;

    const response = await fetch(url, {
      headers: {
        ...headers,
        Cookie: cookies,
      }
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({
        error: "Corporate actions fetch failed",
        details: text,
      });
    }

    const data = await response.json();

    return res.status(200).json({
      symbol,
      count: data?.data?.length || 0,
      data: data?.data || [],
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}