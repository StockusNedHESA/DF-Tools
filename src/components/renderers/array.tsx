/**
 * Custom component for rendering arrays as tables
 * Current module with JSON Forms doesn't support resizing columns, drag and drop, and other features
 * This component is a workaround for that
 * @packageDocumentation
 * @module React
 * @preferred
 * @see {@link https://jsonforms.io/docs/custom-renderer}
 * @see {@link https://mui.com/components/data-grid/}
 */

import { uiTypeIs, rankWith, ControlProps } from "@jsonforms/core";
import { withJsonFormsControlProps } from "@jsonforms/react";
import {
    DataGrid,
    GridActionsCellItem,
    GridCellEditStopReasons,
    GridCellModes,
    GridCellModesModel,
    GridCellParams,
    GridColDef,
    GridRenderEditCellParams,
    GridRow,
    GridRowParams,
    GridRowProps,
    GridRowsProp,
    GridToolbarContainer,
    useGridApiContext,
} from "@mui/x-data-grid";
import { PropsWithChildren, useCallback, useEffect, useLayoutEffect, useState } from "react";
import { useDrag } from "@use-gesture/react";
import { Delete, DragIndicator, Add } from "@mui/icons-material";
import { Button, InputBase, InputBaseProps, Paper, Popper, Stack, Typography } from "@mui/material";

