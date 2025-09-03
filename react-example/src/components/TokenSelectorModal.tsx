import { useMemo, useState } from "react";
import type { Erc20Token } from "@kaspacom/swap-sdk";

export function TokenSelectorModal({ open, tokens, onClose, onSelect }: { open: boolean; tokens: Erc20Token[]; onClose: () => void; onSelect: (t: Erc20Token) => void }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tokens;
    return tokens.filter((t) =>
      t.symbol.toLowerCase().includes(q) ||
      t.name.toLowerCase().includes(q) ||
      t.address.toLowerCase().includes(q)
    );
  }, [query, tokens]);

  if (!open) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "#0008", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: "#1a1a1a", color: "#fff", width: 480, maxWidth: "90%", borderRadius: 12, padding: 16 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>Select a token</h3>
          <button onClick={onClose}>✕</button>
        </div>
        <input
          placeholder="Search name, symbol, or address"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 12 }}
        />
        <div style={{ maxHeight: 360, overflow: "auto" }}>
          {filtered.map((t) => (
            <button key={t.address} style={{ width: "100%", textAlign: "left", padding: 10, borderBottom: "1px solid #333" }} onClick={() => onSelect(t)}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {t.logoURI ? <img src={t.logoURI} alt={t.symbol} style={{ width: 24, height: 24, borderRadius: 12 }} /> : <div style={{ width: 24, height: 24, borderRadius: 12, background: "#333" }} />}
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span>{t.symbol}</span>
                  <small style={{ color: "#aaa" }}>{t.name}</small>
                </div>
                <small style={{ color: "#777", marginLeft: "auto" }}>{t.address}</small>
              </div>
            </button>
          ))}
          {filtered.length === 0 && <div style={{ padding: 16, textAlign: "center", color: "#aaa" }}>No tokens</div>}
        </div>
      </div>
    </div>
  );
} 