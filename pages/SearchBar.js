// ✅ money-matrix/components/SearchBar.js
import { useState } from 'react';

export default function SearchBar({ onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async (e) => {
    const val = e.target.value;
    setQuery(val);

    if (val.length < 2) return setResults([]);
    const res = await fetch(`/api/search?keywords=${val}`);
    const data = await res.json();
    setResults(data.bestMatches || []);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={handleSearch}
        placeholder="Search stocks..."
        className="w-full px-4 py-2 border rounded bg-slate-800 text-white"
      />
      {results.length > 0 && (
        <div className="absolute z-10 bg-white text-black w-full mt-1 rounded shadow">
          {results.map((item) => (
            <div
              key={item['1. symbol']}
              onClick={() => {
                onSelect(item['1. symbol'], item['2. name']);
                setResults([]);
                setQuery('');
              }}
              className="p-2 hover:bg-gray-100 cursor-pointer"
            >
              <strong>{item['1. symbol']}</strong> - {item['2. name']}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
