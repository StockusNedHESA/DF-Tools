/**
 * Adds a spacing element to the form.
 * @packageDocumentation
 * @module React
 * @preferred
 * @see {@link https://jsonforms.io/docs/custom-renderer}
 */

import { uiTypeIs, rankWith } from "@jsonforms/core";
import { withJsonFormsControlProps } from "@jsonforms/react";

export default {
    tester: rankWith(1, uiTypeIs("Spacing")),
    renderer: withJsonFormsControlProps((): React.ReactElement => {
        return (
            <div style={{ width: "100%", marginTop: 15 }}></div>
        );
    }),
};
