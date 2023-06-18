import { Button, Chip, CircularProgress, Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { BALLOT_PHASE_END, BALLOT_PHASE_REGISTERING, BALLOT_PHASE_VOTING } from '../utils/constants';

const rows = [
    {
        title: 'Vote for president',
        shortDesc: 'vote',
        startDate: '11/12/2022',
        endDate: '11/1/2023',
        phase: 0,
    },
];

export default function BallotPage() {
    const { provider, ballotContract } = useSelector(state => state.etherState);
    const [signer, setSigner] = useState(null);
    const [phase, setPhase] = useState(-1);
    const [address, setAddress] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const fetchPhase = async () => {
            console.log('phase')
            const phase = await ballotContract.state();
            setPhase(phase)
        }
        if (ballotContract)
            fetchPhase(ballotContract);
    }, [ballotContract]);


    // const connectContract = async (signer) => {
    //     const ballotContract = new ethers.Contract(contractAddress, contractAbi, signer);
    //     setContract(ballotContract);
    //     // ballotContract.on("EventAddProposal", (index, name) => {
    //     //     console.log(name);
    //     //     fetchProposals();/////////////////////
    //     // });
    // }

    const handleChangePhase = async (ballot) => {
        ballot.phase = phase;
        if (ballot.phase >= BALLOT_PHASE_END)
            return;
        try {
            // console.log(ballot.phase)
            // await provider.send("eth_requestAccounts", [])
            // const signer = provider.getSigner()
            // const ballotContract = new ethers.Contract(contractAddress, contractAbi, signer);
            const res = await ballotContract.changePhase(ballot.phase + 1);
            console.log(res);
            setPhase(res)
            // const proposal = await ballotContract.proposals(0);
            //setProposals([proposal]);
        } catch (error) {
            console.log(error);
        }
    }

    const handleShowWinner = async (ballot) => {
        try {
            // await provider.send("eth_requestAccounts", [])
            // const signer = provider.getSigner()
            // const ballotContract = new ethers.Contract(contractAddress, contractAbi, signer);
            const res = await ballotContract.winnerName();
            alert(res)
        } catch (error) {
            console.log(error);
        }
    }

    const renderPhase = (phase) => {
        switch (phase) {
            case BALLOT_PHASE_REGISTERING:
                return <Chip label="Registering" color="warning" />;
            case BALLOT_PHASE_VOTING:
                return <Chip label="Voting" color="info" />;
            case BALLOT_PHASE_END:
                return <Chip label="End" color="success" />;
            default:
                return <CircularProgress />
        }
    }

    return (
        <Container>
            <h1 className="h4">
                Ballot page
            </h1>
            <div>
                <Button>Add Ballot</Button>
            </div>
            <div>
                <div>List Ballots</div>
                <div style={{ display: 'flex' }}>
                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 650 }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Title</TableCell>
                                    <TableCell align="right">Short Description</TableCell>
                                    <TableCell align="right">Start Date</TableCell>
                                    <TableCell align="right">End Date</TableCell>
                                    <TableCell align="right">Phase</TableCell>
                                    <TableCell align="right">Winner</TableCell>
                                    <TableCell align="center">View</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.map((row, index) => (
                                    <TableRow
                                        key={index}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell component="th" scope="row">
                                            {row.title}
                                        </TableCell>
                                        <TableCell align="right">{row.shortDesc}</TableCell>
                                        <TableCell align="right">{row.startDate}</TableCell>
                                        <TableCell align="right">{row.endDate}</TableCell>
                                        <TableCell align="right">
                                            {renderPhase(phase)}
                                            {(phase === BALLOT_PHASE_REGISTERING || phase === BALLOT_PHASE_VOTING) &&
                                                <Button variant='outlined' onClick={() => handleChangePhase(row)}>{'>'}</Button>}
                                        </TableCell>
                                        <TableCell align="right">
                                            {phase === BALLOT_PHASE_END &&
                                                <Button onClick={() => handleShowWinner(row)}>Show Winner</Button>}
                                        </TableCell>
                                        {/* <TableCell align="right">{row.winner}</TableCell> */}
                                        <TableCell align="right">
                                            <Button onClick={() => navigate('/voters')}>Voters</Button>
                                            <Button onClick={() => navigate('/proposals')}>Proposals</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
            </div>
        </Container>
    );
}