// DOM elements
const searchInput = document.querySelector('#stock-search');
const searchResults = document.querySelector('#search-results');
const stockSymbol = document.querySelector('#stock-symbol');
const stockName = document.querySelector('#stock-name');
const stockPrice = document.querySelector('#stock-price');
const stockChange = document.querySelector('#stock-change');
const statOpen = document.querySelector('#stat-open');
const statHigh = document.querySelector('#stat-high');
const statLow = document.querySelector('#stat-low');
const statVolume = document.querySelector('#stat-volume');
const chartContainer = document.querySelector('#chart-container');
const stockChart = document.querySelector('#stockChart');

// Cache for API responses
const cache = {
  data: {},
  
  // Set cache with expiration
  set(key, value, ttlMinutes = 15) {
    const expiresAt = Date.now() + (ttlMinutes * 60 * 1000);
    this.data[key] = { value, expiresAt };
  },
  
  // Get from cache if not expired
  get(key) {
    const item = this.data[key];
    if (!item) return null;
    
    if (Date.now() > item.expiresAt) {
      delete this.data[key];
      return null;
    }
    
    return item.value;
  }
};

// API functions
async function getStockQuote(symbol) {
  const cacheKey = `quote_${symbol}`;
  const cachedData = cache.get(cacheKey);
  
  if (cachedData) {
    console.log(`Using cached data for ${symbol}`);
    return cachedData;
  }
  
  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${config.ALPHA_VANTAGE_API_KEY}`
    );
    const data = await response.json();
    
    if (data['Error Message']) {
      throw new Error(data['Error Message']);
    }
    
    // Cache for 5 minutes (quotes change frequently)
    cache.set(cacheKey, data['Global Quote'], 5);
    
    return data['Global Quote'];
  } catch (error) {
    console.error('Error fetching stock quote:', error);
    throw error;
  }
}

async function searchStocks(keywords) {
  if (keywords.length < 2) return [];
  
  const cacheKey = `search_${keywords}`;
  const cachedData = cache.get(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }
  
  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${keywords}&apikey=${config.ALPHA_VANTAGE_API_KEY}`
    );
    const data = await response.json();
    
    if (data['Error Message']) {
      throw new Error(data['Error Message']);
    }
    
    const results = data.bestMatches || [];
    cache.set(cacheKey, results, 60); // Cache for 1 hour
    
    return results;
  } catch (error) {
    console.error('Error searching stocks:', error);
    return [];
  }
}

async function getStockDaily(symbol) {
  const cacheKey = `daily_${symbol}`;
  const cachedData = cache.get(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }
  
  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=compact&apikey=${config.ALPHA_VANTAGE_API_KEY}`
    );
    const data = await response.json();
    
    if (data['Error Message']) {
      throw new Error(data['Error Message']);
    }
    
    cache.set(cacheKey, data, 60); // Cache for 1 hour
    
    return data;
  } catch (error) {
    console.error('Error fetching daily data:', error);
    throw error;
  }
}

// UI functions
function updateStockInfo(quote) {
  if (!quote) return;
  
  stockPrice.textContent = `$${parseFloat(quote['05. price']).toFixed(2)}`;
  
  const change = parseFloat(quote['09. change']);
  const changePercent = parseFloat(quote['10. change percent']);
  
  stockChange.textContent = `${change > 0 ? '+' : ''}${change.toFixed(2)} (${changePercent.toFixed(2)}%)`;
  
  if (change > 0) {
    stockChange.classList.add('positive');
    stockChange.classList.remove('negative');
  } else {
    stockChange.classList.add('negative');
    stockChange.classList.remove('positive');
  }
  
  statOpen.textContent = `$${parseFloat(quote['02. open']).toFixed(2)}`;
  statHigh.textContent = `$${parseFloat(quote['03. high']).toFixed(2)}`;
  statLow.textContent = `$${parseFloat(quote['04. low']).toFixed(2)}`;
  statVolume.textContent = parseInt(quote['06. volume']).toLocaleString();
}

function displaySearchResults(results) {
  searchResults.innerHTML = '';
  
  if (!results.length) {
    searchResults.classList.add('hidden');
    return;
  }
  
  searchResults.classList.remove('hidden');
  
  results.forEach(item => {
    const resultItem = document.createElement('div');
    resultItem.className = 'p-2 hover:bg-gray-100 cursor-pointer';
    resultItem.innerHTML = `
      
${item['1. symbol']}


      
${item['2. name']}


    `;
    
    resultItem.addEventListener('click', () => {
      searchInput.value = item['2. name'];
      searchResults.classList.add('hidden');
      loadStockData(item['1. symbol'], item['2. name']);
    });
    
    searchResults.appendChild(resultItem);
  });
}

function updateStockChart(timeSeriesData) {
  if (!timeSeriesData || !timeSeriesData['Time Series (Daily)']) return;
  
  const timeSeries = timeSeriesData['Time Series (Daily)'];
  const dates = Object.keys(timeSeries).slice(0, 30).reverse();
  const prices = dates.map(date => parseFloat(timeSeries[date]['4. close']));
  
  // Destroy previous chart if it exists
  if (window.stockChartInstance) {
    window.stockChartInstance.destroy();
  }
  
  // Create new chart
  const ctx = stockChart.getContext('2d');
  window.stockChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: 'Stock Price',
        data: prices,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        tension: 0.1,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `$${context.raw.toFixed(2)}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            maxTicksLimit: 10
          }
        },
        y: {
          beginAtZero: false
        }
      }
    }
  });
}

// Main functions
async function loadStockData(symbol, name) {
  try {
    stockSymbol.textContent = symbol;
    stockName.textContent = name || symbol;
    
    // Get current quote
    const quote = await getStockQuote(symbol);
    updateStockInfo(quote);
    
    // Get historical data for chart
    const timeSeriesData = await getStockDaily(symbol);
    updateStockChart(timeSeriesData);
    
  } catch (error) {
    console.error(`Failed to load data for ${symbol}:`, error);
  }
}

// Event listeners
searchInput.addEventListener('input', debounce(async (e) => {
  const query = e.target.value.trim();
  if (query.length < 2) {
    searchResults.innerHTML = '';
    searchResults.classList.add('hidden');
    return;
  }
  
  try {
    const results = await searchStocks(query);
    displaySearchResults(results);
  } catch (error) {
    console.error('Search error:', error);
  }
}, 300));

// Click outside search results to close
document.addEventListener('click', (e) => {
  if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
    searchResults.classList.add('hidden');
  }
});

// Helper function for debouncing
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Initialize with default stock
document.addEventListener('DOMContentLoaded', () => {
  loadStockData('AAPL', 'Apple Inc.');
});
