import { Container } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

export default function HomePage() {
    const { provider, ballotContract, account } = useSelector(state => state.etherState);
    const [title, setTitle] = useState();

    useEffect(() => {
        const fetchTitle = async () => {
            const title = await ballotContract.title();
            console.log(title)
            setTitle(title)
        }
        if (ballotContract)
            fetchTitle(ballotContract);
    }, [ballotContract]);

    return (
        <Container>
            {account ?
                <div>
                    <h2>{title}</h2>
                    <span>Description...</span>
                    <br />
                    <span>Rule...</span>
                </div>
                : <span>Connect your wallet to view this page</span>}
        </Container>
    );
}