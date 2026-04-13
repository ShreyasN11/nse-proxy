import axios from "axios";
import * as cheerio from "cheerio";

export default async function handler(req, res) {
  try {
    const url = "https://www.bseindia.com/indices/IndexArchiveData.html";

    // Get query params or default
    const from = req.query.from || "01/01/2024";
    const to = req.query.to || "31/01/2024";

    const params = new URLSearchParams({
      fmdt: from,
      todt: to,
      index: "BSE500"
    });

    // Create axios instance (for cookies)
    const instance = axios.create({
      withCredentials: true
    });

    // Step 1: hit homepage to get cookies
    await instance.get("https://www.bseindia.com", {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    // Step 2: actual POST request
    const response = await instance.post(url, params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://www.bseindia.com/indices/IndexArchiveData.html"
      }
    });

    const $ = cheerio.load(response.data);
    const result = [];

    $("table tr").each((i, el) => {
      const cols = $(el).find("td");

      if (cols.length > 0) {
        const row = {
          date: $(cols[0]).text().trim(),
          open: $(cols[1]).text().trim(),
          high: $(cols[2]).text().trim(),
          low: $(cols[3]).text().trim(),
          close: $(cols[4]).text().trim()
        };

        if (row.date && row.date !== "Date") {
          result.push(row);
        }
      }
    });

    return res.status(200).json({
      success: true,
      count: result.length,
      data: result
    });

  } catch (error) {
    console.error("Error fetching BSE 500 data:", error.message);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}