/**
 * DragNDrop is a component that allows the user to drag and drop a file onto the page.
 * It is used to import a rule from a file.
 * It is a div that is hidden by default, but is shown when the user drags a file over the page.
 * When the user drops the file, the text is read from the file, parsed, and if there is no error, the rule is updated.
 *
 * @see {@link https://mui.com/components/typography/}
 * @see {@link https://mui.com/components/box/}
 */

import { useState, DragEvent } from "react";
import { Box, Typography } from "@mui/material";
import { parseText } from "../util/functions";

interface Props {
    update: (output: IRule) => void;
    snackbar: (message: string) => void;
}

export const DragNDrop = ({update,snackbar}:Props) => {
    const [dragging, setDragging] = useState(false);

    const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragging(false);
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    /**
     * handleDrop is an asynchronous function that handles the drop event on a div.
     * It prevents the default action, sets dragging to false, reads the text from the dropped file,
     * parses the text, and if there is no error, updates the rule.
     *
     * @param {DragEvent<HTMLDivElement>} e - The drag event.
     */
    const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragging(false);

        const file = e.dataTransfer.files[0];
        const text = await file.text();

        const [error, rule] = parseText(text);
        if (error) return snackbar(error.msg);

        update(rule);
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