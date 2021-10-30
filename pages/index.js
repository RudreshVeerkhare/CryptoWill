import React, { useCallback, useEffect, useState } from "react";
import {
    ContractKitProvider,
    useContractKit,
} from "@celo-tools/use-contractkit";

import { Header } from "../components";
import { useToast } from "../components/SnackBarContext";
import LockerFactoryJson from "../build/contracts/LockerFactory.json";
import { LOCKER_FACTORY } from "../address";

function App() {
    const [lockers, setLockers] = useState([]);
    const { address, performActions } = useContractKit();
    const [addressState, setAddressState] = useState();
    const showToast = useToast();

    useEffect(() => {
        performActions(async (kit) => {
            // get factory contract instance
            const factory = new kit.web3.eth.Contract(
                LockerFactoryJson.abi,
                LOCKER_FACTORY
            );

            // get all lockers owned by current address
            const allLockers = await factory.methods.getLocker(address).call();

            // set to state
            setLockers(allLockers);
        }).catch((err) => {
            console.log("App => ", err);
            showToast(err.message, "error");
        });

        setAddress(address);
    }, [addressState]);

    const addLocker = (locker) => {
        setLockers([locker, ...lockers]);
    };

    const setAddress = (addr) => {
        console.log(addr, addressState);
        if (addr !== addressState) setAddressState(addr);
    };

    return (
        <main
            className="container"
            style={{
                backgroundImage: `url(/blockchain.png)`,
                backgroundPositionX: "-23%",
                backgroundPositionY: "-9%",
                backgroundRepeat: "repeat-x",
                backgroundSize: "900px",
            }}
        >
            <Header setAddress={setAddress} addressState={addressState} />
        </main>
    );
}

function WrappedApp() {
    return (
        <ContractKitProvider
            dapp={{
                name: "My awesome dApp",
                description: "My awesome description",
                url: "https://example.com",
            }}
        >
            <App />
        </ContractKitProvider>
    );
}
export default WrappedApp;
