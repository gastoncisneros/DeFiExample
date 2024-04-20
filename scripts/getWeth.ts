import { log } from "console";
import { ethers, network } from "hardhat";
import { networkConfig } from "../helper.hardhat.config";

const DepositAmount = ethers.parseEther("0.01").toString();

export async function getWeth() {
    const [deployer] = await ethers.getSigners();
    // Call "deposit" function on the Weth Contract.
    // We need the ABI (IWETH.sol),
    // And the WETH Contract Address to use it.0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
    // Because we're forking the ETH Network, the contract address (Weth Contract) exists in our Forked Network.
    // Create the Forked Network as a project in Alchemy, and inport the URL in settings.
    const iWeth = await ethers.getContractAt(
        "IWeth",
        networkConfig[network.config!.chainId!].wethToken!, //WETH Contract Address from MainNet
        deployer
    );

    const txResponse = await iWeth.deposit({
        value: DepositAmount,
    });

    await txResponse.wait(1);
    const wethBalance = await iWeth.balanceOf(deployer);
    log(`Got ${wethBalance.toString()} WETH`);

    // This will Run as if it is a mainnet.
}
