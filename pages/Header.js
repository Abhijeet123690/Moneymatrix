// ✅ money-matrix/components/Header.js
export default function Header() {
  return (
    <header className="bg-gradient-to-r from-blue-700 to-blue-500 p-4 shadow-md text-white">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">Money Matrix</h1>
        <div className="flex gap-2">
          <button className="border px-3 py-1 rounded">Login</button>
          <button className="bg-white text-blue-600 px-3 py-1 rounded">Premium</button>
        </div>
      </div>
    </header>
  );
}
