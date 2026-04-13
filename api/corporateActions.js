const BASE_URL = "https://www.nseindia.com";

export default async function handler(req, res) {
  try {
    const symbol = (req.query.symbol || "RELIANCE").toUpperCase();

    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "Accept": "application/json",
      "Accept-Language": "en-US,en;q=0.9",
      "Connection": "keep-alive",
    };

    // 🔥 STEP 1: First request (homepage)
    const home = await fetch(BASE_URL, { headers });

    const cookie1 = home.headers.get("set-cookie") || "";

    // 🔥 STEP 2: Second request (important!)
    const market = await fetch(`${BASE_URL}/api/marketStatus`, {
      headers: {
        ...headers,
        Cookie: cookie1,
      },
    });

    const cookie2 = market.headers.get("set-cookie") || "";

    // ✅ Merge cookies
    const combinedCookies = (cookie1 + "," + cookie2)
      .split(",")
      .map(c => c.split(";")[0])
      .filter(Boolean)
      .join("; ");

    if (!combinedCookies) {
      return res.status(500).json({ error: "Failed to obtain NSE cookies" });
    }

    // ⏳ Small delay helps bypass bot detection
    await new Promise(r => setTimeout(r, 550));

    // 🔥 STEP 3: Actual API call
    const url = `${BASE_URL}/api/corporates-corporateActions?index=equities&symbol=${symbol}`;

    const response = await fetch(url, {
      headers: {
        ...headers,
        "Referer":
          "https://www.nseindia.com/companies-listing/corporate-filings-actions",
        "Cookie": combinedCookies,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({
        error: "API failed",
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
    return res.status(500).json({ error: err.message });
  }
}