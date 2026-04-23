// Vercel Serverless Function — Yahoo Finance quote proxy
// GET /api/quote?symbols=AAPL,PTT.BK,BTC-USD
// Returns: { quotes: { [symbol]: { price, currency, marketTime, previousClose } } }

export default async function handler(req, res) {
  const symbolsParam = (req.query.symbols || req.query.symbol || "").trim();
  if (!symbolsParam) {
    res.status(400).json({ error: "symbols query required" });
    return;
  }
  const symbols = symbolsParam.split(",").map(s => s.trim()).filter(Boolean).slice(0, 30);

  const fetchOne = async (sym) => {
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=1d&range=1d`;
      const r = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "application/json",
        },
      });
      if (!r.ok) return [sym, { error: `http ${r.status}` }];
      const data = await r.json();
      const meta = data?.chart?.result?.[0]?.meta;
      if (!meta || meta.regularMarketPrice == null) return [sym, { error: "not found" }];
      return [sym, {
        price: meta.regularMarketPrice,
        previousClose: meta.chartPreviousClose ?? meta.previousClose ?? null,
        currency: meta.currency || null,
        marketTime: meta.regularMarketTime ? meta.regularMarketTime * 1000 : null,
        exchange: meta.exchangeName || null,
      }];
    } catch (e) {
      return [sym, { error: String(e?.message || e) }];
    }
  };

  const results = await Promise.all(symbols.map(fetchOne));
  const quotes = Object.fromEntries(results);

  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
  res.status(200).json({ quotes });
}
