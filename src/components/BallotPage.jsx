import { Button, Card, CardActionArea, CardContent, CardMedia, Chip, CircularProgress, Container, Dialog, DialogContent, DialogTitle, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { BALLOT_PHASE_END, BALLOT_PHASE_INIT, BALLOT_PHASE_REGISTERING, BALLOT_PHASE_VOTING } from '../utils/constants';
import useContract from '../utils/hooks/useContract';
import { ethers } from 'ethers';
import { getReasonFromError } from '../utils';
import { useSnackbar } from 'notistack';

const mapPhase = {
    [BALLOT_PHASE_INIT]: {
        label: 'Init',
        color: 'error',
        desc: 'Chairperson adds Proposals and Voters',
    },
    [BALLOT_PHASE_REGISTERING]: {
        label: 'Register',
        color: 'warning',
        desc: 'Users register to get right to vote',
    },
    [BALLOT_PHASE_VOTING]: {
        label: 'Vote',
        color: 'info',
        desc: 'Voters start voting'
    },
    [BALLOT_PHASE_END]: {
        label: 'End',
        color: 'success',
        desc: 'Found the winner',
    },
}
export default function BallotPage() {
    const [ballot, setBallot] = useState();
    const [loading, setLoading] = useState(true);
    const [winner, setWinner] = useState();

    const { ballotContract, isChairperson, loading: loadingPermission } = useContract();
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBallot = async () => {
            const ballot = await ballotContract.getBallotInfo();
            setBallot({
                chairperson: ballot._chairperson,
                title: ballot._title,
                phase: ballot._phase,
                totalProposals: ballot.totalProposals.toNumber(),
                totalVoters: ballot.totalVoters.toNumber(),
                totalRegistrations: ballot.totalRegistrations.toNumber(),
            });
            setLoading(false);
        }
        if (ballotContract)
            fetchBallot();
    }, [ballotContract]);

    const handleChangePhase = async () => {
        if (ballot.phase >= BALLOT_PHASE_END)
            return;
        try {
            const res = await ballotContract.changePhase(ballot.phase + 1);
        } catch (error) {
            enqueueSnackbar(getReasonFromError(error), {
                autoHideDuration: 3000, variant: 'error'
            });
        }
    }

    const handleShowWinner = async () => {
        try {
            const res = await ballotContract.getWinner();
            setWinner({ name: res.name, avatar: res.avatar, voteCount: res.voteCount.toNumber(), });
        } catch (error) {
            enqueueSnackbar(getReasonFromError(error), {
                autoHideDuration: 3000, variant: 'error'
            });
        }
    }

    return (<Container>
        {loadingPermission ? <CircularProgress />
            : <div>{loading ? <CircularProgress />
                : <Grid container spacing={2}>
                    <Grid item xs={12} sx={{ textAlign: 'center', fontSize: '25px', fontWeight: 'bold', }}>
                        {ballot.title}
                    </Grid>
                    <Grid item xs={12} sx={{ textAlign: 'center', }}>
                        Vote for your favorite anime character and show your support! Will it be the iconic and heroic protagonist from your favorite anime series,
                        or perhaps a lovable sidekick who stole your heart? The choice is yours, and every vote counts.
                    </Grid>
                    <Grid item xs={5}>
                        <b>Chairperson: </b>
                    </Grid>
                    <Grid item xs={4}>
                        {ballot.chairperson}
                    </Grid>
                    <Grid item xs={5}>
                        <b>Phase: </b>
                    </Grid>
                    <Grid item xs={2}>
                        <Tooltip
                            placement='top'
                            title={mapPhase[ballot.phase].desc}
                        >
                            <div>
                                <Chip label={mapPhase[ballot.phase].label} color={mapPhase[ballot.phase].color} />
                            </div>
                        </Tooltip>
                    </Grid>
                    <Grid item xs={3}>
                        {(ballot.phase === BALLOT_PHASE_REGISTERING || ballot.phase === BALLOT_PHASE_VOTING || ballot.phase === BALLOT_PHASE_INIT) && isChairperson &&
                            <Button variant='outlined' onClick={() => handleChangePhase()}>Next</Button>}
                        {ballot.phase === BALLOT_PHASE_END &&
                            <Button variant='outlined' onClick={() => handleShowWinner()}>Show Winner</Button>}
                    </Grid>
                    <Grid item xs={5}>
                        <b>Total Proposals: </b>
                    </Grid>
                    <Grid item xs={2}>
                        {ballot.totalProposals}
                    </Grid>
                    <Grid item xs={3}>
                        <Link to={'/proposals'}>Detail</Link>
                    </Grid>
                    <Grid item xs={5}>
                        <b>Total voters: </b>
                    </Grid>
                    <Grid item xs={2}>
                        {ballot.totalVoters}
                    </Grid>
                    <Grid item xs={3}>
                        <Link to={'/voters'}>{isChairperson ? 'Detail' : "Register now"}</Link>
                    </Grid>
                    <Grid item xs={5}>
                        <b>Total Registrations: </b>
                    </Grid>
                    <Grid item xs={2}>
                        {ballot.totalRegistrations}
                    </Grid>
                    {isChairperson && <Grid item xs={3}>
                        <Link to={'/voters'}>Detail</Link>
                    </Grid>}
                </Grid>}
                {!!winner && <Dialog
                    open={true}
                    onClose={() => setWinner(null)}
                >
                    <Card sx={{ width: 345, textAlign: 'center' }} key={winner.name}>
                        <CardActionArea>
                            <CardMedia
                                component="img"
                                height="140"
                                image={winner.avatar}
                                alt="Image"
                                sx={{ objectFit: 'fill' }}
                            />
                            <CardContent>
                                <Typography gutterBottom variant="h5" component="div">
                                    {winner.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {winner.voteCount} votes
                                </Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Dialog>}
            </div>}
    </Container >);
}