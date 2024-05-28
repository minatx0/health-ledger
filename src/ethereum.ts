import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import dotenv from 'dotenv';

dotenv.config();

const web3 = new Web3(process.env.ETH_NODE_URL);

export const toWei = (eth: string): string => {
    return web3.utils.toWei(eth, 'ether');
};

export const fromWei = (wei: string): string => {
    return web3.utils.fromWei(wei, 'ether');
};

export const handleError = (error: Error): void => {
    console.error("Blockchain error encountered: ", error.message);
};

export const sendEther = async (fromAddress: string, toAddress: string, amountInEther: string, privateKey: string) => {
    try {
        const value = toWei(amountInEther);
        const nonce = await web3.eth.getTransactionCount(fromAddress, 'latest'); // Fixed variable name to 'fromAddress'
        const signedTx = await web3.eth.accounts.signTransaction({
            from: fromAddress,
            to: toAddress,
            value: value,
            gas: 2000000,
            nonce
        }, privateKey);

        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction || '');

        return receipt;
    } catch (error) {
        handleError(error);
        throw error;
    }
};

export const extractEventData = <T>(eventResult: any, eventName: string): T | null => {
    if (!eventResult.events[eventName]) return null;

    return eventResult.events[eventName].returnValues as T;
};

export const interactWithContract = async (contractABI: AbiItem[], contractAddress: string, method: string, params: any[], fromAddress: string, privateKey: string) => {
    try {
        const contract = new web3.eth.Contract(contractABI, contractAddress);
        const data = contract.methods[method](...params).encodeABI();

        const nonce = await web3.eth.getTransactionCount(fromAddress, 'latest');
        const signedTx = await web3.eth.accounts.signTransaction({
            to: contractAddress,
            data,
            gas: 2000000,
            nonce
        }, privateKey);

        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction || '');

        return receipt;
    } catch (error) {
        handleError(error);
        throw error;
    }
};

// New Function
export const batchSendEther = async (fromAddress: string, transactions: {toAddress: string, amountInEther: string}[], privateKey: string) => {
    try {
        const nonceStart = await web3.eth.getTransactionCount(fromAddress, 'latest');

        const receipts = [];
        for (let i = 0; i < transactions.length; i++) {
            const {toAddress, amountInEther} = transactions[i];
            const value = toWei(amountInEther);
            const nonce = nonceStart + i;
            const signedTx = await web3.eth.accounts.signTransaction({
                from: fromAddress,
                to: toAddress,
                value,
                gas: 2000000,
                nonce
            }, privateKey);

            const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction || '');
            receipts.push(receipt);
        }

        return receipts;
    } catch (error) {
        handleError(error);
        throw error;
    }
};