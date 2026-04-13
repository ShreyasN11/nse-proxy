import fetch from "node-fetch";

const BASE_URL = "https://www.nseindia.com";

export default async function handler(req, res) {
  try {
    // ✅ Get symbol from query
    const symbol = (req.query.symbol || "MASTEK").toUpperCase();

    const headers = {
      "User-Agent": "Mozilla/5.0",
      "Accept": "application/json",
      "Referer": `${BASE_URL}/get-quote/equity/${symbol}`,
    };

    // ✅ Step 1: Get cookies
    const homeRes = await fetch(BASE_URL, { headers });
    const cookies = homeRes.headers.get("set-cookie");

    // ❌ If cookies missing → fail early
    if (!cookies) {
      return res.status(500).json({ error: "Failed to get NSE cookies" });
    }

    // ✅ Step 2: Fetch corporate actions
    const apiUrl = `${BASE_URL}/api/corporates-corporateActions?index=equities&symbol=${symbol}`;

    const apiRes = await fetch(apiUrl, {
      headers: {
        ...headers,
        Cookie: cookies,
      },
    });

    // Debug
    if (apiRes.status !== 200) {
      const text = await apiRes.text();
      return res.status(apiRes.status).json({
        error: "NSE API failed",
        details: text,
      });
    }

    const data = await apiRes.json();

    // ✅ Send clean response
    return res.status(200).json({
      symbol,
      count: data?.data?.length || 0,
      data: data?.data || [],
    });

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}