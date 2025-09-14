import { useEffect, useState } from "react";
import "./App.css";
import { useSwapController } from "./hooks/useSwapController";
import { WalletButton } from "./components/WalletButton";
import { SettingsModal } from "./components/SettingsModal";
import { LoaderStatuses, type Erc20Token } from "@kaspacom/swap-sdk";
import { SwapForm } from "./components/SwapForm";

export const KAS_TOKEN = {
  address: "0x0000000000000000000000000000000000000000",
  symbol: "KAS",
  name: "Kaspa",
  decimals: 18,
};

function App() {
  const {
    controller,
    state,
    setInput,
    connectWallet,
    disconnectWallet,
    inputState,
    walletAddress,
    partnerKey,
  } = useSwapController();

  const [allTokens, setAllTokens] = useState<Erc20Token[]>([]);
  const [loadingTokens, setLoadingTokens] = useState<boolean>(false);

  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [partnerFee, setPartnerFee] = useState<number | undefined>();
  const [partnerKeyInput, setPartnerKeyInput] = useState<string>("");

  controller.getPartnerFee().then(setPartnerFee);

  const changePartnerKey = (addPartnerKey: boolean) => {
    if (addPartnerKey) {
      if (!/^0x[0-9a-fA-F]{64}$/.test(partnerKeyInput)) {
        alert("Invalid partner key");
        return;
      }

      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set("partnerKey", partnerKeyInput?.toString());
      window.history.replaceState({}, "", currentUrl.toString());
      window.location.reload();
    } else {
      window.location.reload();
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.delete("partnerKey");
      window.history.replaceState({}, "", currentUrl.toString());
      window.location.reload();
    }
  };

  const bytes32ToString = (hex: string) => {
    const bytes = hex
      .slice(2)
      .match(/.{1,2}/g)
      ?.map((x) => parseInt(x, 16));
    return new TextDecoder().decode(new Uint8Array(bytes!)).replace(/\0+$/, "");
  };

  useEffect(() => {
    if (!controller) return;
    (async () => {
      setLoadingTokens(true);
      try {
        const tokens = await controller.getTokensFromGraph(1000);
        // Pushing kas, the default chain token
        tokens.unshift(KAS_TOKEN);
        setAllTokens(tokens);
      } finally {
        setLoadingTokens(false);
      }
    })();
  }, [controller]);

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h2>Swap Demo</h2>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            aria-label="settings"
            title="Settings"
            onClick={() => setSettingsOpen(true)}
          >
            ⚙️
          </button>
          <WalletButton
            connected={!!walletAddress}
            address={walletAddress || undefined}
            onConnect={connectWallet}
            onDisconnect={disconnectWallet}
          />
        </div>
      </div>

      {loadingTokens && <div>Loading tokens…</div>}

      {!loadingTokens && controller && (
        <div
          style={{ border: "1px solid #333", borderRadius: 12, padding: 16 }}
        >
          <SwapForm
            controller={controller}
            tokens={allTokens}
            inputState={inputState}
            outputState={state}
          />

          {state?.loader == LoaderStatuses.CALCULATING_QUOTE && (
            <div>Loading quote…</div>
          )}
          {state?.tradeInfo && (
            <div style={{ color: "#aaa", fontSize: 14, marginTop: 8 }}>
              {state.computed?.minAmountOut !== undefined && (
                <div>Min received: {state.computed?.minAmountOut}</div>
              )}
              {state.tradeInfo.route && (
                <div>
                  Route:{" "}
                  {state.tradeInfo.route.path.map((t) => t.symbol).join(" → ")}
                </div>
              )}
            </div>
          )}

          <div>Uniswap protocol fee: 1%</div>
          <div>
            Partner Fee:{" "}
            {partnerFee == undefined ? "Loading..." : partnerFee + "%"}
          </div>

          <button
            disabled={
              !state?.computed?.amountOut || !!state.loader || !walletAddress
            }
            onClick={async () => {
              if (state?.loader) {
                return;
              }
              // Depending on the SDK, this might be controller.swap() or controller.executeSwap(); adjust when available
              try {
                // @ts-ignore
                const tx = await controller.swap();
                if (tx) alert(`Submitted tx: ${tx}`);
              } catch (e) {
                // User Canceled
                if ((e as any)?.info?.error?.code === 4001) {
                  return;
                }

                alert(`Swap failed`);
              }

              controller.calculateQuoteIfNeeded();
            }}
            style={{ marginTop: 12 }}
          >
            {state?.loader === LoaderStatuses.CALCULATING_QUOTE
              ? "Calculating quote…"
              : state?.loader === LoaderStatuses.SWAPPING
              ? "Swapping…"
              : state?.loader === LoaderStatuses.APPROVING
              ? "Approving..."
              : "Swap"}
          </button>
        </div>
      )}

      <SettingsModal
        open={settingsOpen}
        initial={inputState.settings!}
        onClose={() => setSettingsOpen(false)}
        onSave={(s) => {
          setInput({ settings: s });
          setSettingsOpen(false);
        }}
      />

      {partnerKey ? (
        <div
          style={{
            width: 335,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            alignItems: "center",
            marginTop: 16,
          }}
        >
          <div style={{ wordBreak: "break-all" }}>
            Partner Key: {partnerKey} ({bytes32ToString(partnerKey)})
          </div>
          <div>
            <button onClick={() => changePartnerKey(false)}>
              Remove Partner Key
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              marginTop: 16,
            }}
          >
            <label>Set Partner Key:</label>
            <input
              type="text"
              placeholder="0x0000000000000000000000000000000000000000000000000000000000000000 "
              value={partnerKeyInput}
              onChange={(e) => setPartnerKeyInput(e.target.value)}
              style={{ padding: 8 }}
            />
            <button onClick={() => changePartnerKey(true)}>Save</button>
          </div>
          <div style={{ color: "#aaa", fontSize: 14, marginTop: 8 }}>
            Partner fee will be updated after saving the partner key.
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
