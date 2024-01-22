import { useState, useMemo, forwardRef, useImperativeHandle } from "react";
import {
    Autocomplete,
    TextField,
    Typography,
    Grid,
    Button,
} from "@mui/material";
import { ExpandMore, ChevronRight, HorizontalRule } from "@mui/icons-material";
import { TreeView } from "@mui/x-tree-view/TreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import { resetTolerance, updateAllTolerance } from "../util/functions";

import FileHandler from "../util/fileHandler";

interface Props {
    update: (output: IRule) => void;
    setDir: (dir: string) => void;
    snackbar: (message: string) => void;
}

export const SpecificationPicker = forwardRef((props: Props, ref) => {
    const { update, setDir, snackbar } = props;
    const [files, setFiles] = useState({} as FileOption);
    const fileHandle = useState(new FileHandler())[0];

    useImperativeHandle(ref, () => ({
        async saveFile(rule: IRule): Promise<boolean> {
            const existing = fileHandle.fileSystem  === undefined?
                undefined :
                Object.values(fileHandle.fileSystem!.entries).find(
                (entry) => entry.path.includes(rule.Id as string)
            );

            if (existing) {
                const success = await fileHandle.writeFile(existing.path, rule);
                if (success instanceof Error) {
                    snackbar(`Error occured while saving Specifcation:\n${success.message}`);
                    return false
                }
            } else {
                const success = await fileHandle.writeFileAs(rule);
                if (success instanceof Error) {
                    snackbar(`Error occured while saving Specifcation:\n${success.message}`);
                    return false
                }
            }

            return true
        },
    }));

    async function getFiles() {
        const [error, dir] = await fileHandle.getFiles();
        if (error)
            return snackbar(
                `Error occured while fetching directory:\n${error.message}`
            );

        setDir(dir.path);
        setFiles(
            Object.keys(dir.entries)
                .map((path) => {
                    const rule = path.split(".");

                    return {
                        id: path,
                        group: path.split(".")[2],
                        label: `${rule[3]} ${rule[4]} ${rule[5]}`,
                    };
                })
                .sort((a, b) => -b.group.localeCompare(a.group))
                .reduce(function (rv: FileOption, x: FileOptionContent) {
                    (rv[x["group"]] = rv[x["group"]] || []).push(x);
                    return rv;
                }, {})
        );
    }

    async function selectFile(path: string) {
        const [error, rule] = await fileHandle.readFile(path);
        if (error)
            return snackbar(
                `Error occured while reading XML:\n${error.message}`
            );

        resetTolerance();
        update(rule);
        updateAllTolerance(rule);
    }

    const SelectFiles = useMemo(
        () =>
            Object.keys(files).reduce(
                (acc, cur) => [...acc, ...files[cur]],
                [] as FileOptionContent[]
            ),
        [files]
    );

    if (Object.keys(files).length) {
        return (
            <Grid
                container
                direction="row"
                justifyContent="flex-start"
                alignItems="flex-start"
                className="specification"
            >
                <Grid item>
                    <Autocomplete
                        options={SelectFiles}
                        groupBy={(option) => option.group}
                        getOptionLabel={(option) => option.label}
                        filterOptions={(options, state) => {
                            const inputValue = state.inputValue.toLowerCase();
                            return options.filter((option) => {
                                const label = option.label.toLowerCase();
                                return (
                                    label.includes(inputValue) ||
                                    label.includes(
                                        inputValue.replace(/\./g, " ")
                                    ) ||
                                    inputValue
                                        .split(".")
                                        .join(" ")
                                        .includes(label)
                                );
                            });
                        }}
                        sx={{ width: 375, marginTop: 1 }}
                        renderInput={(params) => (
                            <TextField {...params} label="Search for Rule" />
                        )}
                        style={{ marginBottom: "10px" }}
                        onChange={(_, value, type) =>
                            type === "selectOption" && selectFile(value!.id)
                        }
                    />
                </Grid>
                {Object.keys(files).map((group) => (
                    <Grid item key={group}>
                        <TreeView
                            defaultCollapseIcon={<ExpandMore />}
                            defaultExpandIcon={<ChevronRight />}
                            sx={{ width: 375, textAlign: "left" }}
                            disableSelection
                        >
                            <TreeItem nodeId={group} label={group}>
                                {files[group].map((path) => (
                                    <TreeItem
                                        nodeId={path.id}
                                        key={path.id}
                                        label={path.label}
                                        onClick={() => selectFile(path.id)}
                                        icon={<HorizontalRule />}
                                    />
                                ))}
                            </TreeItem>
                        </TreeView>
                    </Grid>
                ))}
            </Grid>
        );
    }

    return (
        <>
            <Grid
                container
                direction="column"
                justifyContent="center"
                alignItems="center"
            >
                <Grid item>
                    <Typography variant="h6">
                        Select a folder that contains specifications
                    </Typography>
                    <Button onClick={getFiles}>Select Here</Button>
                </Grid>
            </Grid>
        </>
    );
});