export default {
    tester: rankWith(1, uiTypeIs("ArrayTable")),
    renderer: withJsonFormsControlProps((props: PropsWithChildren<ControlProps>) => {
        const { data, handleChange, path, label } = props;

        // State for rows, initially set to data mapped to an array of objects with id and row properties
        const [rows, setRows] = useState<GridRowsProp>(
            (data || []).map((row: string, index: number) => ({
                id: index,
                row,
            }))
        );

        // Effect hook to update rows state when data changes
        useEffect(() => {
            setRows(
                (data || []).map((row: string, index: number) => ({
                    id: index,
                    row,
                }))
            );
        }, [data]);

        const columns: GridColDef[] = [
            {
                field: "drag",
                type: "actions",
                align: "left",
                width: 5,
                getActions: () => [<GridActionsCellItem icon={<DragIndicator />} label="Delete" />],
            },
            {
                field: "row",
                sortable: false,
                flex: 1,
                maxWidth: 1164,
                editable: true,
                type: "string",
                renderEditCell: (params) => <EditTextarea {...params} />,
            },
            {
                field: "delete",
                type: "actions",
                align: "right",
                width: 5,
                getActions: (params: GridRowParams) => [
                    <GridActionsCellItem
                        icon={<Delete />}
                        label="Delete"
                        onClick={() =>
                            handleChange(
                                path,
                                rows.filter((row) => row.id !== params.id).map((row) => row.row)
                            )
                        }
                    />,
                ],
            },
        ];

        /**
         * DraggableRow is a function component that provides a draggable row in a grid.
         * It uses the useDrag hook from the react-use-gesture library to handle drag events.
         *
         * @param {GridRowProps} props - The properties for the component.
         * @returns {JSX.Element} The DraggableRow component.
         */
        const DraggableRow = (props: GridRowProps) => {
            // Use the useDrag hook from the react-use-gesture library
            const bind = useDrag(({ values, last, target }) => {
                const rowBeingDragged = (target as Element).closest(`[data-field="drag"]`)
                    ?.parentElement as HTMLElement;

                // Get the x and y coordinates of the drag and Get the element at the current drag coordinates
                const [x, y] = values;
                const immediateElem = document.elementFromPoint(x, y);

                // Get the row being dragged over
                const rowDraggedOver = immediateElem?.closest(`[data-field="drag"]`)
                    ?.parentElement as HTMLElement;

                if (!rowDraggedOver || !rowBeingDragged) return;

                if (!last) return;

                const pRows = [...rows];
                const targetRowIndex = Number(rowDraggedOver.dataset.rowindex);
                const sourceRowIndex = Number(rowBeingDragged.dataset.rowindex);

                // If the source and target rows are the same, return
                if (targetRowIndex === sourceRowIndex) return;

                const temp = pRows.splice(sourceRowIndex, 1);
                pRows.splice(targetRowIndex, 0, temp[0]);

                // Update the data in the JsonForms state
                handleChange(
                    path,
                    pRows.map((row) => row.row)
                );
            });

            // Return the GridRow component with the drag bindings and the original props
            return <GridRow {...bind()} {...props} />;
        };

        /**
         * EditToolbar is a function component that provides a toolbar for editing arrays.
         * It includes a button for adding new items to the array and a message about how to save changes.
         *
         * @returns {JSX.Element} The EditToolbar component.
         */
        function EditToolbar() {
            const handleClick = () => {
                const id = rows.length;

                if (path === "HistoryOfChange")
                    return setRows((oldRows) => [
                        {
                            id,
                            row: `${new Date().toISOString().slice(0, -14)} `,
                        },
                        ...oldRows,
                    ]);

                setRows((oldRows) => [
                    ...oldRows,
                    {
                        id,
                        row: "",
                    },
                ]);
            };

            return (
                <GridToolbarContainer>
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="stretch"
                        style={{ width: "100%" }}
                    >
                        <div>
                            <Button color="primary" startIcon={<Add />} onClick={handleClick}>
                                Add {label}
                            </Button>
                        </div>
                        <div>
                            <Typography style={{ marginTop: 5 }}>
                                When editing a cell, press CTRL+Enter to save changes
                            </Typography>
                        </div>
                    </Stack>
                </GridToolbarContainer>
            );
        }

        /**
         * EditTextarea is a function component that provides a textarea for editing cell values in a grid.
         * It uses the Material UI Popper for positioning the textarea.
         *
         * @param {GridRenderEditCellParams<any, string>} props - The properties for the component.
         * @returns {JSX.Element} The EditTextarea component.
         */
        function EditTextarea(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            props: GridRenderEditCellParams<any, string>
        ) {
            const { id, field, value, colDef, hasFocus } = props;
            const [valueState, setValueState] = useState(value);
            const [anchorEl, setAnchorEl] = useState<HTMLElement | null>();
            const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null);
            const apiRef = useGridApiContext();

            // Effect hook to focus the input when it has focus
            useLayoutEffect(() => {
                if (hasFocus && inputRef) inputRef.focus();
            }, [hasFocus, inputRef]);

            // Callback to handle the ref
            const handleRef = useCallback((el: HTMLElement | null) => {
                setAnchorEl(el);
            }, []);

            // Callback to handle change in the textarea
            const handleChange = useCallback<NonNullable<InputBaseProps["onChange"]>>(
                (event) => {
                    const newValue = event.target.value;
                    setValueState(newValue);
                    apiRef.current.setEditCellValue(
                        { id, field, value: newValue, debounceMs: 200 },
                        event
                    );
                },
                [apiRef, field, id]
            );

            return (
                <div
                    style={{
                        position: "relative",
                        alignSelf: "flex-start",
                    }}
                >
                    <div
                        ref={handleRef}
                        style={{
                            height: 1,
                            width: colDef.computedWidth,
                            display: "block",
                            position: "absolute",
                            top: 0,
                        }}
                    />
                    {anchorEl && (
                        <Popper open anchorEl={anchorEl} placement="bottom-start">
                            <Paper
                                elevation={1}
                                sx={{
                                    p: 1,
                                    minWidth: colDef.computedWidth,
                                }}
                            >
                                <InputBase
                                    multiline
                                    rows={4}
                                    value={valueState}
                                    sx={{
                                        textarea: { resize: "both" },
                                        width: "100%",
                                    }}
                                    onChange={handleChange}
                                    inputRef={(ref) => setInputRef(ref)}
                                />
                            </Paper>
                        </Popper>
                    )}
                </div>
            );
        }

        /**
         * processRowUpdate is a function that updates a row in the rows array.
         * It finds the index of the row to be updated, creates a copy of the rows array,
         * replaces the row at the found index with the updated row, and then updates the JsonForms state.
         *
         * @param {any} updatedRow - The row that has been updated.
         * @returns {any} The updated row.
         */ // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const processRowUpdate = (updatedRow: any) => {
            const rowIndex = rows.findIndex((row) => row.id === updatedRow.id);

            const updatedRows = [...rows];
            updatedRows[rowIndex] = updatedRow;

            handleChange(
                path,
                updatedRows.map((row) => row.row)
            );

            return updatedRow;
        };

        const [cellModesModel, setCellModesModel] = useState<GridCellModesModel>({});

        /**
         * handleCellClick is a function that handles the click event on a cell in the grid.
         * If the cell is editable, it sets the mode of the cell to Edit and the mode of all other cells to View.
         *
         * @param {GridCellParams} params - The parameters for the cell.
         * @param {React.MouseEvent} event - The mouse event.
         */
        const handleCellClick = useCallback((params: GridCellParams, event: React.MouseEvent) => {
            if (!params.isEditable) return;

            if (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (event.target as any).nodeType === 1 &&
                !event.currentTarget.contains(event.target as Element)
            )
                return;

            setCellModesModel((prevModel) => {
                return {
                    ...Object.keys(prevModel).reduce(
                        (acc, id) => ({
                            ...acc,
                            [id]: Object.keys(prevModel[id]).reduce(
                                (acc2, field) => ({
                                    ...acc2,
                                    [field]: {
                                        mode: GridCellModes.View,
                                    },
                                }),
                                {}
                            ),
                        }),
                        {}
                    ),
                    [params.id]: {
                        ...Object.keys(prevModel[params.id] || {}).reduce(
                            (acc, field) => ({
                                ...acc,
                                [field]: { mode: GridCellModes.View },
                            }),
                            {}
                        ),
                        [params.field]: { mode: GridCellModes.Edit },
                    },
                };
            });
        }, []);

        const handleCellModesModelChange = useCallback((newModel: GridCellModesModel) => {
            setCellModesModel(newModel);
        }, []);

        return (
            <DataGrid
                style={{ width: "100%" }}
                rows={rows}
                columns={columns}
                editMode="cell"
                disableColumnMenu
                disableColumnSelector
                disableDensitySelector
                disableColumnFilter
                rowHeight={30}
                autoHeight
                slots={{
                    row: DraggableRow,
                    toolbar: EditToolbar,
                }}
                cellModesModel={cellModesModel}
                onCellModesModelChange={handleCellModesModelChange}
                onCellClick={handleCellClick}
                processRowUpdate={processRowUpdate}
                hideFooter={true}
                columnHeaderHeight={0}
                onCellEditStop={(params, event) => {
                    if (params.reason !== GridCellEditStopReasons.enterKeyDown) return;

                    const keyEvent = event as KeyboardEvent;
                    if (!!keyEvent.key && !keyEvent.ctrlKey && !keyEvent.metaKey) {
                        event.defaultMuiPrevented = true;
                    }
                }}
            />
        );
    }),
};
