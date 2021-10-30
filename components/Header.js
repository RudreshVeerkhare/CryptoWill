import React, { useEffect, useState } from "react";
import { Grid, Typography, Button, IconButton } from "@mui/material";
import { useContractKit } from "@celo-tools/use-contractkit";
import { Refresh } from "@material-ui/icons";
import { useToast } from "./SnackBarContext";
import Image from "next/image";
import "../styles/Header.module.css";

const Header = ({ addressState, setAddress }) => {
    const { address, connect, destroy, kit, performActions, getConnectedKit } =
        useContractKit();

    const showToast = useToast();

    useEffect(() => {
        console.log("Header Mounted!!, Kit changed");
        setAddress(address);
    }, [kit]);

    return (
        <Grid
            container
            style={{
                marginTop: "50px",
                width: "50%",
            }}
            justify="center"
            // alignItems="flex-end"
        >
            <Grid
                item
                md={12}
                xs={12}
                justifyContent="center"
                textAlign="center"
            >
                <Typography variant="h1" fontFamily="'Rampart One', cursive">
                    CryptoWill
                </Typography>
                <Typography
                    variant="h6"
                    fontFamily="'Rampart One', cursive"
                    padding="10px"
                >
                    Write Your Will into the Blockchain
                </Typography>
            </Grid>
            <Grid
                item
                md={12}
                xs={12}
                justifyContent="center"
                textAlign="center"
            >
                <Image src="/logo.png" alt="Logo" width="500" height="500" />
            </Grid>
            <Grid item md={12} xs={12} justify="center" textAlign="center">
                {!address ? (
                    <Button
                        onClick={(e) => {
                            connect().catch((err) => {
                                console.log(err);
                                showToast(err.message, "error");
                            });
                        }}
                        style={{
                            margin: "20px",
                        }}
                    >
                        Connect Wallet
                    </Button>
                ) : (
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "center",
                            padding: "20px",
                        }}
                    >
                        <Typography
                            color="textSecondary"
                            variant="h6"
                            gutterBottom
                        >
                            {address}
                        </Typography>
                        <IconButton
                            style={{ padding: "0 0 5px 0" }}
                            onClick={(e) =>
                                connect().catch((err) => {
                                    console.log("Reconnect Button => ", err);
                                    showToast(err.message);
                                })
                            }
                            title="Refresh Account"
                        >
                            <Refresh />
                        </IconButton>
                    </div>
                )}
            </Grid>
        </Grid>
    );
};

export default Header;
