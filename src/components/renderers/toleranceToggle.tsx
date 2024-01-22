import { uiTypeIs, rankWith, ControlProps } from "@jsonforms/core";
import { withJsonFormsControlProps } from "@jsonforms/react";
import { Checkbox, FormControlLabel } from "@mui/material";
import React, { PropsWithChildren } from "react";
import { updateTolerance } from "../../util/functions";

export default {
    tester: rankWith(1, uiTypeIs("ToleranceToggle")),
    renderer: withJsonFormsControlProps(
        (props: PropsWithChildren<ControlProps>): React.ReactElement => {
            const { data, handleChange, path, uischema } = props;

            return (
                <FormControlLabel
                    style={{ paddingTop: "15px" }}
                    label={`${uischema.label} ${uischema.scope.slice(22)}`}
                    control={
                        <Checkbox
                            checked={!!data}
                            onChange={(_ev, isChecked) => {
                                const type = uischema.scope.slice(22);

                                updateTolerance(type, isChecked);
                                handleChange(
                                    path,
                                    isChecked ? type : undefined
                                )
                            }
                            }
                        />
                    }
                />
            );
        }
    ),
};
