import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import dotenv from 'dotenv';

dotenv.config();

const web3 = new Web3(process.env.ETH_NODE_URL);

export const convertEthToWei = (ethAmount: string): string => {
    return web3.utils.toWei(ethAmount, 'ether');
};

export const convertWeiToEth = (weiAmount: string): string => {
    return web3.utils.fromWei(weiAmount, 'ether');
};

export const logBlockchainError = (error: Error): void => {
    console.error("Blockchain error encountered: ", error.message);
};

export const transferEther = async (senderAddress: string, recipientAddress: string, amountInEther: string, privateKey: string) => {
    try {
        const valueInWei = convertEthToWei(amountInEther);
        const nonce = await web3.eth.getTransactionCount(senderAddress, 'latest'); 
        const signedTransaction = await web3.eth.accounts.signTransaction({
            from: senderAddress,
            to: recipientAddress,
            value: valueInWei,
            gas: 2000000,
            nonce
        }, privateKey);

        const transactionReceipt = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction || '');

        return transactionReceipt;
    } catch (error) {
        logBlockchainError(error);
        throw error;
    }
};

export const getEventData = <T>(eventResult: any, eventName: string): T | null => {
    if (!eventResult.events[eventName]) return null;

    return eventResult.events[eventName].returnValues as T;
};

export const executeSmartContractFunction = async (smartContractABI: AbiItem[], smartContractAddress: string, functionName: string, parameters: any[], callerAddress: string, privateKey: string) => {
    try {
        const smartContract = new web3.eth.Contract(smartContractABI, smartContractAddress);
        const functionData = smartContract.methods[functionName](...parameters).encodeABI();

        const nonce = await web3.eth.getTransactionCount(callerAddress, 'latest');
        const signedTransaction = await web3.eth.accounts.signTransaction({
            to: smartContractAddress,
            data: functionData,
            gas: 2000000,
            nonce
        }, privateKey);

        const transactionReceipt = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction || '');

        return transactionReceipt;
    } catch (error) {
        logBlockchainError(error);
        throw error;
    }
};

export const batchTransferEther = async (senderAddress: string, transactions: {recipientAddress: string, amountInEther: string}[], privateKey: string) => {
    try {
        const initialNonce = await web3.eth.getTransactionCount(senderAddress, 'latest');
        const transferReceipts = [];

        for (let i = 0; i < transactions.length; i++) {
            const {recipientAddress, amountInEther} = transactions[i];
            const valueInWei = convertEthToWei(amountInEther);
            const nonce = initialNonce + i;
            const signedTransaction = await web3.eth.accounts.signTransaction({
                from: senderAddress,
                to: recipientAddress,
                value: valueInWei,
                gas: 2000000,
                nonce
            }, privateKey);

            const transactionReceipt = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction || '');
            transferReceipts.push(transactionReceipt);
        }

        return transferReceipts;
    } catch (error) {
        logBlockchainError(error);
        throw error;
    }
};