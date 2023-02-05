import {BigNumber, providers, utils} from 'ethers'
import Head from 'next/head'
import React, { useEffect, useRef, useState} from 'react'
import Web3Modal from 'web3modal'
import styles from '../styles/Home.module.css'
import { addLiquidity, calculateCD } from '@/utils/addLiquidity'
import {
  getCDTokenBalance,
  getEtherBalance,
  getLPTokenBalance,
  getReserveOfCDTokens
} from '../utils/getAmounts'
import {
  getTokensAfterRemove,
  removeLiquidity
} from '../utils/removeLiquidity'
import {
  swapTokens,
  getAmountOfTokensReceivedFromSwap
} from '../utils/swap'


export default function Home() {
  const [loading, setLoading] = useState(false);
  const [liquidityTab, setLiquidityTab] = useState(true);
  const zero = BigNumber.from(0);
  const [ethBalance, setEthBalance] = useState(zero);
  const [reservedCD, setReservedCD] = useState(zero);
  const [etherBalanceContract, setEtherBalanceContract] = useState(zero);
  const [ cdBalance, setCDBalance] = useState(zero);
  const [ lpBalance, setLPBalance] = useState(zero);
  const [addEther, setAddEther] = useState(zero);
  const [ addCDTokens, setAddCDTokens] = useState(zero);
  const [ removeEther, setRemoveEther] = useState(zero);
  const [ removeCD, setRemoveCD] = useState(zero);
  const [ removeLPTokens, setRemoveLPTokens] = useState("0");
  const [swapAmount, setSwapAmount] = useState("");
  const [ tokensToBeReceivedAfterSwap, setTokensToBeReceivedAfterSwap] = useState(zero);
  const [ ethSelected, setEtheSelected] = useState(true);
  const web3ModalRef = useRef();
  const [walletConnected, setWalletConnected] = useState(false);


  const getAmounts = async () => {
    try {
      const provider = await getProviderOrSigner(false);
      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress();
      const _ethBalance = await getEtherBalance(provider, address);
      const _cdBalance = await getCDTokenBalance(provider, address);
      const _lpBalance = await getLPTokenBalance(provider, address);
      const _reservedCD = await getReserveOfCDTokens(provider);
      const _ethBalanceContract = await getEtherBalance(provider, null, true);

      setEthBalance(_ethBalance);
      setCDBalance(_cdBalance);
      setLPBalance(_lpBalance);
      setReservedCD(_reservedCD);
      setEtherBalanceContract(_ethBalanceContract);

    } catch (e) {
      console.error(e);
    }
  };


  // Swap token function 

  const _swapTokens = async () => {
    try {
      const swapAmountWei = utils.parseEther(swapAmount);

      if (!swapAmountWei.eq(zero)) {
        const signer = await getProviderOrSigner(true);
        setLoading(true);
        await swapTokens(
          signer,
          swapAmountWei,
          tokensToBeReceivedAfterSwap,
          ethSelected
        );
        setLoading(false);

        await getAmounts();
        setSwapAmount("");
      }

    } catch (e) {
      console.error(e);
      setLoading(false);
      setSwapAmount("");
    }
  };


  // _getAmountOfTokensReceivedFromSwap

  const _getAmountOfTokensReceivedFromSwap = async (_swapAmount) => {
    try {
      const _swapAmountWEI = utils.parseEther(_swapAmount.toString());

      if(!_swapAmountWEI.eq(zero)) {
        const provider = await getProviderOrSigner();

        const _ethBalance = await getEtherBalance(provider, null, true);
        const amountOfTokens = await getAmountOfTokensReceivedFromSwap(
          _swapAmountWEI,
          provider,
          ethSelected,
          _ethBalance,
          reservedCD
        );
        setTokensToBeReceivedAfterSwap(amountOfTokens);
      } else {
        setTokensToBeReceivedAfterSwap(zero);
      }

    } catch (e) {
      console.error(e);
    }
  };


  // Add liquidity 

  const _addLiquidity= async () => {
    try {
      const addEtherWei = utils.parseEther(addEther.toString());

      if(!addCDTokens.eq(zero) && !addEtherWei.eq(zero)) {
        const signer = await getProviderOrSigner(true);
        setLoading(true);
        await addLiquidity(signer, addCDTokens, addEtherWei);
        setLoading(false);

        setAddCDTokens(zero);

        await getAmounts();
      } else {
        setAddCDTokens(zero);
      }

    } catch (e) {
      console.error(e);
      setLoading(false);
      setAddCDTokens(zero);
    }
  };

  // Remove liquidity 

  const _removeLiquidity = async () => {
    try {
      const signer = await getProviderOrSigner(true);

      const removeLPTokensWei = utils.parseEther(removeLPTokens);
      setLoading(true);
      await removeLiquidity(signer, removeLPTokensWei);
      setLoading(false);
      await getAmounts();
      setRemoveCD(zero);
      setRemoveEther(zero);

    } catch (e) {
      console.error(e);
      setLoading(false);
      setRemoveCD(zero);
      setRemoveEther(zero);
    }
  };

  // get tokens after remove 
  const _getTokensAfterRemove = async (_removeLPTokens) => {
    try {
      const provider = await getProviderOrSigner();
      const removeLPTokensWei = utils.parseEther(_removeLPTokens);

      const _ethBalance = await getEtherBalance(provider, null, true);

      const cryptoDevTokenReserve = await getReserveOfCDTokens(provider);
      const {_removeEther, _removeCD} = await getTokensAfterRemove(provider, removeLPTokensWei, _ethBalance, cryptoDevTokenReserve);
      setRemoveEther(_removeEther);
      setRemoveCD(_removeCD);
    } catch (e) {
      console.error(e);
    }
  };


  // Connect Wallet 

  const connectWallet = async () => {
    try{
      await getProviderOrSigner();
      setWalletConnected(true);

    } catch (e) {
      console.error(e);
    }
  };

  // Get provider or signer 

  const getProviderOrSigner = async (needSigner = false)=> {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    const {chainId} = await web3Provider.getNetwork();
    if (chainId !==5) {
      window.alert("Change the network to Goerli");
      throw new Error("Change network to Goerli");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;

  };

  // UseEffect 

  

}

