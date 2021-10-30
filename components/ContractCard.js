import React, { useEffect, useState, useReducer, useRef } from "react";
import clsx from "clsx";
import {
    Card,
    CardHeader,
    CardContent,
    Collapse,
    IconButton,
    Typography,
    TextField,
    Grid,
    Button,
    List,
    ListItem,
    ListItemText,
} from "@mui/material";

import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import cx from "classnames";
import styles from "../styles/ContractCard.module.css";
import { useContractKit } from "@celo-tools/use-contractkit";
import { useToast } from "../components/SnackBarContext";
import LockerJson from "../build/contracts/Locker.json";
import IERC20Json from "../build/contracts/IERC20.json";
import { BLOCKSCOUT_BASE_URL } from "../constants";
import Big from "big.js";

export default function ContractCard({ lockerAddr }) {
    const [expanded, setExpanded] = useState(false);
    const [name, setName] = useState("");
    const [ownLocker, setOwnLocker] = useState(true);
    const [lockingPeriod, setLockingPeriod] = useState();
    const [lastActive, setLastActive] = useState();
    const [owner, setOwner] = useState();
    const [beneficiary, setBeneficiary] = useState();
    const [dummyState, forceUpdate] = useReducer((x) => x + 1, 0);

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    const { address, performActions } = useContractKit();
    const showToast = useToast();

    useEffect(() => {
        performActions(async (kit) => {
            // get contract instance
            const locker = new kit.web3.eth.Contract(
                LockerJson.abi,
                lockerAddr
            );

            // get title of the locker
            const _name = await locker.methods.name().call();
            setName(_name);

            // check owner
            const _owner = await locker.methods.owner().call();
            setOwnLocker(_owner === address);
            setOwner(_owner);

            // get beneficiary address
            const _beneficiary = await locker.methods.beneficiary().call();
            setBeneficiary(_beneficiary);

            // get last active time
            const _lastActiveTime = parseInt(
                await locker.methods.lastOwnerActive().call()
            );
            console.log(_lastActiveTime);
            setLastActive(_lastActiveTime);

            // get locking period
            const _lockingPeriod = parseInt(
                await locker.methods.lockingPeriod().call()
            );
            console.log(_lockingPeriod);
            setLockingPeriod(_lockingPeriod);

            console.log("Updated at => ", _lockingPeriod + _lastActiveTime);
        }).catch((err) => {
            console.log("ContractCard => ", err);
            showToast(err.message, "error");
        });
    }, [dummyState]);

    const sendHeartBeat = () => {
        performActions(async (kit) => {
            // get contract instance
            const locker = new kit.web3.eth.Contract(
                LockerJson.abi,
                lockerAddr
            );

            // send heartbeat transaction
            const receipt = await locker.methods
                .heartbeat()
                .send({ from: address });

            if (receipt.status) {
                showToast(
                    "Transaction Success, Last Active Time updated",
                    "success"
                );
            }

            // re-render component to update other states
            forceUpdate();
        }).catch((err) => {
            console.log("Send HeartBeat => ", err);
            showToast(err.message, "error");
        });
    };

    return (
        <Card
            className={clsx(
                styles.root,
                ownLocker ? styles.createborder : styles.claimborder
            )}
        >
            <CardHeader
                title={name}
                subheader={lockerAddr}
                action={
                    <IconButton
                        className={clsx(styles.expand, {
                            [styles.expandopen]: expanded,
                        })}
                        onClick={handleExpandClick}
                        aria-expanded={expanded}
                        aria-label="show more"
                    >
                        <ExpandMoreIcon />
                    </IconButton>
                }
            />
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <CardContent>
                    <Typography>
                        Status
                        :&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        <span
                            style={{
                                color:
                                    new Date(
                                        (lastActive + lockingPeriod) * 1000
                                    ) < new Date()
                                        ? "#5DD999"
                                        : "rgba(255, 0, 0, 0.5)",
                            }}
                        >
                            <b>
                                {new Date((lastActive + lockingPeriod) * 1000) <
                                new Date()
                                    ? "Unlocked"
                                    : "Locked"}
                            </b>
                        </span>
                    </Typography>
                    <Typography>
                        Last Active :&nbsp;&nbsp;
                        {new Date(lastActive * 1000).toDateString()}{" "}
                        {new Date(lastActive * 1000).toLocaleTimeString()}
                    </Typography>
                    <Typography>
                        Unlock At :&nbsp;&nbsp;&nbsp;&nbsp;
                        {new Date(
                            (lastActive + lockingPeriod) * 1000
                        ).toDateString()}
                        &nbsp;
                        {new Date(
                            (lastActive + lockingPeriod) * 1000
                        ).toLocaleTimeString()}
                    </Typography>
                    <Typography>
                        Owner : &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        {owner}
                    </Typography>
                    <Typography paddingBottom="2rem">
                        Beneficiary : &nbsp;{beneficiary}
                    </Typography>
                    <ListTokens lockerAddr={lockerAddr} />
                    <WithdrawToken lockerAddr={lockerAddr} />
                    {ownLocker && <DepositToken lockerAddr={lockerAddr} />}
                    {ownLocker && (
                        <Button
                            size="large"
                            sx={{ m: 1 }}
                            variant="contained"
                            className={styles.createbtn}
                            onClick={(e) => sendHeartBeat()}
                        >
                            Send HeartBeat
                        </Button>
                    )}
                </CardContent>
            </Collapse>
        </Card>
    );
}

