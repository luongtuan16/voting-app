import { Button, Card, CardActionArea, CardContent, CardMedia, CircularProgress, Container, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Input, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import useContract from '../utils/hooks/useContract';
import { useSelector } from 'react-redux';
import { VOTER_STATUS_DEFAULT, VOTER_STATUS_NOT_VOTE, VOTER_STATUS_VOTED } from '../utils/constants';

export default function ProposalPage() {
    const [newProposal, setNewProposal] = useState();
    const [openDialog, setOpenDialog] = useState(false);
    const [proposals, setProposals] = useState([]);
    const [voterStatus, setVoterStatus] = useState();
    const { ballotContract, isChairperson, loading: loadingPermission } = useContract();

    useEffect(() => {
        const fetchProposals = async () => {
            const proposals = await ballotContract.getProposals();
            setProposals(proposals.map((p) => ({ name: p.name, voteCount: p.voteCount.toString(), id: p.id, avatar: p.avatar, })));
        }
        if (ballotContract)
            fetchProposals();
    }, [ballotContract]);

    useEffect(() => {
        const fetchVoterStatus = async () => {
            const status = await ballotContract.getVoterStatus();
            setVoterStatus(status.toNumber());
        }
        if (ballotContract)
            fetchVoterStatus();
    }, [ballotContract]);

    const handleAddProposal = async () => {
        if (!ballotContract || !isChairperson || !newProposal.id || !newProposal.name || !newProposal.avatar)
            return;
        try {
            const res = await ballotContract.addProposal(Number(newProposal.id), newProposal.name, newProposal.avatar);
        } catch (error) {
            console.log(error.errorMessage);
        }
    }

    const handleVoteProposal = async (id) => {
        if (voterStatus !== VOTER_STATUS_NOT_VOTE){
            alert('Cant vote')
            return;
        }
        try {
            const res = await ballotContract.vote(id);
        } catch (error) {
            console.info(error.message);
        }
    }

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setNewProposal();
    }

    return (
        <Container>
            {loadingPermission ? <CircularProgress /> :
                ((voterStatus === VOTER_STATUS_NOT_VOTE || voterStatus === VOTER_STATUS_VOTED || isChairperson)
                    ? <div>
                        <h1 className="h4">
                            Proposal page
                        </h1>
                        {isChairperson && <div>
                            <Button variant='outlined' onClick={() => setOpenDialog(true)}>+ Add Proposal</Button>
                        </div>}
                        <div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
                                {proposals.map(proposal =>
                                    <Card sx={{ width: 345, textAlign: 'center', margin: "0px 20px 20px 0px" }} key={proposal.name}>
                                        <CardActionArea>
                                            <CardMedia
                                                component="img"
                                                height="140"
                                                image={proposal.avatar}
                                                alt="Image"
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
                                        <div style={{ marginBottom: '20px' }}>
                                            {voterStatus === VOTER_STATUS_NOT_VOTE && <Button
                                                size="small" color="primary" variant='contained'
                                                onClick={() => handleVoteProposal(proposal.id)}
                                            >
                                                Vote
                                            </Button>}
                                            {voterStatus === VOTER_STATUS_VOTED && <Button
                                                size="small" color="success" variant='contained'
                                                disabled
                                            >
                                                Already Voted
                                            </Button>}
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
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            placeholder='Id'
                                            value={newProposal?.id}
                                            onChange={e => setNewProposal({ ...newProposal, id: e.target.value })}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            placeholder='Name'
                                            value={newProposal?.name}
                                            onChange={e => setNewProposal({ ...newProposal, name: e.target.value })}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            placeholder='Image'
                                            value={newProposal?.avatar}
                                            onChange={e => setNewProposal({ ...newProposal, avatar: e.target.value })}
                                        />
                                    </Grid>
                                </Grid>
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
                    </div>
                    : (voterStatus === VOTER_STATUS_DEFAULT
                        ? <div>
                            <div>You have to register to view this page</div>
                        </div>
                        : <div>You have registered! Please wait for chairperson's approval.</div>
                    ))}
        </Container>
    );
}