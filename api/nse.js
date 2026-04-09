export default async function handler(req, res) {
  try {
    const base = "https://www.nseindia.com";

    const symbolsParam = req.query.symbols || "RELIANCE";
    const symbols = symbolsParam.split(",");

    const currentYear = new Date().getFullYear();

    // Last 5 years
    const years = [];
    for (let i = 0; i < 5; i++) {
      years.push(currentYear - i);
    }

    // Step 1: Get session cookies
    const session = await fetch(`${base}/api/marketStatus`, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json"
      }
    });

    const cookies = session.headers.get("set-cookie");

    const results = {};

    // Step 2: Loop symbols
    for (const symbol of symbols) {
      let combinedData = [];

      try {
        // 🔁 Loop years
        for (const year of years) {
          try {
            const from = `01-01-${year}`;
            const to = `31-12-${year}`;

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
              console.log(`❌ ${symbol} ${year} failed`);
              continue;
            }

            const data = await response.json();

            if (data?.data) {
              combinedData = combinedData.concat(data.data);
            }

            // 🔒 Rate limit protection
            await new Promise(r => setTimeout(r, 400));

          } catch (err) {
            console.log(`🔥 Error ${symbol} ${year}`, err.message);
          }
        }

        results[symbol] = { data: combinedData };

      } catch (err) {
        results[symbol] = { error: err.message };
      }
    }

    res.status(200).json(results);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}