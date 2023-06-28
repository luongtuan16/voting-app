import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setAccount, setProvider } from '../redux/ethers.slice';

export default function useContract() {
    const { ballotContract, account } = useSelector(state => state.etherState);
    const [isChairperson, setIsChairperson] = useState(false);
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();

    useEffect(() => {
        const handleConnectWallet = async () => {
            if (window.ethereum) {
                const provider = new ethers.providers.Web3Provider(window.ethereum)
                // const provider = new ethers.providers.Web3Provider(window.ethereum)
                await provider.send("eth_requestAccounts", [])
                const signer = provider.getSigner()
                dispatch(setProvider(provider));
                dispatch(setAccount(await signer.getAddress()));
            } else {
                alert("Please Install Metamask!!!");
            }
        }
        if (!account)
            handleConnectWallet();
    }, []);

    useEffect(() => {
        if (ballotContract)
            (async () => {
                const isChairperson = await ballotContract.validateChairperson();
                setIsChairperson(isChairperson);
                setLoading(false);
            })();
    }, [ballotContract]);

    return ({
        ballotContract,
        isChairperson,
        loading,
    })
}