const DepositToken = ({ lockerAddr }) => {
    const [expanded, setExpanded] = useState(false);
    const [tokenAddr, setTokenAddr] = useState("");
    const [validAddr, setValidAddr] = useState(false);
    const [tokenReserve, setTokenReserve] = useState();
    const [tokenSymbol, setTokenSymbol] = useState();
    const amountRef = useRef();

    const { address, performActions } = useContractKit();
    const showToast = useToast();

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    const validateAddrAndGetTokenAmount = (addrVal) => {
        performActions(async (kit) => {
            // check if valid checksum
            if (!kit.web3.utils.isAddress(addrVal)) {
                setValidAddr(false);
                return;
            }

            // check if valid ERC20 contract
            // create contract instance
            const token = new kit.web3.eth.Contract(IERC20Json.abi, addrVal);

            // check if token has name symbol and decimals
            let _name, _symbol, _decimals;
            try {
                [_name, _symbol, _decimals] = await Promise.all([
                    token.methods.name().call(),
                    token.methods.symbol().call(),
                    token.methods.decimals().call(),
                ]);
                console.log(_name, _symbol, _decimals);
            } catch (err) {
                // this means that contract is not a valid ERC20 contract
                setValidAddr(false);
            }

            // now get the balance of current account
            const balance = await token.methods.balanceOf(address).call();
            console.log(
                balance.toString(),
                _decimals,
                Big(_decimals).toString()
            );
            setTokenReserve(
                Big(balance.toString())
                    .div(Big(10).pow(parseInt(_decimals)))
                    .toString()
            );
            setTokenSymbol(_symbol);
            setValidAddr(true);
            setTokenAddr(addrVal);
        });
    };

    const transferTokens = () => {
        const amount = parseFloat(amountRef.current.value);

        if (amount <= 0) {
            showToast("Invalid Amount", "error");
            return;
        }

        // first check whether adderss is valid
        if (!validAddr) {
            showToast("Not Valid Token Address", "error");
            return;
        }
        performActions(async (kit) => {
            // check if amount is less than total balance
            console.log(tokenAddr);
            const token = new kit.web3.eth.Contract(IERC20Json.abi, tokenAddr);
            const [_balance, decimals] = await Promise.all([
                token.methods.balanceOf(address).call(),
                token.methods.decimals().call(),
            ]);

            const balance = parseFloat(
                Big(_balance.toString())
                    .div(Big(10).pow(parseInt(decimals)))
                    .toString()
            );
            console.log(balance);
            if (balance < amount) {
                showToast("Balance is less than amount specified!", "error");
                return;
            }

            // send transcation to transfer given amount of tokens to
            // locker address
            const receipt = await token.methods
                .transfer(
                    lockerAddr,
                    Big(amount)
                        .times(Big(10).pow(parseInt(decimals)))
                        .toFixed()
                )
                .send({ from: address });

            if (receipt.status) {
                showToast("Transfer Success", "success");
            }

            validateAddrAndGetTokenAmount(tokenAddr);
        }).catch((err) => {
            console.log("Deposit => ", err);
            showToast(err.message, "error");
        });
    };

    return (
        <>
            {/* Deposit Tokens */}
            <Typography
                component="span"
                variant="h6"
                align="center"
                paddingLeft="10px"
                paddingRight="11px"
                paddingBottom="10px"
            >
                Deposit Tokens
            </Typography>
            <IconButton
                className={clsx(styles.expand, {
                    [styles.expandopen]: expanded,
                })}
                onClick={handleExpandClick}
                aria-expanded={expanded}
                aria-label="show more"
            >
                <ExpandMoreIcon />
            </IconButton>
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <Grid container justifyContent="center">
                    <Grid md={6}>
                        <TextField
                            label="Token address"
                            sx={{ m: 1, width: "95%" }}
                            onBlur={(e) =>
                                validateAddrAndGetTokenAmount(e.target.value)
                            }
                        />
                    </Grid>
                    <Grid md={3}>
                        <TextField
                            label="Amount"
                            sx={{ m: 1, width: "95%" }}
                            type="number"
                            inputRef={amountRef}
                        />
                    </Grid>
                    <Grid md={3} textAlign="center" paddingTop="1%">
                        <Button
                            size="large"
                            sx={{ height: "56px" }}
                            variant="contained"
                            className={styles.createbtn}
                            onClick={(e) => transferTokens()}
                        >
                            Deposit
                        </Button>
                    </Grid>
                </Grid>
                <Grid container justifyContent="center">
                    {validAddr && tokenReserve !== undefined && (
                        <Typography padding="1rem">
                            Account Balance :{" "}
                            <b>
                                <span style={{ color: "#35D07F" }}>
                                    {tokenReserve}
                                </span>{" "}
                                <span style={{ color: "#FBD26E" }}>
                                    {tokenSymbol}
                                </span>
                            </b>
                            .
                        </Typography>
                    )}
                </Grid>
            </Collapse>
        </>
    );
};

