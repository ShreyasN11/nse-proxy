import axios from "axios";
import * as cheerio from "cheerio";

const fetchBSE500Historical = async () => {
  try {
    const url = "https://www.bseindia.com/indices/IndexArchiveData.html";

    const params = new URLSearchParams({
      fmdt: "01/01/2024",   // FROM DATE (dd/mm/yyyy)
      todt: "31/01/2024",   // TO DATE
      index: "BSE500"
    });

    const response = await axios.post(url, params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://www.bseindia.com/indices/IndexArchiveData.html"
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    const result = [];

    // Find table rows
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

        // Skip header or empty rows
        if (row.date && row.date !== "Date") {
          result.push(row);
        }
      }
    });

    return result;

  } catch (error) {
    console.error("Error fetching BSE 500 data:", error.message);
    return [];
  }
};

// Run
fetchBSE500Historical().then(data => {
  console.log("BSE 500 Historical Data:");
  console.log(data.slice(0, 5)); // first 5 rows
});