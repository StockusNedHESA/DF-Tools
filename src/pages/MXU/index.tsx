import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import FileHandler from "../../util/fileHandler";
import {
    Box,
    Button,
    Divider,
    FormControlLabel,
    LinearProgress,
    Paper,
    Snackbar,
    Stack,
    Typography,
    Checkbox,
    styled,
    IconButton,
    Grid,
    Select,
    MenuItem,
    FormControl,
    TextField,
    InputLabel,
} from "@mui/material";
import useManagerHook from "./manager";
import { Add, Delete } from "@mui/icons-material";

interface Progress {
    total: number;
    current: number;
    currentRule: string;
    complete: boolean;
    errors: string[];
}

const Container = styled(Paper)(({ theme }) => ({
    backgroundColor: "#1e1e1e",
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: "center",
    color: theme.palette.text.secondary,
    width: 475,
    minHeight: 350,
}));

const normalise = (value: number, MAX: number) => (value * 100) / MAX;

function MXU() {
    const fileHandle = useState(new FileHandler())[0];
    const Manager = useManagerHook();

    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");

    function snackbar(message: string) {
        setOpen(true);
        setMessage(message);
    }

    const [directory, setDirectory] = useState({} as IFileSystemDirectory);
    const [progress, setProgress] = useState<Progress>({
        total: 0,
        current: 0,
        currentRule: "Nothing processing",
        complete: false,
        errors: [],
    });
    async function importRules() {
        const [error, data] = await fileHandle.getFiles(false);

        if (error) return snackbar(error.message);
        setDirectory(data);
        setProgress({ ...progress, total: Object.keys(data.entries).length });
    }

    async function processRules() {
        setProgress((prev) => ({ ...prev, current: 0 }));
        for (const rule of Object.values(directory.entries)) {
            setProgress((prev) => ({ ...prev, currentRule: rule.path }));
            const [error, data] = await fileHandle.readFile(rule.path, directory.entries);

            if (error && error.code !== "SCHEMA_VALIDATION_FAILED") {
                snackbar(error.msg);
                continue;
            }

            const processed = Manager.processRule(data as IRule);
            const writeError = await fileHandle.writeFile(rule.path, processed);
            if (writeError) snackbar(writeError.message);

            setProgress((prev) => ({ ...prev, current: prev.current + 1 }));
        }

        setProgress((prev) => ({ ...prev, complete: true }));
    }

    function DividerContent(props: { type: "remover" | "adder" }) {
        function handleClick() {
            if (props.type === "remover") Manager.setRemover((prev) => ({ ...prev, fields: [...prev.fields, ""] }));
            else {
                Manager.setAdder((prev) => ({
                    ...prev,
                    fields: [...prev.fields, { where: "below", location: "", field: "", value: "" }],
                }));
            }
        }

        return (
            <Stack direction={"row"} spacing={3}>
                <IconButton onClick={handleClick}>
                    <Add />
                </IconButton>
                <FormControlLabel
                    control={<Checkbox checked={Manager[props.type].enabled} onChange={() => Manager.toggle(props.type)} />}
                    label={Manager[props.type].enabled ? "Enabled" : "Disabled"}
                />
            </Stack>
        );
    }

    function Remover(props: { index: number }) {
        function handleClick() {
            Manager.setRemover((prev) => ({
                ...prev,
                fields: prev.fields.filter((_, index) => index !== props.index),
            }));
        }

        const [text, setText] = useState(Manager.remover.fields[props.index]);
        const debounced = useDebouncedCallback(
            () =>
                Manager.setRemover((prev) => {
                    const temp = [...prev.fields];
                    temp[props.index] = text;
                    return { ...prev, fields: temp };
                }),
            500
        );

        return (
            <>
                <Stack direction={"row"} spacing={2}>
                    <TextField
                        onChange={(event) => debounced() || setText(event.target.value)}
                        defaultValue={text}
                        label="Field to Remove"
                        sx={{ width: "100%" }}
                        variant="standard"
                    />
                    <IconButton onClick={handleClick}>
                        <Delete />
                    </IconButton>
                </Stack>
                <Divider sx={{ marginTop: 1 }} />
            </>
        );
    }

    function Adder(props: { index: number }) {
        function handleClick() {
            Manager.setAdder((prev) => ({
                ...prev,
                fields: prev.fields.filter((_, index) => index !== props.index),
            }));
        }

        const [data, setData] = useState(Manager.adder.fields[props.index]);
        const debounced = useDebouncedCallback(
            () =>
                Manager.setAdder((prev) => {
                    const temp = [...prev.fields];
                    temp[props.index] = data;
                    return { ...prev, fields: temp };
                }),
            500
        );

        const handler = (key: string, value: unknown) => debounced() || setData({ ...data, [key]: value });

        return (
            <>
                <Grid container columnSpacing={5} spacing={2}>
                    <Grid item>
                        <FormControl variant="standard" sx={{ width: 185, textAlign: "left" }}>
                            <InputLabel variant="standard" htmlFor="uncontrolled-native">
                                Where
                            </InputLabel>
                            <Select label="Where" value={data.where} onChange={(e) => handler("where", e.target.value)}>
                                <MenuItem value="below">Below</MenuItem>
                                <MenuItem value="above">Above</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item>
                        <TextField
                            label="Location"
                            variant="standard"
                            defaultValue={data.location}
                            onChange={(e) => handler("location", e.target.value)}
                        />
                    </Grid>
                    <Grid item>
                        <TextField
                            label="Field"
                            variant="standard"
                            defaultValue={data.field}
                            onChange={(e) => handler("field", e.target.value)}
                        />
                    </Grid>
                    <Grid item>
                        <TextField
                            label="Value"
                            variant="standard"
                            defaultValue={data.value}
                            onChange={(e) => handler("value", e.target.value)}
                        />
                    </Grid>
                    <IconButton onClick={handleClick}>
                        <Delete />
                    </IconButton>
                </Grid>
                <Divider sx={{ marginTop: 1 }} />
            </>
        );
    }

    return (
        <>
            <Snackbar open={open} message={message} autoHideDuration={5000} onClose={() => setOpen(false)} />
            <Stack direction="column" spacing={2} height={"88vh"} style={{ overflow: "hidden", width: 960, margin: "0 auto" }}>
                <Stack direction="row" justifyContent={"space-evenly"}>
                    <Button onClick={importRules}>Import Rules</Button>
                    {progress.total ? (
                        <Box>
                            <Typography variant="h6">
                                Processed Rules {progress.current}/{progress.total}
                            </Typography>
                            <LinearProgress
                                style={{ width: 650, height: 10, borderRadius: 5 }}
                                variant={"determinate"}
                                value={normalise(progress.current, progress.total)}
                            />
                            <Typography style={{ marginTop: 10 }}>{progress.currentRule}</Typography>
                        </Box>
                    ) : (
                        <Typography variant="h5">No directory selected</Typography>
                    )}
                    <Button disabled={!progress.total || (progress.current > 1 && !progress.complete)} onClick={processRules}>
                        Start Processing
                    </Button>
                </Stack>
                <Stack direction={"row"} justifyContent={"space-between"}>
                    <Container>
                        <Typography variant="h5">Field Remover</Typography>
                        <Divider>
                            <DividerContent type={"remover"} />
                        </Divider>
                        {Manager.remover.fields.map((_item, index) => (
                            <Remover key={index} index={index} />
                        ))}
                    </Container>
                    <Container>
                        <Typography variant="h5">Field Adder</Typography>
                        <p style={{ margin: 0 }}>
                            Will <b>NOT</b> work if <b>RuleEditor</b> schema has not been updated!!!
                        </p>
                        <Divider>
                            <DividerContent type={"adder"} />
                        </Divider>
                        {Manager.adder.fields.map((_item, index) => (
                            <Adder key={index} index={index} />
                        ))}
                    </Container>
                </Stack>
            </Stack>
        </>
    );
}

export default MXU;
