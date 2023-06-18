import React, { useState, useEffect } from 'react';
import { AppBar, Box, CssBaseline, Divider, Drawer, ListItemText, Button, List, ListItem, ListItemButton, Toolbar, Typography } from '@mui/material';
import { ethers } from 'ethers';
import MailIcon from '@mui/icons-material/Mail';
import MenuIcon from '@mui/icons-material/Menu';
import ListItemIcon from '@mui/material/ListItemIcon';
import IconButton from '@mui/material/IconButton';
import InboxIcon from '@mui/icons-material/MoveToInbox'

const drawerWidth = 240;

export default function WalletCard() {
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const [provider, setProvider] = useState<any>(null);
    const [account, setAccount] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [votingStatus, setVotingStatus] = useState(true);
    const [remainingTime, setremainingTime] = useState('');
    const [candidates, setCandidates] = useState([]);
    const [number, setNumber] = useState('');
    const [CanVote, setCanVote] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [userBalance, setUserBalance] = useState('');

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
    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };
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
        } else {
            setErrorMessage("Please Install Metamask!!!");
        }
    }

    const handleAccountsChanged = (accounts: any[]) => {
        if (accounts.length > 0 && account !== accounts[0]) {
            setAccount(accounts[0]);
        } else {
            setIsConnected(false);
            setAccount(null);
        }
    }
    const drawer = (
        <div>
            <Toolbar />
            <Divider />
            <List>
                {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
                    <ListItem key={text} disablePadding>
                        <ListItemButton>
                            <ListItemIcon>
                                {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                            </ListItemIcon>
                            <ListItemText primary={text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Divider />
            <List>
                {['All mail', 'Trash', 'Spam'].map((text, index) => (
                    <ListItem key={text} disablePadding>
                        <ListItemButton>
                            <ListItemIcon>
                                {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                            </ListItemIcon>
                            <ListItemText primary={text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </div>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            {/* <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div">
                        Responsive drawer
                    </Typography>
                </Toolbar>
            </AppBar> */}
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
                aria-label="mailbox folders"
            >
                {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
                <Drawer
                    //container={container}
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                    }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>
            <Box
                component="main"
                sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
            >
                <Toolbar />
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
                        <div className="balanceDisplay">
                            <h3>
                                Wallet Amount: {userBalance}
                            </h3>
                        </div>
                    </div>
                    {errorMessage}
                </div>
            </Box>
        </Box>
    );
}