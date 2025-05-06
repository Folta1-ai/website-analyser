// index.js
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
    const metaDesc = $('meta[name="description"]').attr('con
