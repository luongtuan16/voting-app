import { Button, Container } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setAccount, setProvider } from '../utils/redux/ethers.slice';
import { ethers } from 'ethers';
import { Link } from 'react-router-dom';

export default function HomePage() {
    const { provider, ballotContract, account } = useSelector(state => state.etherState);
    const dispatch = useDispatch();

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
    return (
        <Container>
            <div>
                <h2>Voting System</h2>
                <span>
                    Welcome to our blockchain-based voting website! Our platform leverages the power of blockchain technology to provide a secure, transparent, and efficient voting experience for users like you.
                    <br /><br />
                    With our voting website, you can participate in various elections, polls, and decision-making processes from the comfort of your own home. By utilizing blockchain, we ensure that every vote is recorded on an immutable and decentralized ledger, guaranteeing the integrity of the voting process.
                    <br /><br />
                    One of the key advantages of our system is transparency. The blockchain allows for the public verification of all votes, ensuring that no vote is tampered with or altered. You can independently verify the accuracy of the voting results, building trust and confidence in the outcomes.
                    <br /><br />
                    Moreover, your privacy and anonymity are paramount to us. Through the use of cryptographic techniques, we ensure that your personal information remains confidential while still maintaining the integrity of the voting process. You can cast your vote securely without any concerns about your privacy being compromised.
                    <br /><br />
                    Our system is designed to be user-friendly and accessible to all. You can easily navigate through the website, cast your vote with a few simple clicks, and track the progress of the voting process in real-time. We prioritize a seamless and intuitive user experience to ensure that your participation is hassle-free.
                    <br /><br />
                    By harnessing the benefits of blockchain technology, our voting website aims to revolutionize traditional voting systems by providing a secure, transparent, and inclusive platform for democratic decision-making. Join us today and have your voice heard in a trustworthy and efficient manner.
                </span>
                <br /><br />
                {/* <span>Rule...</span> */}
            </div>
            {!account
                ? <div>
                    <span style={{ display: 'block', marginBottom: '20px' }}>Connect your wallet now to join!</span>
                    <Button variant='outlined' onClick={handleConnectWallet}>Join Now</Button>
                </div>
                : <div>
                     <Link to={'/ballots'}>{'Detail'}</Link>
                </div>}
        </Container>
    );
}