import React, { useContext, useEffect, useState } from "react";
import { Snackbar, Alert as MuiAlert } from "@mui/material";

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const SnackBarContext = React.createContext();

export const useToast = () => {
    return useContext(SnackBarContext);
};

const SnackBarProvider = ({ children }) => {
    const [open, setOpen] = useState(false);
    // warning, success, error, info
    const [variant, setVariant] = useState("error");
    const [msg, setMsg] = useState("");

    const handleClose = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }

        setOpen(false);
    };

    const showToast = (_msg, _variant) => {
        setMsg(_msg);
        setVariant(_variant);
        setOpen(true);
    };

    return (
        <SnackBarContext.Provider value={showToast}>
            {children}
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                <Alert
                    onClose={handleClose}
                    severity={variant}
                    sx={{ width: "100%" }}
                >
                    {msg}
                </Alert>
            </Snackbar>
        </SnackBarContext.Provider>
    );
};

export default SnackBarProvider;
