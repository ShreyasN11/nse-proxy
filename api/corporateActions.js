const BASE_URL = "https://www.nseindia.com";

export default async function handler(req, res) {
  try {
    const symbol = (req.query.symbol || "MASTEK").toUpperCase();

    const commonHeaders = {
      "User-Agent": "Mozilla/5.0",
      "Accept": "application/json",
      "Accept-Language": "en-US,en;q=0.9",
      "Connection": "keep-alive",
    };

    // ✅ Step 1: Get full cookies
    const session = await fetch(`${BASE_URL}/`, {
      headers: commonHeaders,
    });

    const rawCookies = session.headers.raw()["set-cookie"];

    if (!rawCookies) {
      return res.status(500).json({ error: "No cookies received" });
    }

    // ✅ Combine cookies properly
    const cookies = rawCookies.map(c => c.split(";")[0]).join("; ");

    // ✅ Step 2: Fetch corporate actions
    const url = `${BASE_URL}/api/corporates-corporateActions?index=equities&symbol=${symbol}`;

    const response = await fetch(url, {
      headers: {
        ...commonHeaders,
        "Referer":
          "https://www.nseindia.com/companies-listing/corporate-filings-actions",
        "Cookie": cookies,
      },
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