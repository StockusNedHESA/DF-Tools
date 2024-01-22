import { RouteObject } from "react-router-dom";

import RuleEditor from "../pages/RuleEditor";
import SchemaConversion from "../pages/RuleReport";

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
