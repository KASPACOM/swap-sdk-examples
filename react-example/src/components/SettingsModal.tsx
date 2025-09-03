import type { SwapSettings } from "@kaspacom/swap-sdk";
import { useState } from "react";

export function SettingsModal({ open, initial, onClose, onSave }: { open: boolean; initial: Partial<SwapSettings>; onClose: () => void; onSave: (s: SwapSettings) => void }) {
  const [maxSlippage, setMaxSlippage] = useState<string>(initial.maxSlippage!);
  const [swapDeadline, setSwapDeadline] = useState<number>(initial.swapDeadline!);

  if (!open) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "#0008", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: "#1a1a1a", color: "#fff", width: 380, maxWidth: "90%", borderRadius: 12, padding: 16 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>Settings</h3>
          <button onClick={onClose}>✕</button>
        </div>
        <div style={{ display: "grid", gap: 12 }}>
          <label>
            <div>Slippage tolerance (%)</div>
            <input
              type="number"
              value={maxSlippage}
              onChange={(e) => setMaxSlippage(e.target.value)}
              step="0.1"
              min="0"
              style={{ width: "100%", padding: 8 }}
            />
          </label>
          <label>
            <div>Tx deadline (minutes)</div>
            <input
              type="number"
              value={swapDeadline.toString()}
              onChange={(e) => setSwapDeadline(Math.max(0, Math.round(parseFloat(e.target.value || "0"))))}
              step="1"
              min="0"
              style={{ width: "100%", padding: 8 }}
            />
          </label>
          <button onClick={() => onSave({ maxSlippage, swapDeadline })} style={{ marginTop: 8 }}>Save</button>
        </div>
      </div>
    </div>
  );
} 