const WithdrawToken = ({ lockerAddr }) => {
    const [expanded, setExpanded] = useState(false);
    const [tokenAddr, setTokenAddr] = useState("");
    const [validAddr, setValidAddr] = useState(false);
    const [tokenReserve, setTokenReserve] = useState();
    const [tokenSymbol, setTokenSymbol] = useState();
    const amountRef = useRef();

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    const { address, performActions } = useContractKit();
    const showToast = useToast();

    const validateAddrAndGetTokenAmount = (addrVal) => {
        performActions(async (kit) => {
            // check if valid checksum
            if (!kit.web3.utils.isAddress(addrVal)) {
                setValidAddr(false);
                return;
            }

            // check if valid ERC20 contract
            // create contract instance
            const token = new kit.web3.eth.Contract(IERC20Json.abi, addrVal);

            // check if token has name symbol and decimals
            let _name, _symbol, _decimals;
            try {
                [_name, _symbol, _decimals] = await Promise.all([
                    token.methods.name().call(),
                    token.methods.symbol().call(),
                    token.methods.decimals().call(),
                ]);
                console.log(_name, _symbol, _decimals);
            } catch (err) {
                // this means that contract is not a valid ERC20 contract
                setValidAddr(false);
            }

            // now get the balance of current account
            const balance = await token.methods.balanceOf(lockerAddr).call();
            console.log(
                balance.toString(),
                _decimals,
                Big(_decimals).toString()
            );
            setTokenReserve(
                Big(balance.toString())
                    .div(Big(10).pow(parseInt(_decimals)))
                    .toString()
            );
            setTokenSymbol(_symbol);
            setValidAddr(true);
            setTokenAddr(addrVal);
        });
    };

    const withdrawTokens = () => {
        const amount = parseFloat(amountRef.current.value);

        if (amount <= 0) {
            showToast("Invalid Amount", "error");
            return;
        }

        // first check whether adderss is valid
        if (!validAddr) {
            showToast("Not Valid Token Address", "error");
            return;
        }
        performActions(async (kit) => {
            // check if amount is less than total balance
            console.log(tokenAddr);
            const token = new kit.web3.eth.Contract(IERC20Json.abi, tokenAddr);
            const [_balance, decimals] = await Promise.all([
                token.methods.balanceOf(lockerAddr).call(),
                token.methods.decimals().call(),
            ]);

            const balance = parseFloat(
                Big(_balance.toString())
                    .div(Big(10).pow(parseInt(decimals)))
                    .toString()
            );
            console.log(balance);
            if (balance < amount) {
                showToast("Balance is less than amount specified!", "error");
                return;
            }

            // send transaction to transfer given amount of tokens to
            // const get locker contract
            const lockerContract = new kit.web3.eth.Contract(
                LockerJson.abi,
                lockerAddr
            );

            const receipt = await lockerContract.methods
                .withdrawERC20(
                    tokenAddr,
                    address,
                    Big(amount)
                        .times(Big(10).pow(parseInt(decimals)))
                        .toFixed()
                )
                .send({ from: address });

            if (receipt.status) {
                showToast("Withdraw Success", "success");
            }

            validateAddrAndGetTokenAmount(tokenAddr);
        }).catch((err) => {
            console.log("Deposit => ", err);
            showToast(err.message, "error");
        });
    };

    return (
        <>
            {/* Withdraw Tokens */}
            <Typography
                component="span"
                variant="h6"
                align="center"
                paddingLeft="10px"
                paddingRight="11px"
                paddingBottom="10px"
            >
                Withdraw Tokens
            </Typography>
            <IconButton
                className={clsx(styles.expand, {
                    [styles.expandopen]: expanded,
                })}
                onClick={handleExpandClick}
                aria-expanded={expanded}
                aria-label="show more"
            >
                <ExpandMoreIcon />
            </IconButton>
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <Grid container justifyContent="center">
                    <Grid md={6}>
                        <TextField
                            label="Token address"
                            sx={{ m: 1, width: "95%" }}
                            onBlur={(e) =>
                                validateAddrAndGetTokenAmount(e.target.value)
                            }
                        />
                    </Grid>
                    <Grid md={3}>
                        <TextField
                            label="Amount"
                            sx={{ m: 1, width: "95%" }}
                            inputRef={amountRef}
                        />
                    </Grid>
                    <Grid md={3} textAlign="center" paddingTop="1%">
                        <Button
                            size="large"
                            sx={{ height: "56px" }}
                            variant="contained"
                            className={styles.claimbtn}
                            onClick={(e) => withdrawTokens()}
                        >
                            Withdraw
                        </Button>
                    </Grid>
                </Grid>
                <Grid container justifyContent="center">
                    {validAddr && tokenReserve !== undefined && (
                        <Typography padding="1rem">
                            Contract Balance :{" "}
                            <b>
                                <span style={{ color: "#35D07F" }}>
                                    {tokenReserve}
                                </span>{" "}
                                <span style={{ color: "#FBD26E" }}>
                                    {tokenSymbol}
                                </span>
                            </b>
                        </Typography>
                    )}
                </Grid>
            </Collapse>
        </>
    );
};

