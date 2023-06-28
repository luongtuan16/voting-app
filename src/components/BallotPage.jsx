import { Button, Card, CardActionArea, CardContent, CardMedia, Chip, CircularProgress, Container, Dialog, DialogContent, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { BALLOT_PHASE_END, BALLOT_PHASE_INIT, BALLOT_PHASE_REGISTERING, BALLOT_PHASE_VOTING } from '../utils/constants';
import useContract from '../utils/hooks/useContract';
import { ethers } from 'ethers';

export default function BallotPage() {
    const [ballot, setBallot] = useState();
    const [loading, setLoading] = useState(true);
    const [winner, setWinner] = useState();

    const { ballotContract, isChairperson, loading: loadingPermission } = useContract();

    const navigate = useNavigate();

    useEffect(() => {
        const fetchBallot = async () => {
            const ballot = await ballotContract.getBallotInfo();
            console.log(ballot)
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
        if (ballotContract && isChairperson)
            fetchBallot();
    }, [ballotContract, isChairperson]);

    const handleChangePhase = async () => {
        if (ballot.phase >= BALLOT_PHASE_END)
            return;
        try {
            const res = await ballotContract.changePhase(ballot.phase + 1);
        } catch (error) {
            console.log(error);
        }
    }

    const handleShowWinner = async () => {
        try {
            const res = await ballotContract.getWinner();
            setWinner({ name: res.name, avatar: res.avatar, voteCount: res.voteCount.toNumber(), });
        } catch (error) {
            console.log(error);
        }
    }

    const renderPhase = (phase) => {
        switch (phase) {
            case BALLOT_PHASE_INIT:
                return <Chip label="Init" color="error" />;
            case BALLOT_PHASE_REGISTERING:
                return <Chip label="Registering" color="warning" />;
            case BALLOT_PHASE_VOTING:
                return <Chip label="Voting" color="info" />;
            case BALLOT_PHASE_END:
                return <Chip label="End" color="success" />;
            default:
                return <></>
        }
    }

    return (<Container>
        {loadingPermission ? <CircularProgress />
            : (isChairperson ?
                <div>
                    {loading ? <CircularProgress />
                        : <Grid container spacing={2}>
                            <Grid item xs={12} sx={{ textAlign: 'center', fontSize: '25px', fontWeight: 'bold', }}>
                                {ballot.title}
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
                                {renderPhase(ballot.phase)}
                            </Grid>
                            <Grid item xs={3}>
                                {(ballot.phase === BALLOT_PHASE_REGISTERING || ballot.phase === BALLOT_PHASE_VOTING || ballot.phase === BALLOT_PHASE_INIT) &&
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
                                <Link to={'/voters'}>Detail</Link>
                            </Grid>
                            <Grid item xs={5}>
                                <b>Total Registrations: </b>
                            </Grid>
                            <Grid item xs={2}>
                                {ballot.totalRegistrations}
                            </Grid>
                            <Grid item xs={3}>
                                <Link to={'/voters'}>Detail</Link>
                            </Grid>
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
                </div>
                : <span>You don't have permission to view this page!</span>
            )
        }
    </Container >);
}