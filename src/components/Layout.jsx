import MailIcon from '@mui/icons-material/Mail';
import { AppBar, Box, Button, CssBaseline, Divider, Drawer, List, ListItem, ListItemButton, ListItemText, Toolbar, Tooltip, Typography } from '@mui/material';
import ListItemIcon from '@mui/material/ListItemIcon';
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PAGE_ROUTE_BALLOTS, PAGE_ROUTE_HOME, PAGE_ROUTE_PROPOSALS, PAGE_ROUTE_VOTERS } from '../utils/constants';
import { useDispatch, useSelector } from 'react-redux';
import { ethers } from 'ethers';
import { setAccount, setBallotContract, setProvider } from '../utils/redux/ethers.slice';
import { contractAbi, contractAddress } from '../utils/contract';

const drawerWidth = 240;
const sideBarItems = [
    {
        label: "Home",
        path: PAGE_ROUTE_HOME,
        icon: <MailIcon />,
    },
    {
        label: "Ballot",
        path: PAGE_ROUTE_BALLOTS,
        icon: <MailIcon />,
    },
    {
        label: "Voter",
        path: PAGE_ROUTE_VOTERS,
        icon: <MailIcon />,
    },
    {
        label: "Proposal",
        path: PAGE_ROUTE_PROPOSALS,
        icon: <MailIcon />,
    },
]

export default function Layout({ children }) {
    const { account, provider } = useSelector(state => state.etherState);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

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

    useEffect(() => {
        if (account && provider)
            setContract();
    }, [account, provider]);

    const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0 && account !== accounts[0]) {
            dispatch(setAccount(accounts[0]));
            dispatch(setBallotContract(null));
        } else {
            dispatch(setAccount(null));
        }
    }

    const setContract = async () => {
        await provider.send("eth_requestAccounts", [])
        const signer = provider.getSigner()
        const ballotContract = new ethers.Contract(contractAddress, contractAbi, signer);
        dispatch(setBallotContract(ballotContract))
    }

    const handleClickSideBarItem = (item) => {
        navigate(item.path)
    }

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


    const drawer = (
        <div>
            <Toolbar />
            <Toolbar />
            <Divider />
            <List>
                {sideBarItems.map((item) => (
                    <ListItem selected={item.path === location.pathname} key={item.path} disablePadding>
                        <ListItemButton onClick={() => handleClickSideBarItem(item)}>
                            <ListItemIcon>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.label} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Divider />
        </div>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `100%` },
                    ml: { sm: `${drawerWidth}px` },
                    zIndex: 2,
                }}
            >
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6" noWrap component="div">
                        BALLOT
                    </Typography>
                    <Typography noWrap component="div">
                        {account
                            ? <Tooltip title={account}>
                                <div style={{
                                    width: '200px', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                    overflow: 'hidden', cursor: 'pointer'
                                }}>{account}</div>
                            </Tooltip>
                            : <Button
                                style={{ background: "white" }}
                                onClick={handleConnectWallet}>
                                Connect Wallet
                            </Button>}
                    </Typography>
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
                aria-label="mailbox folders"
            >
                {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
                {/* <Drawer
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
                </Drawer> */}
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, zIndex: 0, },

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
                {children}
            </Box>
        </Box>
    );
}