import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { CounterABI } from "./abi/CounterABI";

const CONTRACT_ADDRESSES = {
  [baseSepolia.id]: "0xbc09CE89e4a0f99684a0dDC898D1CB2CAfadD1ac" as const,
  [base.id]: "0x437378f655C30bFeB1d156b3E30ED2c7d3A73F4D" as const,
};

function App() {
  const account = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { chains, switchChain } = useSwitchChain();

  const contractAddress = account.chainId
    ? CONTRACT_ADDRESSES[account.chainId as keyof typeof CONTRACT_ADDRESSES]
    : undefined;

  const { data: count, refetch: refetchCount } = useReadContract({
    address: contractAddress,
    abi: CounterABI,
    functionName: "count",
    query: {
      enabled: !!contractAddress,
    },
  });

  const { data: lastCaller, refetch: refetchLastCaller } = useReadContract({
    address: contractAddress,
    abi: CounterABI,
    functionName: "lastCaller",
    query: {
      enabled: !!contractAddress,
    },
  });

  const {
    writeContract,
    isPending,
    data: txHash,
  } = useWriteContract({
    mutation: {
      onSuccess: () => {
        setTimeout(() => {
          refetchCount();
          refetchLastCaller();
        }, 2000);
      },
    },
  });

  const handleIncrement = () => {
    if (!contractAddress) return;

    writeContract({
      address: contractAddress,
      abi: CounterABI,
      functionName: "incrementAndMint",
    });
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <label htmlFor="chain-select">
          <strong>Chain: </strong>
        </label>
        <select
          id="chain-select"
          value={account.chainId || baseSepolia.id}
          onChange={(e) =>
            switchChain({
              chainId: Number(e.target.value) as
                | typeof base.id
                | typeof baseSepolia.id,
            })
          }
        >
          {chains.map((chain) => (
            <option key={chain.id} value={chain.id}>
              {chain.name}
            </option>
          ))}
        </select>
      </div>

      <h1>Counter App</h1>

      {account.status !== "connected" ? (
        <div>
          <p>Connect your wallet to continue</p>
          {connectors.map((connector) => (
            <button
              key={connector.uid}
              onClick={() => connect({ connector })}
              type="button"
            >
              {connector.name}
            </button>
          ))}
        </div>
      ) : (
        <div>
          <p>
            Connected: {account.addresses?.[0]}{" "}
            <button type="button" onClick={() => disconnect()}>
              Disconnect
            </button>
          </p>

          <div style={{ marginTop: "2rem" }}>
            <h2>
              Current Count{" "}
              <button
                type="button"
                onClick={() => {
                  refetchCount();
                  refetchLastCaller();
                }}
              >
                Refresh
              </button>
            </h2>
            <p style={{ fontSize: "2rem" }}>
              {count !== undefined ? count.toString() : "Loading..."}
            </p>

            <h3>Last Caller</h3>
            <p style={{ fontFamily: "monospace", fontSize: "0.9rem" }}>
              {lastCaller || "Loading..."}
            </p>

            <button
              type="button"
              onClick={handleIncrement}
              disabled={isPending}
            >
              {isPending ? "Minting..." : "Increment & Mint NFT"}
            </button>

            {txHash && (
              <div style={{ marginTop: "1rem" }}>
                <h3>Transaction Hash</h3>
                <a
                  href={`${
                    account.chainId === baseSepolia.id
                      ? "https://sepolia.basescan.org"
                      : "https://basescan.org"
                  }/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: "monospace",
                    fontSize: "0.9rem",
                    wordBreak: "break-all",
                    color: "#0066cc",
                    textDecoration: "underline",
                  }}
                >
                  {txHash}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
