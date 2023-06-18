import { Box, Button, Input, Container, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Card, CardActionArea, CardMedia, CardContent, Typography, CardActions } from '@mui/material';
import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import { contractAbi, contractAddress } from '../utils/contract';
import { Title } from '@mui/icons-material';
import { useSelector } from 'react-redux';

export default function ProposalPage() {
    const { provider, ballotContract } = useSelector(state => state.etherState);
    const [isConnected, setIsConnected] = useState(false);
    const [votingStatus, setVotingStatus] = useState(true);
    const [remainingTime, setremainingTime] = useState('');
    const [candidates, setCandidates] = useState([]);
    const [number, setNumber] = useState('');
    const [name, setName] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [voters, setVoters] = useState([]);
    const [proposals, setProposals] = useState([]);

    const [errorMessage, setErrorMessage] = useState('');
    const [userBalance, setUserBalance] = useState('');
    const [address, setAddress] = useState('');

    useEffect(() => {
        const fetchProposals = async () => {
            const proposals = await ballotContract.getProposals();
            //console.log((proposals));
            setProposals(proposals.map((p, index) => ({ name: p.name, voteCount: p.voteCount.toString(), id: index })));
        }
        if (ballotContract)
            fetchProposals();
    }, [ballotContract]);

    const handleAddProposal = async () => {
        if (!ballotContract)
            return;
        try {
            const res = await ballotContract.addProposal(name);
            console.log(res);
            // const proposal = await ballotContract.proposals(0);
            //setProposals([proposal]);
        } catch (error) {
            console.log(error.errorMessage);
        }
    }

    const handleVoteProposal = async (id) => {
        try {
            const res = await ballotContract.vote(id);
            console.log(res);
            // const proposal = await ballotContract.proposals(0);
            //setProposals([proposal]);
        } catch (error) {
            console.info(error.message);
        }
    }

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setName('');
    }

    return (
        <Container>
            <h1 className="h4">
                Proposal page
            </h1>
            <div>
                <Button onClick={() => setOpenDialog(true)}>Add Proposal</Button>
            </div>
            <div>
                <div>List Proposals</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
                    {proposals.map(proposal =>
                        <Card sx={{ width: 345, textAlign: 'center', margin: "0px 20px 20px 0px" }} key={proposal.name}>
                            <CardActionArea>
                                <CardMedia
                                    component="img"
                                    height="140"
                                    image="/static/images/cards/contemplative-reptile.jpg"
                                    alt="green iguana"
                                />
                                <CardContent>
                                    <Typography gutterBottom variant="h5" component="div">
                                        {proposal.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {proposal.voteCount} votes
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                            <div>
                                <Button
                                    size="small" color="primary" variant='contained'
                                    onClick={() => handleVoteProposal(proposal.id)}
                                >
                                    Vote
                                </Button>
                            </div>
                        </Card>)}

                </div>
                {/* {proposals.map(proposal => <div key={proposal.name}>{`${proposal.name} - ${proposal.voteCount}`}</div>)} */}
            </div>
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                aria-labelledby="edit-apartment"
            >
                <DialogTitle id="edit-apartment">Add Proposal</DialogTitle>
                <DialogContent>
                    <Input
                        placeholder='Name'
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />

                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={() => { handleAddProposal(); handleCloseDialog(); }} color="primary">
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}