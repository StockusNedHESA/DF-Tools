import { RouteObject } from "react-router-dom";

import RuleEditor from "../pages/RuleEditor";
import RuleReport from "../pages/RuleReport";

export const RouteList: RouteObject[] = [
    {
        id: "Rule Editor",
        path: "/",
        element: <RuleEditor />,
    },
    {
        id: "Rule Report",
        path: "/report",
        element: <RuleReport />,
    },
];
