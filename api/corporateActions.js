const BASE_URL = "https://www.nseindia.com";

export default async function handler(req, res) {
  try {
    const symbol = (req.query.symbol || "MASTEK").toUpperCase();

    const headers = {
      "User-Agent": "Mozilla/5.0",
      "Accept": "application/json",
      "Accept-Language": "en-US,en;q=0.9",
      "Connection": "keep-alive",
    };

    // ✅ Step 1: Get cookies
    const session = await fetch(`${BASE_URL}/`, { headers });

    const cookieHeader = session.headers.get("set-cookie");

    if (!cookieHeader) {
      return res.status(500).json({ error: "No cookies received" });
    }

    const cookies = cookieHeader
      .split(",")
      .map(c => c.split(";")[0])
      .join("; ");

    // Optional delay (helps NSE sometimes)
    await new Promise(r => setTimeout(r, 300));

    // ✅ Step 2: Fetch corporate actions
    const url = `${BASE_URL}/api/corporates-corporateActions?index=equities&symbol=${symbol}`;

    const response = await fetch(url, {
      headers: {
        ...headers,
        "Referer":
          "https://www.nseindia.com/companies-listing/corporate-filings-actions",
        "Cookie": cookies,
      },
    });

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