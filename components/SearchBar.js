import React, { useEffect, useState } from "react";
import { Typography, InputBase, Grid, TextField } from "@mui/material";
import ContractCard from "./ContractCard";
import styles from "../styles/SearchBar.module.css";
import Image from "next/image";
import "../styles/SearchBar.module.css";

const SearchBar = ({ lockers }) => {
    const [contractName, setContractName] = useState("");

    return (
        <>
            <Typography variant="h4">Your Will Contracts</Typography>
            <TextField
                variant="standard"
                placeholder="Enter Contract Name"
                className={styles.searchbar}
                value={contractName}
                onChange={(e) => setContractName(e.target.value)}
            />

            {!lockers.length ? (
                <div style={{ padding: "20px", textAlign: "center" }}>
                    <Image
                        src="/undraw_Vault_re_s4my.svg"
                        alt="No Will Contracts"
                        width="500"
                        height="250"
                    />
                    <Typography
                        variant="h4"
                        padding="15px"
                        fontFamily="'Rampart One', cursive"
                    >
                        No Contracts Yet !
                    </Typography>
                </div>
            ) : (
                lockers.map((addr) => (
                    <ContractCard key={addr} lockerAddr={addr} />
                ))
            )}
        </>
    );
};
export default SearchBar;
