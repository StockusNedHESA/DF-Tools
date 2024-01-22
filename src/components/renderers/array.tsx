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
import {
    PropsWithChildren,
    useCallback,
    useEffect,
    useLayoutEffect,
    useState,
} from "react";
import { useDrag } from "@use-gesture/react";
import { Delete, DragIndicator, Add } from "@mui/icons-material";
import {
    Button,
    InputBase,
    InputBaseProps,
    Paper,
    Popper,
    Stack,
    Typography,
} from "@mui/material";

export default {
    tester: rankWith(1, uiTypeIs("ArrayTable")),
    renderer: withJsonFormsControlProps(
        (props: PropsWithChildren<ControlProps>) => {
            const { data, handleChange, path, label } = props;

            const [rows, setRows] = useState<GridRowsProp>(
                (data || []).map((row: string, index: number) => ({
                    id: index,
                    row,
                }))
            );

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
                    getActions: () => [
                        <GridActionsCellItem
                            icon={<DragIndicator />}
                            label="Delete"
                        />,
                    ],
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
                                    rows
                                        .filter((row) => row.id !== params.id)
                                        .map((row) => row.row)
                                )
                            }
                        />,
                    ],
                },
            ];

            const DraggableRow = (props: GridRowProps) => {
                const bind = useDrag(({ values, last, target }) => {
                    const rowBeingDragged = (target as Element).closest(
                        `[data-field="drag"]`
                    )?.parentElement as HTMLElement;

                    const [x, y] = values;
                    const immediateElem = document.elementFromPoint(x, y);

                    const rowDraggedOver = immediateElem?.closest(
                        `[data-field="drag"]`
                    )?.parentElement as HTMLElement;
                    if (!rowDraggedOver || !rowBeingDragged) return;

                    if (!last) return;

                    const pRows = [...rows];
                    const targetRowIndex = Number(
                        rowDraggedOver.dataset.rowindex
                    );
                    const sourceRowIndex = Number(
                        rowBeingDragged.dataset.rowindex
                    );

                    if (targetRowIndex === sourceRowIndex) return;

                    const temp = pRows[targetRowIndex];
                    pRows[targetRowIndex] = pRows[sourceRowIndex];
                    pRows[sourceRowIndex] = temp;

                    handleChange(
                        path,
                        pRows.map((row) => row.row)
                    );
                });

                return <GridRow {...bind()} {...props} />;
            };

            function EditToolbar() {
                const handleClick = () => {
                    const id = rows.length;

                    setRows((oldRows) => [
                        ...oldRows,
                        {
                            id,
                            row:
                                path === "HistoryOfChange"
                                    ? `${new Date()
                                          .toISOString()
                                          .slice(0, -14)} `
                                    : "",
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
                                <Button
                                    color="primary"
                                    startIcon={<Add />}
                                    onClick={handleClick}
                                >
                                    Add {label}
                                </Button>
                            </div>
                            <div>
                                <Typography style={{ marginTop: 5 }}>
                                    When editing a cell, press CTRL+Enter to
                                    save changes
                                </Typography>
                            </div>
                        </Stack>
                    </GridToolbarContainer>
                );
            }

            function EditTextarea(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                props: GridRenderEditCellParams<any, string>
            ) {
                const { id, field, value, colDef, hasFocus } = props;
                const [valueState, setValueState] = useState(value);
                const [anchorEl, setAnchorEl] = useState<HTMLElement | null>();
                const [inputRef, setInputRef] =
                    useState<HTMLInputElement | null>(null);
                const apiRef = useGridApiContext();

                useLayoutEffect(() => {
                    if (hasFocus && inputRef) inputRef.focus();
                }, [hasFocus, inputRef]);

                const handleRef = useCallback((el: HTMLElement | null) => {
                    setAnchorEl(el);
                }, []);

                const handleChange = useCallback<
                    NonNullable<InputBaseProps["onChange"]>
                >(
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
                            <Popper
                                open
                                anchorEl={anchorEl}
                                placement="bottom-start"
                            >
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

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const processRowUpdate = (updatedRow: any) => {
                const rowIndex = rows.findIndex(
                    (row) => row.id === updatedRow.id
                );

                const updatedRows = [...rows];
                updatedRows[rowIndex] = updatedRow;

                handleChange(
                    path,
                    updatedRows.map((row) => row.row)
                );

                return updatedRow;
            };

            const [cellModesModel, setCellModesModel] =
                useState<GridCellModesModel>({});

            const handleCellClick = useCallback(
                (params: GridCellParams, event: React.MouseEvent) => {
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
                                ...Object.keys(
                                    prevModel[params.id] || {}
                                ).reduce(
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
                },
                []
            );

            const handleCellModesModelChange = useCallback(
                (newModel: GridCellModesModel) => {
                    setCellModesModel(newModel);
                },
                []
            );

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
                        if (
                            params.reason !==
                            GridCellEditStopReasons.enterKeyDown
                        )
                            return;

                        const keyEvent = event as KeyboardEvent;
                        if (
                            !!keyEvent.key &&
                            !keyEvent.ctrlKey &&
                            !keyEvent.metaKey
                        ) {
                            event.defaultMuiPrevented = true;
                        }
                    }}
                />
            );
        }
    ),
};
