import { Button, Card, CardActionArea, CardContent, CardMedia, CircularProgress, Container, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField, Typography } from '@mui/material';
import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import { VOTER_STATUS_DEFAULT, VOTER_STATUS_NOT_VOTE, VOTER_STATUS_REGISTERED, VOTER_STATUS_VOTED } from '../utils/constants';
import useContract from '../utils/hooks/useContract';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function VoterPage() {
    const { account } = useSelector(state => state.etherState);
    const [openDialog, setOpenDialog] = useState(false);
    const [voterInfo, setVoterInfo] = useState();
    const [voters, setVoters] = useState();
    const [registeringVoters, setRegisteringVoters] = useState();
    const [voterStatus, setVoterStatus] = useState();
    const [newVoter, setNewVoter] = useState();

    const navigate = useNavigate();
    const { ballotContract, isChairperson, loading: loadingPermission } = useContract();

    useEffect(() => {
        const fetchVoterStatus = async () => {
            const status = await ballotContract.getVoterStatus();
            setVoterStatus(status.toNumber());
        }
        if (ballotContract)
            fetchVoterStatus();
    }, [ballotContract]);

    useEffect(() => {
        const fetchVoterInfo = async () => {
            const voter = await ballotContract.voters(account);
            setVoterInfo({ name: voter?.name, avatar: voter?.avatar, address: voter.addr, voted: voter.voted, });
        }
        if (ballotContract)
            fetchVoterInfo();
    }, [ballotContract]);

    useEffect(() => {
        const fetchVoters = async () => {
            const voters = await ballotContract.getValidVoters();
            const registers = await ballotContract.getRegisteringVoters();
            setVoters(voters?.map((voter) => (voter?.addr != ethers.constants.AddressZero ? { name: voter?.name, avatar: voter?.avatar, address: voter.addr, voted: voter.voted, } : null))
                .filter(voter => !!voter));
            setRegisteringVoters(registers?.map((voter) => (voter?.addr != ethers.constants.AddressZero ? { name: voter?.name, avatar: voter?.avatar, address: voter.addr, voted: voter.voted, } : null))
                .filter(voter => !!voter));
        }
        if (ballotContract && isChairperson)
            fetchVoters();
    }, [ballotContract, isChairperson]);


    const handleAddVoter = async () => {
        if (!ballotContract || !isChairperson)
            return;
        try {
            const res = await ballotContract.giveRightToVote(newVoter.address, newVoter.name, newVoter.avatar);
            res.wait();
        } catch (error) {
            console.log(error);
        }
    }

    const handleRegister = async () => {
        if (voterStatus != VOTER_STATUS_DEFAULT)
            return;
        try {
            const res = await ballotContract.registerVoter(newVoter.name, newVoter.avatar);
        } catch (error) {
            console.log(error.errorMessage);
        }
    }

    const handleAcceptRegister = async (register) => {
        if (!ballotContract || !isChairperson)
            return;
        try {
            const res = await ballotContract.giveRightToVote(register.address, '', '');
            res.wait();
        } catch (error) {
            console.log(error);
        }
    }

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setNewVoter();
    }

    const renderVoterView = () => {
        if (voterStatus === VOTER_STATUS_DEFAULT)
            return <div>
                <div>Register to get right to vote</div>
                <Button onClick={() => setOpenDialog(true)}>Register Now</Button>
                <Dialog
                    open={openDialog}
                    onClose={() => { setOpenDialog(false); setVoterInfo(); }}
                    aria-labelledby="edit-apartment"
                >
                    <DialogTitle id="edit-apartment">Register</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    placeholder='Name'
                                    value={newVoter?.name}
                                    onChange={e => setNewVoter({ ...newVoter, name: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    placeholder='Image'
                                    value={newVoter?.avatar}
                                    onChange={e => setNewVoter({ ...newVoter, avatar: e.target.value })}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => { setOpenDialog(false); setVoterInfo(); }} color="secondary">
                            Cancel
                        </Button>
                        <Button onClick={() => { handleRegister(); setOpenDialog(false); setVoterInfo(); }} color="primary">
                            Submit
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        if (voterStatus === VOTER_STATUS_REGISTERED)
            return <div>
                <div>You have registered! Please wait for chairperson's approval.</div>
                {voterInfo ? <Card sx={{ width: 400, textAlign: 'center', margin: "0px 20px 20px 0px" }} key={voterInfo.addr}>
                    <CardActionArea>
                        <CardMedia
                            component="img"
                            height="160"
                            image={voterInfo.avatar}
                            alt="Image"
                        />
                        <CardContent>
                            <Typography gutterBottom variant="h5" component="div">
                                {voterInfo.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {voterInfo.address}
                            </Typography>
                        </CardContent>
                    </CardActionArea>
                    <div style={{ marginBottom: '20px' }}>
                        <Button
                            size="small" color="success" variant='contained'
                            disabled
                        >
                            Waiting
                        </Button>
                    </div>
                </Card> : <CircularProgress />}
            </div>
        return <div>
            {voterInfo ? <Card sx={{ width: 400, textAlign: 'center', margin: "0px 20px 20px 0px" }} key={voterInfo.addr}>
                <CardActionArea>
                    <CardMedia
                        component="img"
                        height="160"
                        image={voterInfo.avatar}
                        alt="Image"
                    />
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
                            {voterInfo.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {voterInfo.address}
                        </Typography>
                    </CardContent>
                </CardActionArea>
                <div style={{ marginBottom: '20px' }}>
                    {voterStatus === VOTER_STATUS_NOT_VOTE && <Button
                        size="small" color="primary" variant='contained'
                        onClick={() => navigate('/proposals')}
                    >
                        Vote Now
                    </Button>}
                    {voterStatus === VOTER_STATUS_VOTED && <Button
                        size="small" color="success" variant='contained'
                        disabled
                    >
                        Show Voted Proposal
                    </Button>}
                </div>
            </Card> : <CircularProgress />}
        </div>
    }

    return (
        <Container>
            {loadingPermission ? <CircularProgress /> :
                (isChairperson ? <div>
                    <h1 className="h4">
                        Voter page
                    </h1>
                    <div>
                        <Button onClick={() => setOpenDialog(true)}>Add Voter</Button>
                    </div>
                    <div>
                        <div>List Voters</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
                            {voters ?
                                voters?.map(voter => <Card sx={{ width: 400, textAlign: 'center', margin: "0px 20px 20px 0px" }} key={voter.addr}>
                                    <CardActionArea>
                                        <CardMedia
                                            component="img"
                                            height="160"
                                            image={voter.avatar}
                                            alt="Image"
                                        />
                                        <CardContent>
                                            <Typography gutterBottom variant="h5" component="div">
                                                {voter.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {voter.address}
                                            </Typography>
                                        </CardContent>
                                    </CardActionArea>
                                    {/* <div style={{ marginBottom: '20px' }}>
                                {voterStatus === VOTER_STATUS_NOT_VOTE && <Button
                                    size="small" color="primary" variant='contained'
                                    onClick={() => handleVotevoter(voter.id)}
                                >
                                    Vote
                                </Button>}
                                {voterStatus === VOTER_STATUS_VOTED && <Button
                                    size="small" color="success" variant='contained'
                                    disabled
                                >
                                    Already Voted
                                </Button>}
                            </div> */}
                                </Card>) : <CircularProgress />}
                        </div>
                    </div>
                    <div>
                        <div>List Registrations</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
                            {registeringVoters ?
                                registeringVoters?.map(voter => <Card sx={{ width: 400, textAlign: 'center', margin: "0px 20px 20px 0px" }} key={voter.addr}>
                                    <CardActionArea>
                                        <CardMedia
                                            component="img"
                                            height="160"
                                            image={voter.avatar}
                                            alt="Image"
                                        />
                                        <CardContent>
                                            <Typography gutterBottom variant="h5" component="div">
                                                {voter.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {voter.address}
                                            </Typography>
                                        </CardContent>
                                    </CardActionArea>
                                    <div style={{ marginBottom: '20px' }}>
                                        <Button size="small" color="info" variant='contained' onClick={() => handleAcceptRegister(voter)}>
                                            Accept
                                        </Button>
                                    </div>
                                </Card>) : <CircularProgress />}
                        </div>
                    </div>
                    <Dialog
                        open={openDialog}
                        onClose={handleCloseDialog}
                        aria-labelledby="edit-apartment"
                    >
                        <DialogTitle id="edit-apartment">Add Voter</DialogTitle>
                        <DialogContent>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        placeholder='Address'
                                        value={newVoter?.address}
                                        onChange={e => setNewVoter({ ...newVoter, address: e.target.value })}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        placeholder='Name'
                                        value={newVoter?.name}
                                        onChange={e => setNewVoter({ ...newVoter, name: e.target.value })}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        placeholder='Image'
                                        value={newVoter?.avatar}
                                        onChange={e => setNewVoter({ ...newVoter, avatar: e.target.value })}
                                    />
                                </Grid>
                            </Grid>
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
                </div>
                    : renderVoterView())}
        </Container>
    );
}