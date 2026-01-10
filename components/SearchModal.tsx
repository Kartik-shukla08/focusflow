// components/SearchModal.tsx
import React, { useEffect, useState } from "react";
import { invidiousFetch } from "../lib/invidiousFetch";

type VideoResult = {
  videoId: string;
  title: string;
  author: string;
  lengthSeconds?: number;
  videoThumbnails?: { url: string }[];
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (video: VideoResult) => void;
  placeholder?: string;
};

export default function SearchModal({ isOpen, onClose, onSelect, placeholder }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<VideoResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setErr(null);
      return;
    }
    const t = setTimeout(async () => {
      setLoading(true);
      setErr(null);
      try {
        // Invidious search returns an array of results
        const data = await invidiousFetch<VideoResult[]>(
          `/api/v1/search?q=${encodeURIComponent(query)}&type=video`
        );
        setResults(data || []);
      } catch (e) {
        console.error(e);
        setErr("Search failed. Try again.");
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(t);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl bg-neutral-900 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder || "Search YouTube (e.g. lofi hip hop)"}
            className="flex-1 bg-neutral-800 p-3 rounded text-sm outline-none"
          />
          <button onClick={onClose} className="text-sm opacity-70">Close</button>
        </div>

        <div className="mt-3 max-h-96 overflow-y-auto">
          {loading && <p className="text-xs text-gray-400">Searching...</p>}
          {err && <p className="text-xs text-red-400">{err}</p>}

          {results.map((v) => (
            <div
              key={v.videoId}
              onClick={() => {
                onSelect(v);
                onClose();
              }}
              className="flex gap-3 items-center px-2 py-2 rounded hover:bg-neutral-800 cursor-pointer"
            >
              <img
                src={v.videoThumbnails?.[0]?.url ?? `https://img.youtube.com/vi/${v.videoId}/mqdefault.jpg`}
                alt={v.title}
                className="w-24 h-14 object-cover rounded"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{v.title}</div>
                <div className="text-xs text-gray-400 truncate">{v.author} • {v.lengthSeconds ? `${Math.floor((v.lengthSeconds||0)/60)}:${String((v.lengthSeconds||0)%60).padStart(2,'0')}` : ""}</div>
              </div>
            </div>
          ))}

          {!loading && !results.length && query.trim() && !err && (
            <p className="text-xs text-gray-500 p-2">No results</p>
          )}
        </div>
      </div>
    </div>
  );
}
