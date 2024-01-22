import { RouteObject } from "react-router-dom";

import RuleEditor from "../pages/RuleEditor";
import SchemaConversion from "../pages/SchemaConversion";

export const RouteList: RouteObject[] = [
    {
        id: "Rule Editor",
        path: "/",
        element: <RuleEditor />,
    },
    {
        id: "Rule Report",
        path: "/schema-conversion",
        element: <SchemaConversion />,
    },
];
