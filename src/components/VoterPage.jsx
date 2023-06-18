import { Button, Container, Dialog, DialogActions, DialogContent, DialogTitle, Input } from '@mui/material';
import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import { contractAbi, contractAddress } from '../utils/contract';
import { useSelector } from 'react-redux';

export default function VoterPage() {
    const { provider, ballotContract } = useSelector(state => state.etherState);
    const [isConnected, setIsConnected] = useState(false);
    const [votingStatus, setVotingStatus] = useState(true);
    const [remainingTime, setremainingTime] = useState('');
    const [candidates, setCandidates] = useState([]);
    const [number, setNumber] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [voters, setVoters] = useState([]);
    const [newVoterAddress, setNewVoterAddress] = useState(null);

    useEffect(() => {
        const fetchVoters = async () => {
            const voters = await ballotContract.getAllVoters();
            setVoters(voters);
        }
        if (ballotContract)
            fetchVoters();
    }, [ballotContract]);


    const handleAddVoter = async () => {
        try {
            await provider.send("eth_requestAccounts", [])
            const signer = provider.getSigner()
            const ballotContract = new ethers.Contract(contractAddress, contractAbi, signer);
            const res = await ballotContract.giveRightToVote(newVoterAddress);
            res.wait();
        } catch (error) {
            console.log(error);
        }
    }

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setNewVoterAddress('');
    }

    return (
        <Container>
            <h1 className="h4">
                Voter page
            </h1>
            <div>
                <Button onClick={() => setOpenDialog(true)}>Add Voter</Button>
            </div>
            <div>
                <div>List Voters</div>
                {voters.map(voter => <div key={voter}>{`${voter}`}</div>)}
            </div>
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                aria-labelledby="edit-apartment"
            >
                <DialogTitle id="edit-apartment">Add Voter</DialogTitle>
                <DialogContent>
                    <Input
                        placeholder='Address'
                        value={newVoterAddress}
                        onChange={e => setNewVoterAddress(e.target.value)}
                    />

                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={() => { handleAddVoter(); handleCloseDialog(); }} color="primary">
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}