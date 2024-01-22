import * as React from "react";
import MenuIcon from "@mui/icons-material/Menu";
import {
    AppBar,
    Button,
    Divider,
    Box,
    CssBaseline,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Toolbar,
    Typography,
} from "@mui/material";
import { RouteObject, useNavigate } from "react-router-dom";

import { RouteList } from "../util/routes";

interface Props {
    window?: () => Window;
}

const drawerWidth = 240;

export default function DrawerAppBar(props: Props) {
    const { window } = props;
    const navigator = useNavigate();
    const [mobileOpen, setMobileOpen] = React.useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen((prevState) => !prevState);
    };

    const drawer = (
        <Box
            onClick={handleDrawerToggle}
            sx={{ textAlign: "center", paddingBottom: "100px" }}
        >
            <Typography variant="h6" sx={{ my: 2 }}>
                DF Tools
            </Typography>
            <Divider />
            <List>
                {RouteList.map((item: RouteObject) => (
                    <ListItem key={item.id} disablePadding>
                        <ListItemButton
                            onClick={() => navigator(item.path as string)}
                            sx={{ textAlign: "center" }}
                        >
                            <ListItemText primary={item.id} />
                        </ListItemButton>
                    </ListItem>
                ))}
                <ListItem key="refresh" disablePadding>
                    <ListItemButton
                        onClick={() => location.reload()}
                        sx={{ textAlign: "center" }}
                    >
                        <ListItemText primary="Refresh" />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );

    const container =
        window !== undefined ? () => window().document.body : undefined;

    return (
        <Box sx={{ display: "flex", marginBottom: "50px" }}>
            <CssBaseline />
            <AppBar component="nav">
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: "none" } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6">DF Tools</Typography>
                    <Box
                        sx={{
                            marginLeft: "auto",
                            display: { xs: "none", sm: "block" },
                        }}
                    >
                        {RouteList.map((item) => (
                            <Button
                                onClick={() => navigator(item.path as string)}
                                key={item.id}
                                sx={{ color: "#fff" }}
                            >
                                {item.id}
                            </Button>
                        ))}
                        <Button
                            onClick={() => location.reload()}
                            sx={{
                                color: "#fff",
                                borderLeft: "1px solid #fff",
                                borderRadius: "0px",
                            }}
                        >
                            Refresh
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>
            <nav>
                <Drawer
                    container={container}
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                    }}
                    sx={{
                        display: { xs: "block", sm: "none" },
                        "& .MuiDrawer-paper": {
                            boxSizing: "border-box",
                            width: drawerWidth,
                        },
                    }}
                >
                    {drawer}
                </Drawer>
            </nav>
        </Box>
    );
}
