import { uiTypeIs, rankWith } from "@jsonforms/core";
import { withJsonFormsControlProps } from "@jsonforms/react";
import React from "react";

export default {
    tester: rankWith(1, uiTypeIs("Spacing")),
    renderer: withJsonFormsControlProps((): React.ReactElement => {
        return (
            <div style={{ width: "100%", marginTop: 15 }}></div>
        );
    }),
};
