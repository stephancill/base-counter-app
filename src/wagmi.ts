import { createConfig, http } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { baseAccount } from "wagmi/connectors";

export const config = createConfig({
  chains: [baseSepolia, base],
  connectors: [
    baseAccount({
      preference: {
        walletUrl:
          import.meta.env.VITE_PUBLIC_WALLET_URL ??
          "https://keys-dev.coinbase.com/connect",
      },
    }),
  ],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
