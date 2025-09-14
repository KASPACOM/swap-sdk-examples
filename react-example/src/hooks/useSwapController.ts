import { useMemo, useState } from "react";
import type { SwapControllerInput, SwapControllerOutput, SwapSdkController } from "@kaspacom/swap-sdk";
import { createKaspaComSwapController, DEFAULT_SWAP_SETTINGS } from "@kaspacom/swap-sdk";

export function useSwapController() {
  const urlParams = new URLSearchParams(window.location.search);
  const partnerKey = urlParams.get("partnerKey") || undefined;

  const [state, setState] = useState<SwapControllerOutput | null>(null);
  const [inputState, setInputState] = useState<SwapControllerInput>({
    settings: DEFAULT_SWAP_SETTINGS,
  });
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const [evenstSetted, setEventSetted] = useState<boolean>(false);

  const [controller] = useState<SwapSdkController>(() =>
    createKaspaComSwapController({
      networkConfig: "kasplex-testnet",
      onChange: async (nextState: any) => setState(nextState),
      partnerKey: partnerKey,
    })
  );


  const actions = useMemo(() => {
    return {
      connectWallet: async () => {
        // Basic EIP-1193 connect for demo; SDK may also support internal connect
        // @ts-ignore
        const eth = typeof window !== "undefined" ? (window as any).ethereum : undefined;
        if (!eth) {
          alert('No wallet found');
          return;
        }


        if (!controller) {
          alert('not initialized');
        }
        const resultWalletAddress = await controller.connectWallet(eth);
        setWalletAddress(resultWalletAddress!);

        if (!evenstSetted) {
          setEventSetted(true);
          // Listen for account changes
          eth.on('accountsChanged', () => {
            actions.disconnectWallet();
          });

          // Listen for chain changes
          eth.on('chainChanged', async () => {
            const currentChainId = await eth.request({ method: 'eth_chainId' });
            if (parseInt(currentChainId, 16) !== controller.currentNetworkConfig.chainId) {
              actions.disconnectWallet();
            }
          });

          // Listen for disconnect
          eth.on('disconnect', () => {
            actions.disconnectWallet();
          });
        }


      },
      disconnectWallet: async () => {
        controller?.disconnectWallet();
        setWalletAddress(null);
      },
      setInput: (input: SwapControllerInput) => {
        const newInput = {
          ...inputState,
          ...input,
        }
        setInputState(newInput);
        controller?.setData(newInput);
      }
    };
  }, []);

  return { controller, state, connectWallet: actions.connectWallet, disconnectWallet: actions.disconnectWallet, setInput: actions.setInput, inputState, walletAddress, partnerKey } as const;
} 