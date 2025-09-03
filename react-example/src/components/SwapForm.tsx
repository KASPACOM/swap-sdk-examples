import { useEffect, useState } from "react";
import {
  type SwapSdkController,
  type Erc20Token,
  type SwapControllerInput,
  type SwapControllerOutput,
  LoaderStatuses,
} from "@kaspacom/swap-sdk";
import { KAS_TOKEN } from "../App";
import { TokenSelectorModal } from "./TokenSelectorModal";
import { useDebounce } from "use-debounce";

export const CALCULATING = "Calculating...";
export const PLEASE_SELECT_TOKEN = "Please select tokens";
export const PLEASE_ENTER_AMOUNT = "Please enter amount";

export function SwapForm({
  controller,
  tokens,
  inputState,
  outputState,
}: {
  controller: SwapSdkController;
  tokens: Erc20Token[];
  inputState: SwapControllerInput;
  outputState: SwapControllerOutput | null;
}) {
  const [fromToken, setFromToken] = useState<Erc20Token | null>(
    KAS_TOKEN ?? null
  );
  const [toToken, setToToken] = useState<Erc20Token | null>(null);

  const [amount, setAmount] = useState<string>("");
  const [isOutputAmount, setIsOutputAmount] = useState<boolean>(false);
  const [tokenModalOpen, setTokenModalOpen] = useState<false | "from" | "to">(
    false
  );

  const [isInputChanged, setIsInputChanged] = useState<boolean>(false);

  const [debouncedAmount] = useDebounce(amount, 400);
  const [debouncedIsOutputAmount] = useDebounce(isOutputAmount, 400);

  const openTokenModal = (side: "from" | "to") => {
    setTokenModalOpen(side);
  };

  const setToAmountWithInput = (input: string) => {
    setIsInputChanged(true);
    setAmount(input);
    setIsOutputAmount(true);
  };

  const setFromAmountWithInput = (input: string) => {
    setIsInputChanged(true);
    setAmount(input);
    setIsOutputAmount(false);
  };

  useEffect(() => {
    setIsInputChanged(false);
  }, [outputState])

  // Push user input to controller
  useEffect(() => {
    if (!fromToken || !toToken) return;
    const amountNumber = parseFloat(amount);

    controller.setData({
      fromToken,
      toToken,
      amount: Number.isFinite(amountNumber) ? amountNumber : 0,
      isOutputAmount,
    });
  }, [
    controller,
    fromToken,
    toToken,
    debouncedAmount,
    debouncedIsOutputAmount,
    inputState.settings!.maxSlippage,
    inputState.settings!.swapDeadline,
  ]);

  const switchTokens = () => {
    const a = fromToken;
    const b = toToken;
    setIsOutputAmount(!isOutputAmount);
    setFromToken(b);
    setToToken(a);
  };

  const onSelectToken = (token: Erc20Token) => {
    if (tokenModalOpen == "from") {
      setFromToken(token);
    } else {
      setToToken(token);
    }
    setTokenModalOpen(false);
  };

  const getFromAmountInputValue = () => {
    if (!isOutputAmount) {
      return amount;
    }

    if (!toToken || !fromToken) {
      return PLEASE_SELECT_TOKEN;
    }

    if (!amount && !isInputChanged) {
      return PLEASE_ENTER_AMOUNT;
    }

    if (
      isInputChanged ||
      outputState?.loader == LoaderStatuses.CALCULATING_QUOTE ||
      !outputState?.computed?.maxAmountIn
    ) {
      return CALCULATING;
    }

    return outputState.computed.maxAmountIn;
  };

  const getToAmountInputValue = () => {
    if (isOutputAmount) {
      return amount;
    }

    if (!toToken || !fromToken) {
      return PLEASE_SELECT_TOKEN;
    }

    if (!amount && !isInputChanged) {
      return PLEASE_ENTER_AMOUNT;
    }

    if (
      isInputChanged ||
      outputState?.loader == LoaderStatuses.CALCULATING_QUOTE ||
      !outputState?.computed?.amountOut
    ) {
      return CALCULATING;
    }

    return outputState.computed.amountOut;
  };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          onClick={() => openTokenModal("from")}
          style={{ minWidth: 120 }}
        >
          {fromToken ? fromToken.symbol : "Select"}
        </button>
        <input
          placeholder="0.0"
          value={getFromAmountInputValue()}
          onChange={(e) => {
            setFromAmountWithInput(e.target.value);
          }}
          style={{ flex: 1, padding: 8 }}
        />
      </div>

      <div style={{ textAlign: "center" }}>
        <button onClick={switchTokens}>⇅</button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button onClick={() => openTokenModal("to")} style={{ minWidth: 120 }}>
          {toToken ? toToken.symbol : "Select"}
        </button>
        <input
          placeholder="0.0"
          value={getToAmountInputValue()}
          onChange={(e) => {
            setToAmountWithInput(e.target.value);
          }}
          style={{ flex: 1, padding: 8 }}
        />
      </div>

      <TokenSelectorModal
        open={!!tokenModalOpen}
        tokens={tokens.filter((token) =>
          tokenModalOpen == "from"
            ? token.address != toToken?.address
            : token.address != fromToken?.address
        )}
        onClose={() => setTokenModalOpen(false)}
        onSelect={onSelectToken}
      />
    </div>
  );
}
