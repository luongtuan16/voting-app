import { Box, Button, Input, Container } from '@mui/material';
import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import { contractAbi, contractAddress } from '../utils/contract';

export default function Main() {
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const [provider, setProvider] = useState(null);
    const [account, setAccount] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [votingStatus, setVotingStatus] = useState(true);
    const [remainingTime, setremainingTime] = useState('');
    const [candidates, setCandidates] = useState([]);
    const [number, setNumber] = useState('');
    const [voters, setVoters] = useState([]);
    const [proposals, setProposals] = useState([]);

    const [errorMessage, setErrorMessage] = useState('');
    const [userBalance, setUserBalance] = useState('');
    const [address, setAddress] = useState('');

    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', handleAccountsChanged);
        }
        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            }
        }
    }, []);

    const connectwalletHandler = async () => {
        if (window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            // const provider = new ethers.providers.Web3Provider(window.ethereum)
            setProvider(provider);
            await provider.send("eth_requestAccounts", [])
            const signer = provider.getSigner()
            console.log(signer)
            setAccount(await signer.getAddress());
            const balance = await signer.getBalance()
            setUserBalance(ethers.utils.formatEther(balance))
            connectContract(signer)
        } else {
            setErrorMessage("Please Install Metamask!!!");
        }
    }

    const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0 && account !== accounts[0]) {
            setAccount(accounts[0]);
        } else {
            setIsConnected(false);
            setAccount(null);
        }
    }

    const connectContract = async (signer) => {
        const ballotContract = new ethers.Contract(contractAddress, contractAbi, signer);

    }

    const addVoter = async () => {
        await provider.send("eth_requestAccounts", [])
        const signer = provider.getSigner()
        const ballotContract = new ethers.Contract(contractAddress, contractAbi, signer);
        // await ballotContract.giveRightToVote(address);
        const voter = await ballotContract.votersAddress(0);
        console.log(voter)
        setVoters([voter])
    }

    const addProposal = async () => {
        await provider.send("eth_requestAccounts", [])
        const signer = provider.getSigner()
        const ballotContract = new ethers.Contract(contractAddress, contractAbi, signer);
        const name = ethers.utils.formatBytes32String('Nguyen van A');
       // await ballotContract.addProposal(address, name);
        const proposal = await ballotContract.proposals(address);
        console.log(ethers.utils.parseBytes32String(proposal.name))
       // setVoters([voter])
    }

    const getProposal = async () => {
        await provider.send("eth_requestAccounts", [])
        const signer = provider.getSigner()
        const ballotContract = new ethers.Contract(contractAddress, contractAbi, signer);
        const proposal = await ballotContract.proposals(address);
        console.log(ethers.utils.parseBytes32String(proposal.name))
       // setVoters([voter])
    }

    return (
        <Container>
            <div className="WalletCard">
                <h3 className="h4">
                    Welcome to a decentralized Application
                </h3>
                <Button
                    style={{ background: account ? "#A5CC82" : "white" }}
                    onClick={connectwalletHandler}>
                    {account ? "Connected!!" : "Connect"}
                </Button>
                <div className="displayAccount">
                    <h4 className="walletAddress">Address:{account}</h4>
                </div>
                {errorMessage}
            </div>
            <Input
                value={address}
                onChange={e => setAddress(e.target.value)}
            />
            <div>
                <Button onClick={addVoter}>Add voter</Button>
                <Button onClick={addProposal}>Add Proposal</Button>
            </div>
            <div>
                
                <div>Danh sach ung vien</div>
                {proposals.map(proposal => <div>{proposal.name}</div>)}
            </div>
            <div>
                <div>Danh sach voter</div>
                {voters.map(voter => <div>{voter}</div>)}
            </div>
        </Container>
    );
}