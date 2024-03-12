import { RouteObject } from "react-router-dom";

import RuleEditor from "../pages/RuleEditor";
import RuleReport from "../pages/RuleReport";
import MXU from "../pages/MXU";

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
    {
        id: "Mass XML Updater",
        path: "/mxu",
        element: <MXU/>
    }
];
