import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("https://eth-mainnet.g.alchemy.com/v2/btdUtkWnLIFsX4vpHhtuq5tVzox7Vk9y");

const BLOCK_NUMBER = 22947631;


async function main() {
    // todo : get the interested addresses from the database

    const interestedAddresses = [
        "0x48183B84b8c366dae4c2ccF7e21E93E06416E2dc","0x99075c931695776FB990C480ECD59A088a6b9830", "0xe4065549C67daA8cAD7F0c9546f064410362Bb21"]

    
    //todo : get the transfers from blockchain
    const block = await provider.getBlock(BLOCK_NUMBER,true);

    // console.log(block?.transactions)

    const transfers : {from: string, to: string, amount: string}[] = []

    for (const transaction of block?.transactions || []) {
        const transactionReceipt = await provider.getTransaction(transaction);
        if (transactionReceipt?.to && interestedAddresses.includes(transactionReceipt.to)) {
            console.log(transactionReceipt.from)
            console.log("              |")
            console.log(ethers.formatEther(transactionReceipt.value))
            console.log("              |")
            console.log("              v")
            console.log(transactionReceipt.to)
            transfers.push({
                from: transactionReceipt.from,
                to: transactionReceipt.to,
                amount: ethers.formatEther(transactionReceipt.value)
            })
        }
    }

    console.log(transfers)

    // todo : save the transfer events to the database

}

main();