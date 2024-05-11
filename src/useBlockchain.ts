import { useState, useEffect } from 'react';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

interface Web3State {
  web3: Web3 | null;
  accounts: string[] | null;
  contract: any; // Consider defining a more specific type for your contract
  error: Error | null;
  isLoading: boolean;
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

const useWeb3 = () => {
  const [state, setState] = useState<Web3State>({
    web3: null,
    accounts: null,
    contract: null,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    const loadBlockchainData = async () => {
      try {
        if (window.ethereum) {
          const web3 = new Web3(window.ethereum);
          await window.ethereum.enable();

          const accounts = await web3.eth.getAccounts();
          if (accounts.length === 0) {
            throw new Error('No accounts. Please connect to MetaMask.');
          }

          const contract = new web3.eth.Contract(MEDICAL_RECORD_ABI, CONTRACT_ADDRESS);
          setState((prev) => ({ ...prev, web3, accounts, contract, isLoading: false }));
        } else {
          throw new Error('Please install MetaMask!');
        }
      } catch (error) {
        setState((prev) => ({ ...prev, error: error as Error, isLoading: false }));
      }
    };

    loadBlockchainData();
  }, []);

  const sendTransaction = async (methodName: string, params: any[], value = '0') => {
    if (!state.web3 || !state.accounts) {
      throw new Error('Web3 or accounts not initialized');
    }

    let result = null;
    try {
      const gas = await state.contract.methods[methodName](...params)
                                     .estimateGas({ from: state.accounts[0] });
      result = await state.contract.methods[methodName](...params)
                                  .send({ from: state.accounts[0], gas, value });
    } catch (error) {
      setState((prev) => ({ ...prev, error: error as Error }));
    }

    return result;
  };

  const callContract = async (methodName: string, params: any[]) => {
    if (!state.contract) {
      throw new Error('Contract not initialized');
    }

    let result = null;
    try {
      result = await state.contract.methods[methodName](...params).call();
    } catch (error) {
      setState((prev) => ({ ...prev, error: error as Error }));
    }

    return result;
  };

  return {
    ...state,
    sendTransaction,
    callContract,
  };
};

export default useWeb3;