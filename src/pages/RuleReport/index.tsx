import { useState } from "react";
import FileHandler from "../../util/fileHandler";
import {
    Box,
    Button,
    CircularProgress,
    Divider,
    LinearProgress,
    Snackbar,
    Stack,
    Typography,
} from "@mui/material";
import { parseDirectoryName } from "../../util/functions";
import XLSX from "xlsx";
import Mapping from "./data/ruleMapping.json";

interface Progress {
    total: number;
    reading: number;
    readingCurrent: string;
    finalizing: boolean;
    complete: boolean;
}

const normalise = (value: number, MAX: number) => (value * 100) / MAX;

function RuleReport() {
    const fileHandle = useState(new FileHandler())[0];

    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");

    function snackbar(message: string) {
        setOpen(true);
        setMessage(message);
    }

    const [directory, setDirectory] = useState({} as IFileSystemDirectory);
    const [progress, setProgress] = useState({
        total: 0,
        reading: 0,
        readingCurrent: "Nothing processing",
        finalizing: false,
        complete: false,
    } as Progress);

    async function importRules() {
        const [error, data] = await fileHandle.getFiles(true);

        if (error) return snackbar(error.message);

        setDirectory(data);
    }

    const workbook = useState(XLSX.utils.book_new())[0];
    async function startProcessing() {
        setProgress((prev) => ({
            ...prev,
            total: Object.keys(directory.entries).reduce(
                (acc, cur) => acc + Object.keys(directory.entries[cur].entries).length,
                0
            ),
        }));

        const tempRules = [] as IRule[];
        for (const entry of Object.values(directory.entries)) {
            for (const rule of Object.values(entry.entries)) {
                const [error, data] = await fileHandle.readFile(rule.path, entry.entries);

                if (error) {
                    snackbar(`Error reading ${rule.path.split("/").pop()}: ${error.message}`);
                    continue;
                }

                tempRules.push({ ...data, "{folder}": rule.path.split("/").shift() });
                setProgress((prev) => ({
                    ...prev,
                    reading: prev.reading + 1,
                    readingCurrent: rule.path.split("/").pop() as string,
                }));
            }
        }

        setProgress((prev) => ({ ...prev, finalizing: true }));

        const rules: IRule[] = [];
        for (const rule of tempRules) {
            rules.push(
                Mapping.reduce((acc, cur) => {
                    let value = rule[cur.field];
                    if (Array.isArray(value)) value = value.join(", ");
                    if (cur) {
                        acc[cur.label] = (value || "") as string;
                    }

                    return acc;
                }, {} as { [key: string]: string })
            );
        }

        const worksheet = XLSX.utils.json_to_sheet(rules);

        const fieldLengths = Object.keys(rules[0]).reduce((acc: number[], field: string) => {
            const lengths = rules.map((rule) => (rule[field] as string).length);
            const averageLength = Math.ceil(
                lengths.reduce((sum, length) => sum + length, 0) / lengths.length
            );

            if (averageLength < field.length) return [...acc, field.length];
            return [...acc, averageLength];
        }, []);

        worksheet["!cols"] = fieldLengths.map((size) => ({ wch: size }));

        XLSX.utils.book_append_sheet(workbook, worksheet, "Rules");
        setProgress((prev) => ({ ...prev, complete: true }));
    }

    function HandleProcessing() {
        if (!directory?.handle) return <Typography variant="h5">No directory selected</Typography>;

        return (
            <Stack
                direction={"column"}
                alignItems={"center"}
                justifyContent={"space-evenly"}
                spacing={5}
            >
                <Box sx={{ opacity: progress.reading === 0 ? "10%" : "100%" }}>
                    <Typography variant="h6">
                        Reading Rules {progress.reading}/{progress.total}
                    </Typography>
                    <LinearProgress
                        style={{ width: 650, height: 10, borderRadius: 5 }}
                        variant={"determinate"}
                        value={normalise(progress.reading, progress.total)}
                    />
                    <Typography style={{ marginTop: 10 }}>{progress.readingCurrent}</Typography>
                </Box>
                <Box sx={{ opacity: progress.finalizing ? "100%" : "10%" }}>
                    <Typography variant="h6">Finalizing</Typography>
                    <CircularProgress
                        sx={{
                            margin: "10px 0",
                            [`& .MuiCircularProgress-circle`]: {
                                animation: !progress.complete ? "" : "none",
                                strokeDasharray:
                                    !progress.complete ? "" : "none",
                            },
                        }}
                    />
                </Box>
                <Box sx={{ opacity: progress.complete ? "100%" : "10%" }}>
                    <Typography variant="h6">Rule Report Complete</Typography>
                    <Button
                        sx={{ margin: "0 auto" }}
                        disabled={!progress.complete}
                        variant={"contained"}
                        onClick={() => XLSX.writeFile(workbook, "RulesReport.xlsx")}
                    >
                        Download
                    </Button>
                </Box>
            </Stack>
        );
    }

    return (
        <>
            <Snackbar
                open={open}
                message={message}
                autoHideDuration={5000}
                onClose={() => setOpen(false)}
            />
            <Stack direction="column" spacing={2} height={"88vh"} style={{ overflow: "hidden", width:1280, margin:"0 auto" }}>
                <Stack direction="row" justifyContent={"space-evenly"}>
                    <Button variant="contained" onClick={importRules} disabled={!!directory.handle}>
                        Import Rules
                    </Button>
                    <Button
                        variant="contained"
                        onClick={startProcessing}
                        disabled={!directory?.handle || progress.total !== 0}
                    >
                        Start Processing
                    </Button>
                </Stack>
                <Stack
                    direction="row"
                    justifyContent={"space-evenly"}
                    display={directory?.handle ? "flex" : "none"}
                >
                    <Typography variant="h6">Total: {progress.total}</Typography>
                    {directory?.entries &&
                        Object.entries(directory.entries).map(([name, entry]) => (
                            <Typography key={name} variant="h6">
                                {parseDirectoryName(name)}: {Object.keys(entry.entries).length}
                            </Typography>
                        ))}
                </Stack>
                <Divider>Progress</Divider>
                <HandleProcessing />
            </Stack>
        </>
    );
}

export default RuleReport;