const ListTokens = ({ lockerAddr }) => {
    const [expanded, setExpanded] = useState(false);
    const [tokens, setTokens] = useState([]);

    const showToast = useToast();

    useEffect(() => {
        const getTokens = async () => {
            const url = `${BLOCKSCOUT_BASE_URL}?module=account&action=tokenlist&address=${lockerAddr}`;

            const data = await (await fetch(url)).json();
            console.log(data);

            if (data.status != 1) {
                console.log("Locked Assets => ", data);
                // showToast("Error While Fetching Locked Assets", "error");
                setTokens([]);
                return;
            }
            // set tokens
            setTokens(data.result);
        };

        getTokens();
    }, [expanded]);

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    return (
        <>
            {/* Withdraw Tokens */}
            <Typography
                component="span"
                variant="h6"
                align="center"
                paddingLeft="10px"
                paddingRight="11px"
                paddingBottom="10px"
            >
                Locked Assets
            </Typography>
            <IconButton
                className={clsx(styles.expand, {
                    [styles.expandopen]: expanded,
                })}
                onClick={handleExpandClick}
                aria-expanded={expanded}
                aria-label="show more"
            >
                <ExpandMoreIcon />
            </IconButton>
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                {tokens.length > 0 ? (
                    <List
                        style={{
                            paddingLeft: "1rem",
                        }}
                    >
                        {" "}
                        <ListItemText>
                            <Grid container justifyContent="center">
                                <Grid item md={2}>
                                    <Typography inline fontWeight="bold">
                                        Name
                                    </Typography>
                                </Grid>
                                <Grid item md={7}>
                                    <Typography inline fontWeight="bold">
                                        Address
                                    </Typography>
                                </Grid>
                                <Grid item md={3}>
                                    <Typography inline fontWeight="bold">
                                        Amount
                                    </Typography>
                                </Grid>
                            </Grid>
                        </ListItemText>
                        {tokens.map((token) => (
                            <ListItemText key={token}>
                                <Grid container justifyContent="center">
                                    <Grid item md={2}>
                                        <Typography inline>
                                            {token.name}
                                        </Typography>
                                    </Grid>
                                    <Grid item md={7}>
                                        <Typography inline>
                                            {token.contractAddress}
                                        </Typography>
                                    </Grid>
                                    <Grid item md={3}>
                                        <Typography inline>
                                            {Big(token.balance)
                                                .div(
                                                    Big(10).pow(
                                                        parseInt(token.decimals)
                                                    )
                                                )
                                                .toString()}{" "}
                                            {token.symbol}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </ListItemText>
                        ))}
                    </List>
                ) : (
                    <Typography
                        textAlign="center"
                        variant="h5"
                        padding="1rem"
                        color="rgba(255, 0, 0, 0.8)"
                    >
                        No Assets are Locked !
                    </Typography>
                )}
            </Collapse>
        </>
    );
};
