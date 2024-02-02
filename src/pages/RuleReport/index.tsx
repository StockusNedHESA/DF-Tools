import { Fragment, useState } from "react";
import FileHandler from "../../util/fileHandler";
import {
    Autocomplete,
    Box,
    Button,
    Divider,
    LinearProgress,
    List,
    ListItem,
    ListItemText,
    Paper,
    Snackbar,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { parseDirectoryName, createWorksheet } from "../../util/functions";
import ExcelJS from "exceljs";
import saveAs from "file-saver";
import Mapping from "./data/ruleMapping.json";
import ValidFolders from "./data/validFolders.json";

interface Progress {
    total: number;
    reading: number;
    readingCurrent: string;
    complete: boolean;
    errors: { rule: string; error: IValidationError }[];
}

const normalise = (value: number, MAX: number) => (value * 100) / MAX;

function RuleReport() {
    const fileHandle = useState(new FileHandler())[0];
    const [folders, setFolders] = useState(ValidFolders as string[]);

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
        complete: false,
        errors: [],
    } as Progress);

    async function importRules() {
        const [error, data] = await fileHandle.getFiles(true);

        if (error) return snackbar(error.message);

        const filteredData: IFileSystemDirectory = {
            path: data.path,
            handle: data.handle,
            entries: folders
                .filter((folder) => Object.keys(data.entries).includes(`${data.path}/${folder}`))
                .reduce(
                    (acc, folder) => ({
                        ...acc,
                        [`${data.path}/${folder}`]: data.entries[`${data.path}/${folder}`],
                    }),
                    {} as Record<string, IFileSystemDirectory>
                ),
        };

        setDirectory(filteredData);
    }

    const workbook = useState(new ExcelJS.Workbook())[0];
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
                    setProgress((prev) => ({
                        ...prev,
                        errors: [
                            ...prev.errors,
                            { rule: rule.path.split("/").pop() as string, error },
                        ],
                    }));

                    continue;
                }

                tempRules.push({ ...data, "{folder}": rule.path.split("/")[1] });
                setProgress((prev) => ({
                    ...prev,
                    reading: prev.reading + 1,
                    readingCurrent: rule.path.split("/").pop() as string,
                }));
            }
        }

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

        const fieldLengths = Object.keys(rules[0]).reduce((acc: number[], field: string, index) => {
            const lengths = rules.map((rule) => (rule[field] as string).length);
            const averageLength = Math.ceil(
                lengths.reduce((sum, length) => sum + length, 0) / lengths.length
            );

            if (averageLength < field.length) return [...acc, field.length + 2];
            if (averageLength < Mapping[index].label.length)
                return [...acc, Mapping[index].label.length + 2];
            if (averageLength > 50) return [...acc, 50];
            return [...acc, averageLength + 2];
        }, []);

        createWorksheet(workbook, "All Rules", fieldLengths, rules);

        const latestRulesVersions = rules.reduce((acc: { [key: string]: number }, cur: IRule) => {
            const rule = cur["RuleID"] as string;
            const version = Number(rule.match(/V(\d+)$/)![1]);
            const field = rule.slice(0, -4);

            if (!acc[field] || version > acc[field]) {
                acc[field] = version;
            }

            return acc;
        }, {} as { [key: string]: number });

        const latestRules = rules.filter((rule) => {
            const version = Number((rule["RuleID"] as string).match(/V(\d+)$/)![1]);
            const field = (rule["RuleID"] as string).slice(0, -4);
            return version === latestRulesVersions[field];
        });

        createWorksheet(workbook, "Latest Rules", fieldLengths, latestRules);

        setProgress((prev) => ({ ...prev, complete: true }));
    }

    async function saveWorkbook() {
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        saveAs(blob, "RulesReport.xlsx");
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
                <Stack direction={"row"} spacing={5}>
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
                    <Button
                        style={{ maxHeight: 40, marginTop: 17.5 }}
                        disabled={!progress.complete}
                        variant={"contained"}
                        onClick={saveWorkbook}
                    >
                        Download Rule Report
                    </Button>
                </Stack>
                <Paper sx={{ width: "80%", padding: 1 }}>
                    <Stack direction={"row"} justifyContent={"space-between"}>
                        <Typography variant="h6" align="left" marginLeft={2}>
                            Potentials Errors
                        </Typography>
                        <Typography>
                            Rules that errored will not be included in the report
                        </Typography>
                    </Stack>
                    <List>
                        {progress.errors.length === 0 && <Typography>No errors</Typography>}
                        {progress.errors.map((error) => (
                            <ListItem key={error.rule} alignItems={"flex-start"}>
                                <ListItemText
                                    primary={error.rule}
                                    secondary={
                                        <Fragment>
                                            <Typography
                                                sx={{ display: "inline" }}
                                                component="span"
                                                variant="body2"
                                                color="text.primary"
                                            >
                                                {error.error.code} at line {error.error.line}
                                            </Typography>
                                            {` | ${error.error.msg}`}
                                        </Fragment>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
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
            <Stack
                direction="column"
                spacing={2}
                height={"88vh"}
                style={{ overflow: "hidden", width: 1280, margin: "0 auto" }}
            >
                <Stack direction="row" justifyContent={"space-evenly"}>
                    <Stack direction={"row"}>
                        <Button
                            variant="contained"
                            onClick={importRules}
                            disabled={!!directory.handle}
                            style={{ marginRight: 10 }}
                        >
                            Import Rules
                        </Button>
                        <Autocomplete
                            multiple
                            freeSolo
                            sx={{ width: 400 }}
                            options={folders}
                            defaultValue={folders}
                            value={folders}
                            limitTags={3}
                            onChange={(_, value) => setFolders(value)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    variant="standard"
                                    label="Folders to extract from"
                                />
                            )}
                        />
                    </Stack>

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
