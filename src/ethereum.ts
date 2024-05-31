import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import dotenv from 'dotenv';

dotenv.config();

const web3Instance = new Web3(process.env.ETH_NODE_URL);

export const convertEtherToWei = (etherAmount: string): string => {
    return web3Instance.utils.toWei(etherAmount, 'ether');
};

export const convertWeiToEther = (weiAmount: string): string => {
    return web3Instance.utils.fromWei(weiAmount, 'ether');
};

export const handleErrorInBlockchainOperation = (error: Error): void => {
    console.error("Encountered blockchain error: ", error.message);
};

export const sendEtherBetweenAddresses = async (fromAddress: string, toAddress: string, etherAmount: string, senderPrivateKey: string) => {
    try {
        const amountInWei = convertEtherToWei(etherAmount);
        const txnNonce = await web3Instance.eth.getTransactionCount(fromAddress, 'latest'); 
        const signedTxn = await web3Instance.eth.accounts.signTransaction({
            from: fromAddress,
            to: toAddress,
            value: amountInWei,
            gas: 2000000,
            nonce: txnNonce
        }, senderPrivateKey);

        const txnReceipt = await web3Instance.eth.sendSignedTransaction(signedTxn.rawTransaction || '');

        return txnReceipt;
    } catch (error) {
        handleErrorInBlockchainOperation(error);
        throw error;
    }
};

export const extractEventData = <T>(txResult: any, eventName: string): T | null => {
    if (!txResult.events[eventName]) return null;

    return txResult.events[eventName].returnValues as T;
};

export const invokeSmartContractMethod = async (
    contractABI: AbiItem[],
    contractAddress: string,
    methodName: string,
    methodParameters: any[],
    transactionCallerAddress: string,
    callerPrivateKey: string
) => {
    try {
        const contract = new web3Instance.eth.Contract(contractABI, contractAddress);
        const encodedFunctionCall = contract.methods[methodName](...methodParameters).encodeABI();

        const txnNonce = await web3Instance.eth.getTransactionCount(transactionCallerAddress, 'latest');
        const signedTxn = await web3Instance.eth.accounts.signTransaction({
            to: contractAddress,
            data: encodedFunctionCall,
            gas: 2000000,
            nonce: txnNonce
        }, callerPrivateKey);

        const txnReceipt = await web3Instance.eth.sendSignedTransaction(signedTxn.rawTransaction || '');

        return txnReceipt;
    } catch (error) {
        handleErrorInBlockchainOperation(error);
        throw error;
    }
};

export const performBatchEtherTransfers = async (
    senderWalletAddress: string,
    transferDetails: {recipientWalletAddress: string, etherAmount: string}[],
    senderPrivateKey: string
) => {
    try {
        const startingNonce = await web3Instance.eth.getTransactionCount(senderWalletAddress, 'latest');
        const receipts = [];

        for (let i = 0; i < transferDetails.length; i++) {
            const {recipientWalletAddress, etherAmount} = transferDetails[i];
            const amountInWei = convertEtherToWei(etherAmount);
            const currentNonce = startingNonce + i;
            const signedTxn = await web3Instance.eth.accounts.signTransaction({
                from: senderWalletAddress,
                to: recipientWalletAddress,
                value: amountInWei,
                gas: 2000000,
                nonce: currentNonce
            }, senderPrivateKey);

            const txnReceipt = await web3Instance.eth.sendSignedTransaction(signedTxn.rawTransaction || '');
            receipts.push(txnReceipt);
        }

        return receipts;
    } catch (error) {
        handleErrorInBlockchainOperation(error);
        throw error;
    }
};