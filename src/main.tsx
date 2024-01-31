import React from "react";
import ReactDOM from "react-dom/client";
import {
    createTheme,
    ThemeProvider,
    unstable_createMuiStrictModeTheme,
} from "@mui/material";
import { blue, blueGrey } from "@mui/material/colors";
import { registerSW } from "virtual:pwa-register";
import { Route, RouteObject, Routes, HashRouter } from "react-router-dom";

import { RouteList } from "./util/routes.tsx";
import NavBar from "./components/NavBar.tsx";
import "./styles.css";

const theme = unstable_createMuiStrictModeTheme(
    createTheme({
        palette: {
            mode: "dark",
            primary: blue,
            secondary: blueGrey,
        },
    })
);

registerSW({ immediate: true });

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <HashRouter>
                <NavBar />
                <Routes>
                    {RouteList.map((route: RouteObject) => (
                        <Route key={route.id} path={route.path} element={route.element} />
                    ))}
                </Routes>
            </HashRouter>
        </ThemeProvider>
    </React.StrictMode>
);
