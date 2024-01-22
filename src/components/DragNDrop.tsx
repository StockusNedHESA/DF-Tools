import React, { useState } from "react";
import { Box, Typography } from "@mui/material";

const DragNDrop = () => {
    const [dragging, setDragging] = useState(false);

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragging(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragging(false);
        // Handle the dropped file here
        const file = e.dataTransfer.files[0];
        console.log("Dropped file:", file);
    };

    window.addEventListener("dragenter", () => setDragging(true));

    return (
        <Box
            sx={{
                width: "99%",
                height: "98%",
                border: "2px dashed",
                borderColor: "text.primary",
                borderRadius: "4px",
                position: "absolute",
                top: "0",
                left: "0",
                margin: "10px",
                display: dragging ? "flex" : "none",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 9999,
            }}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <Typography variant="h6" color="primary">
                Drop the file here
            </Typography>
        </Box>
    );
};

export default DragNDrop;
