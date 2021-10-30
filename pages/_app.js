import React from "react";
import "../styles/globals.css";
import "@celo-tools/use-contractkit/lib/styles.css";
import SnackBarProvider from "../components/SnackBarContext";

function MyApp({ Component, pageProps }) {
    return (
        <SnackBarProvider>
            <Component {...pageProps} />
        </SnackBarProvider>
    );
}

export default MyApp;
