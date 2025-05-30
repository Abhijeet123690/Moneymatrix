// ✅ money-matrix/pages/api/daily.js
export default async function handler(req, res) {
  const { symbol } = req.query;
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=compact&apikey=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();

  res.status(200).json(data);
}
