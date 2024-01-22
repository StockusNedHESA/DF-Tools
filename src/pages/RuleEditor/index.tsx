import { MutableRefObject, useEffect, useRef, useState } from "react";

import { JsonForms } from "@jsonforms/react";
import { materialCells } from "@jsonforms/material-renderers";
import {
    Card,
    Grid,
    IconButton,
    Collapse,
    Button,
    Stack,
    Typography,
    Snackbar,
} from "@mui/material";
import { ArrowBack, ArrowForward, Folder } from "@mui/icons-material";

import { SpecificationPicker } from "../../components/SpecificationPicker";
import renderer from "../../components/renderers";
import { keyCondition } from "../../util/functions";

import schema from "./data/schema.json";
import uischema from "./data/uischema.ts";
import defaultdata from "./data/defaultdata.json";
import { DragNDrop } from "../../components/DragNDrop.tsx";

function App() {
    const [data, _setData] = useState(defaultdata as unknown as IRule);
    const [dir, setDir] = useState("");

    const activeData = useRef(data);
    function setData(output: IRule) {
        activeData.current = output;
        _setData(output);
    }

    const [hide, setHide] = useState(false);
    const [collapse, setCollapse] = useState(false);

    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");

    const [modified, setModified] = useState(false);

    const pickerRef: MutableRefObject<PickerRef | undefined> = useRef();

    function handleButton() {
        setCollapse(!collapse);
        setTimeout(() => setHide(!hide), 300);
    }

    function snackbar(message: string) {
        setOpen(true);
        setMessage(message);
    }

    function upversion() {
        const currentVersion = Number(data.Id?.slice(-2));
        if (currentVersion === undefined) return;

        let newVersion = String(currentVersion + 1);
        if (newVersion.length === 1) newVersion = "0" + newVersion;

        const newData = {
            ...data,
            Id: data.Id?.slice(0, -2) + newVersion,
        };

        setData(newData);
    }

    async function saveFile() {
        const result = await pickerRef.current?.saveFile(activeData.current);
        if (result) {
            setModified(false);
            snackbar("Successfully saved the file");
        }
    }

    const handler = (e: KeyboardEvent) => {
        if (e.repeat) return;
        if (keyCondition(e, "KeyS")) {
            e.preventDefault();

            if (!activeData.current.Id) return;
            saveFile();
        }
    };

    useEffect(() => {
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    });

    return (
        <>
            <Snackbar
                open={open}
                message={message}
                autoHideDuration={5000}
                onClose={() => setOpen(false)}
            />
            <DragNDrop update={setData} snackbar={snackbar} />
            <IconButton
                onClick={handleButton}
                style={{
                    position: "absolute",
                    left: 0,
                    background: "#1e1e1e",
                    borderRadius: "0px 15px 15px 0px",
                }}
            >
                {hide ? <ArrowForward /> : <ArrowBack />}
            </IconButton>
            <Grid container spacing={2}>
                <Grid item xs={3} style={{ display: hide ? "none" : "" }}>
                    <Collapse orientation="horizontal" in={!collapse}>
                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            style={{ marginBottom: "8px" }}
                        >
                            <IconButton
                                disabled={!dir}
                                onClick={() => pickerRef.current?.getFiles()}
                                aria-label="Change Direcotry"
                            >
                                <Folder />
                            </IconButton>
                            <Typography variant="h6">
                                Current Directory: {dir || "None"}
                            </Typography>
                        </Stack>
                        <Card sx={{ padding: "10px" }}>
                            <SpecificationPicker
                                ref={pickerRef}
                                update={setData}
                                setDir={setDir}
                                snackbar={snackbar}
                            />
                        </Card>
                    </Collapse>
                </Grid>
                <Grid item xs>
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        style={{ marginBottom: "10px" }}
                    >
                        <div>
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={upversion}
                                style={{ marginRight: "10px" }}
                                disabled={!data.Id || !data.Id.includes("V0")}
                            >
                                Upversion
                            </Button>
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={() => setData(defaultdata as IRule)}
                            >
                                Create New
                            </Button>
                        </div>
                        <div>
                            <Button
                                variant="contained"
                                onClick={() => saveFile()}
                                color={modified ? "error" : "primary"}
                                disabled={!data.Id}
                            >
                                Save Rule
                            </Button>
                        </div>
                    </Stack>
                    <JsonForms
                        schema={schema}
                        uischema={uischema}
                        data={data}
                        renderers={renderer}
                        cells={materialCells}
                        onChange={({ data }) => {
                            setModified(true);
                            setData(data);
                            console.log(data);
                        }}
                    />
                </Grid>
            </Grid>
        </>
    );
}

export default App;
