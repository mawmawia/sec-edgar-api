module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  
  try {
    const { ticker } = req.query;
    if (!ticker) return res.status(400).json({ error: 'Missing ?ticker= parameter. Ex: AAPL' });

    // SEC EDGAR API - Company facts by ticker
    const cikLookup = await fetch(`https://www.sec.gov/files/company_tickers.json`, {
      headers: { 'User-Agent': 'mawia.steve094@gmail.com'} // SEC requires User-Agent
    });
    const companies = await cikLookup.json();
    const company = Object.values(companies).find(c => c.ticker === ticker.toUpperCase());
    
    if (!company) return res.status(404).json({ error: 'Ticker not found' });
    
    const cik = company.cik_str.toString().padStart(10, '0');
    const factsUrl = `https://data.sec.gov/api/xbrl/companyfacts/CIK${cik}.json`;
    
    const factsRes = await fetch(factsUrl, {
      headers: { 'User-Agent': 'mawia.steve094@gmail.com'}
    });
    const facts = await factsRes.json();

    return res.json({
      ticker: company.ticker,
      name: company.title,
      cik: cik,
      facts: facts.facts // Full financials JSON
    });
    
  } catch (error) {
    return res.status(500).json({ error: 'SEC API failed', details: error.message });
  }
};
