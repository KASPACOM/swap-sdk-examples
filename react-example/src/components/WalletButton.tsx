import { shortenAddress } from "../utils/format";

export function WalletButton({ connected, address, onConnect, onDisconnect }: { connected: boolean; address?: string; onConnect: () => void; onDisconnect: () => void }) {
  if (connected) {
    return (
      <button onClick={onDisconnect}>
        Disconnect {shortenAddress(address)}
      </button>
    );
  }
  return <button onClick={onConnect}>Connect Wallet</button>;
} 