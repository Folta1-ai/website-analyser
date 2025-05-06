const express = require("express");
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

async function analyzeWebsite(url) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    const start = Date.now();
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
    const loadTime = (Date.now() - start) / 1000;

    const html = await page.content();
    const $ = cheerio.load(html);

    const title = $('title').text() || "No title found";
    const metaDesc = $('meta[name="description"]').attr('content') || "No meta description";

    const headings = [];
    $('h1, h2, h3').each((i, el) => headings.push({ tag: el.name, text: $(el).text().trim() }));

    const largeImages = await page.$$eval('img', imgs =>
      imgs
        .map(img => ({ src: img.src, width: img.naturalWidth, height: img.naturalHeight }))
        .filter(img => img.width * img.height > 500000)
    );

    await browser.close();

    return {
      title,
      metaDesc,
      headings,
      loadTime,
      largeImages
    };
  } catch (error) {
    await browser.close();
    return { error: "Analysis failed. Check URL or try again later." };
  }
}

app.post("/analyze", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "No URL provided." });
  const result = await analyzeWebsite(url);
  res.json(result);
});

app.get("/", (req, res) => {
  res.send("Website Analyzer API is running.");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
