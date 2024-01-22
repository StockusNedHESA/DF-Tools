import { uiTypeIs, rankWith } from "@jsonforms/core";
import { withJsonFormsControlProps } from "@jsonforms/react";
import React from "react";

export default {
    tester: rankWith(1, uiTypeIs("Divider")),
    renderer: withJsonFormsControlProps((): React.ReactElement => {
        return <hr />;
    }),
};
