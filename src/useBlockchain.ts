import { useState, useEffect } from 'react';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

interface Web3State {
  web3Instance: Web3 | null;
  userAccounts: string[] | null;
  medicalRecordContract: any; 
  connectionError: Error | null;
  isLoadingBlockchainData: boolean;
}

const MEDICAL_RECORD_ABI: AbiItem[] = [
  {
    constant: true,
    inputs: [{ name: "recordId", type: "uint256" }],
    name: "getRecord",
    outputs: [{ name: "", type: "string" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
];

const CONTRACT_ADDRESS: string = process.env.REACT_APP_MEDICAL_RECORD_CONTRACT_ADDRESS || '';

const useBlockchain = () => {
  const [state, setState] = useState<Web3State>({
    web3Instance: null,
    userAccounts: null,
    medicalRecordContract: null,
    connectionError: null,
    isLoadingBlockchainData: true,
  });

  useEffect(() => {
    const initBlockchainConnection = async () => {
      if (!window.ethereum) {
        const error = new Error('Ethereum object not found in window. Please install MetaMask!');
        setState((prev) => ({ ...prev, connectionError: error, isLoadingBlockchainData: false }));
        return;
      }

      try {
        const web3 = new Web3(window.ethereum);
        await window.ethereum.enable();

        const accounts = await web3.eth.getAccounts();
        if (accounts.length === 0) {
          throw new Error('No accounts found. Please connect to MetaMask.');
        }

        const contract = new web3.eth.Contract(MEDICAL_RECORD_ABI, CONTRACT_ADDRESS);
        setState((prev) => ({ ...prev, web3Instance: web3, userAccounts: accounts, medicalRecordContract: contract, isLoadingBlockchainData: false }));
      } catch (error) {
        setState((prev) => ({ ...prev, connectionError: error instanceof Error ? error : new Error(error), isLoadingBlockchainData: false }));
      }
    };

    initBlockchainConnection();
  }, []);

  const executeContractTransaction = async (methodName: string, parameters: any[], etherValue = '0') => {
    if (!state.web3Instance || !state.userAccounts) {
      const error = new Error('Web3 instance or user accounts not initialized.');
      setState((prev) => ({ ...prev, connectionError: error }));
      throw error;
    }

    let transactionResult = null;
    try {
      const gasEstimate = await state.medicalRecordContract.methods[methodName](...parameters)
                                     .estimateGas({ from: state.userAccounts[0] });
      transactionResult = await state.medicalRecordContract.methods[methodName](...parameters)
                                     .send({ from: state.userAccounts[0], gas: gasEstimate, value: etherValue });
    } catch (error) {
      const transactionError = new Error(`Error sending transaction for method ${methodName}: ${error}`);
      console.error(transactionError);
      setState((prev) => ({ ...prev, connectionError: transactionError }));
      throw transactionError;
    }

    return transactionResult;
  };

  const invokeContractQuery = async (methodName: string, parameters: any[]) => {
    if (!state.medicalRecordContract) {
      const error = new Error('Medical record contract not initialized.');
      setState((prev) => ({ ...prev, connectionError: error }));
      throw error;
    }

    let queryResult = null;
    try {
      queryResult = await state.medicalRecordContract.methods[methodName](...parameters).call();
    } catch (error) {
      const queryError = new Error(`Error invoking contract method ${methodName}: ${error}`);
      console.error(queryError);
      setState((prev) => ({ ...prev, connectionError: queryError }));
      throw queryError;
    }

    return queryResult;
  };

  return {
    ...state,
    executeContractTransaction,
    invokeContractQuery,
  };
};

export default useBlockchain;