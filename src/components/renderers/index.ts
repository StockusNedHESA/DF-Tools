import { materialRenderers } from "@jsonforms/material-renderers";
import { JsonFormsRendererRegistryEntry } from "@jsonforms/core";

import divider from "./divider";
import spacing from "./spacing";
import toleranceToggle from "./toleranceToggle";
import array from "./array";

export default [
    ...materialRenderers,
    {
        tester: toleranceToggle.tester,
        renderer: toleranceToggle.renderer,
    },
    {
        tester: divider.tester,
        renderer: divider.renderer,
    },
    {
        tester: spacing.tester,
        renderer: spacing.renderer,
    },
    {
        tester: array.tester,
        renderer: array.renderer,
    },
] as JsonFormsRendererRegistryEntry[];
