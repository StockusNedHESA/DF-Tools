/**
 * SpecificationPicker contains the logic for selecting a specification file
 * and displaying the files in a tree view.
 *
 * @see {@link https://mui.com/components/autocomplete/}
 * @see {@link https://mui.com/components/text-fields/}
 * @see {@link https://mui.com/components/grid/}
 * @see {@link https://mui.com/components/buttons/}
 * @see {@link https://mui.com/components/tree-view/}
 */

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
    const [files, setFiles] = useState({} as IFileOption);
    const fileHandle = useState(new FileHandler())[0];

    /**
     * useImperativeHandle is a React hook that customizes the instance value that is exposed to parent components when using ref.
     * In this case, it exposes an asynchronous function saveFile that saves a rule to a file.
     *
     * @param {IRule} rule - The rule to be saved.
     * @returns {Promise<boolean>} A promise that resolves to a boolean indicating whether the save was successful.
     */
    useImperativeHandle(ref, () => ({
        async saveFile(rule: IRule): Promise<boolean> {
            // Check if the file system is defined and find an existing entry that includes the rule's Id in its path
            const existing =
                fileHandle.fileSystem === undefined
                    ? undefined
                    : Object.values(fileHandle.fileSystem!.entries).find(
                          (entry) => entry.path.includes(rule.Id as string)
                      );

            // If an existing entry was found, write the rule to the file at the existing path
            const success = existing ? await fileHandle.writeFile(existing.path, rule)
                        : await fileHandle.writeFileAs(rule);

            if (success instanceof Error) {
                snackbar(
                    `Error occured while saving Specifcation:\n${success.message}`
                );
                return false;
            }
            
            // If no error occurred, return true (success)
            return true;
        },
        getFiles: () => getFiles(),
    }));

    /**
     * getFiles is an asynchronous function that fetches files from a directory.
     * It uses the fileHandle to get the files, sets the directory path, and sets the files state.
     * The files state is an object where the keys are the group names and the values are arrays of file options.
     * Each file option includes an id, a group, and a label.
     *
     * @returns {Promise<void>} A promise that resolves when the files have been fetched and the state has been set.
     */
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
                .reduce(function (rv: IFileOption, x: IFileOptionContent) {
                    (rv[x["group"]] = rv[x["group"]] || []).push(x);
                    return rv;
                }, {})
        );
    }

    /**
     * selectFile is an asynchronous function that reads a rule from a file and updates the rule.
     * It resets the tolerance, updates the rule, and updates all tolerance.
     *
     * @param {string} path - The path of the file to read.
     * @returns {Promise<void>} A promise that resolves when the rule has been read and updated.
     */
    async function selectFile(path: string) {
        const [error, rule] = await fileHandle.readFile(path);
        if (error)
            return snackbar(
                `Error occured while reading XML:\n${error.msg}`
            );

        resetTolerance();
        update(rule);
        updateAllTolerance(rule);
    }

    const SelectFiles = useMemo(
        () =>
            Object.keys(files).reduce(
                (acc, cur) => [...acc, ...files[cur]],
                [] as IFileOptionContent[]
            ),
        [files]
    );

    /**
     * This is a JSX component that renders a grid of files.
     * If there are files, it renders a grid container with an autocomplete search bar and a tree view of the files.
     * The autocomplete search bar allows the user to search for a rule by label.
     * The tree view displays the files grouped by their group names.
     * Each file is a tree item that, when clicked, calls the selectFile function with the file's id.
     */
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
