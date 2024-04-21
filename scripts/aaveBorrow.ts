import { ethers, network } from "hardhat";
import { getWeth, AMOUNT } from "./getWeth";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { log } from "console";
import { AggregatorV3Interface, ILendingPool } from "../typechain-types";
import { networkConfig } from "../helper.hardhat.config";

// Here we'll interact with the AAVE protocol.
// First we use getWeth to exchange ETH to WETH.
// AAVE treats everything as an ERC-20 token.
async function main() {
    //#region Step 1 Deposit Collateral
    await getWeth();
    const [deployer] = await ethers.getSigners();
    const lendingPoolContract: ILendingPool = await getLendingPool(deployer);

    // Approve LendingPool to manage our WETH
    const wethTokenAddress = networkConfig[network.config!.chainId!].wethToken!;
    const lendingPoolAddress = await lendingPoolContract.getAddress();
    await approveERC20(wethTokenAddress, lendingPoolAddress, AMOUNT, deployer);

    console.log(
        `Depositing WETH using ${wethTokenAddress} as WETH token and ${deployer} as address`
    );
    await lendingPoolContract.deposit(wethTokenAddress, AMOUNT, deployer, 0);
    log(`${AMOUNT} WETH deposited on the Lending Pool of AAVE`);
    //#endregion

    //#region Step 2 Borrow another asset: DAI
    let [availableBorrowsETH, totalDebtETH] = await getBorrowUserData(
        lendingPoolContract,
        deployer
    );
    const daiPrice = await getDaiPrice();
    const amountDaiToBorrow = availableBorrowsETH / daiPrice;
    const amountDaiToBorrowWei = ethers.parseEther(amountDaiToBorrow.toString());
    log(`You can borrow ${amountDaiToBorrow} DAI`);
    log(`You can borrow ${amountDaiToBorrowWei} WEI`);

    const daiTokenAddress = networkConfig[network.config.chainId!].daiToken!;
    await borrowDai(
        daiTokenAddress,
        lendingPoolContract,
        amountDaiToBorrowWei.toString(),
        deployer
    );

    await getBorrowUserData(lendingPoolContract, deployer);
    //#endregion

    //#region Step 3. Repay
    await repay(amountDaiToBorrowWei.toString(), daiTokenAddress, lendingPoolContract, deployer);
    await getBorrowUserData(lendingPoolContract, deployer);
    //#endregion
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

async function approveERC20(
    erc20Address: string,
    spenderAddress: string,
    amountToSpend: string,
    signer: HardhatEthersSigner
) {
    const erc20Token = await ethers.getContractAt("IERC20", erc20Address, signer);
    const transaction = await erc20Token.approve(spenderAddress, amountToSpend);
    await transaction.wait(1);
    console.log("Approved!");
}

async function getBorrowUserData(lendingPool: ILendingPool, account: HardhatEthersSigner) {
    const { totalCollateralETH, totalDebtETH, availableBorrowsETH } =
        await lendingPool.getUserAccountData(account.address);

    console.log(`You have ${totalCollateralETH} worth of ETH deposited.`);
    console.log(`You have ${totalDebtETH} worth of ETH borrowed.`);
    console.log(`You can borrow ${availableBorrowsETH} worth of ETH.`);
    return [availableBorrowsETH, totalDebtETH];
}

async function getDaiPrice() {
    const daiEthPriceFeed: AggregatorV3Interface = await ethers.getContractAt(
        "AggregatorV3Interface",
        networkConfig[network.config.chainId!].daiEthPriceFeed!
    );

    const price = (await daiEthPriceFeed.latestRoundData())[1];
    log(`The DAI/ETH price is: ${price}`);

    return price;
}

async function borrowDai(
    daiAddress: string,
    lendingPool: ILendingPool,
    amountDaiToBorrow: string,
    deployer: HardhatEthersSigner
) {
    const borrowTransaction = await lendingPool.borrow(
        daiAddress,
        amountDaiToBorrow,
        2, //Variable, Stable is throwing error
        0,
        deployer
    );
    await borrowTransaction.wait(1);
    console.log("You've borrowed!");
}

async function repay(
    amountToRepay: string,
    daiTokenAddress: string,
    lendingPool: ILendingPool,
    deployer: HardhatEthersSigner
) {
    const lendingPoolAddress = await lendingPool.getAddress();
    await approveERC20(daiTokenAddress, lendingPoolAddress, amountToRepay, deployer);
    const repayTx = await lendingPool.repay(daiTokenAddress, amountToRepay, 2, deployer);
    await repayTx.wait(1);
    console.log("Repaid!!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
