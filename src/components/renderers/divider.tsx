/**
 * Creates a Simple devider
 * @packageDocumentation
 * @module React
 * @preferred
 * @see {@link https://jsonforms.io/docs/custom-renderer}
 */

import { uiTypeIs, rankWith } from "@jsonforms/core";
import { withJsonFormsControlProps } from "@jsonforms/react";

export default {
    tester: rankWith(1, uiTypeIs("Divider")),
    renderer: withJsonFormsControlProps((): React.ReactElement => {
        return <hr />;
    }),
};
