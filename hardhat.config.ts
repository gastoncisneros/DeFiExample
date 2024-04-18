import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import "hardhat-gas-reporter";
import "@typechain/hardhat";
import { log } from "console";
import "dotenv/config";
import { vars } from "hardhat/config";

// ALCHEMY_API_KEY = -JNVhlmrf3mCiQIkivni6C-hajydCOpJ
// SEPOLIA_PRIVATE_KEY (Metamask) = 8f552ee0f08d71e1d66fb84f9b18ee42647da8cfeb3296cbec31057b521af828
// ETHERSCAN_API_KEY = AXE7JMDK621PY33TBU9228V89PXVT58AVU

// 1. yarn hardhat vars set SEPOLIA_PRIVATE_KEY
// 2. yarn hardhat vars set ALCHEMY_API_KEY
// 3. yarn hardhat vars set ETHERSCAN_API_KEY

// const ALCHEMY_API_KEY = vars.get("ALCHEMY_API_KEY");
// const SEPOLIA_PRIVATE_KEY = vars.get("SEPOLIA_PRIVATE_KEY");
// const ETHERSCAN_API_KEY = vars.get("ETHERSCAN_API_KEY");

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY!;
const SEPOLIA_PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY!;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY!;
const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL!;

log(ALCHEMY_API_KEY);
log(SEPOLIA_PRIVATE_KEY);
log(ETHERSCAN_API_KEY);
log(MAINNET_RPC_URL);

const config: HardhatUserConfig = {
  solidity: {
    compilers: [{ version: "0.8.24" }, { version: "0.4.19" }],
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
      forking: {
        url: MAINNET_RPC_URL,
      },
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [SEPOLIA_PRIVATE_KEY],
      chainId: 11155111,
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
      chainId: 31337,
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: true,
  },
};

export default config;
