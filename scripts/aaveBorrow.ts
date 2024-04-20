import { ethers } from "hardhat";
import { getWeth } from "./getWeth";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { log } from "console";
import { ILendingPool } from "../typechain-types";

// Here we'll interact with the AAVE protocol.
// First we use getWeth to exchange ETH to WETH.
// AAVE treats everything as an ERC-20 token.
async function main() {
    await getWeth();
    const [deployer] = await ethers.getSigners();
    const lendingPoolContract: ILendingPool = await getLendingPool(deployer);
}

async function getLendingPool(address: HardhatEthersSigner) {
    const lendingPoolAddressProvider = await ethers.getContractAt(
        "ILendingPoolAddressesProvider",
        process.env.LENDING_POOL_ADDRESS_PROVIDER_ADDRESS!,
        address
    );

    const lendingPoolAddress = await lendingPoolAddressProvider.getLendingPool();
    const lendingPoolContract = await ethers.getContractAt(
        "ILendingPool",
        lendingPoolAddress,
        address
    );

    return lendingPoolContract;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
