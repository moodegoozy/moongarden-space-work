import React, { useState } from "react";

const SimpleSearchBar: React.FC = () => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex justify-center my-6">
      <input
        type="text"
        className="border border-gray-300 rounded-l px-4 py-2 w-64 focus:outline-none"
        placeholder="ابحث عن غرفة أو فيلا..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        dir="auto"
      />
      <button
        type="submit"
        className="bg-black text-white rounded-r px-6 py-2 hover:bg-gray-800 transition-colors"
      >
        بحث
      </button>
    </form>
  );
};

export default SimpleSearchBar;
