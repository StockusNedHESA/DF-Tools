function updateTolerance(type: string, toggle: boolean) {
    const expression = `//button[text()='${type}']`;
    const contextNode = document.querySelector('[role="tablist"') as Node;
    const typeResult = XPathResult.FIRST_ORDERED_NODE_TYPE;

    const node = document.evaluate(
        expression,
        contextNode,
        null,
        typeResult,
        null
    )!.singleNodeValue as HTMLElement;

    if (!node?.style) return;

    if (toggle) {
        node.style.backgroundColor = "#1976d2";
    } else {
        node.style.backgroundColor = "";
    }
}

function updateAllTolerance(data: IRule) {
    for (const key of ["DFENI", "HEFCW", "OFS", "SFC", "DFEEYSG", "WG"]) {
        const toggle = data[`AppliesTo${key}` as keyof IRule];
        updateTolerance(key, !!toggle);
    }
}

function resetTolerance() {
    updateAllTolerance({
        AppliesToDFENI: undefined,
        AppliesToHEFCW: undefined,
        AppliesToOFS: undefined,
        AppliesToSFC: undefined,
        AppliesToDFEEYSG: undefined,
        AppliesToWG: undefined,
    } as unknown as IRule);
}

function keyCondition(event: KeyboardEvent, key: string) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return ((navigator.userAgentData.platform === "Mac" ? event.metaKey : event.ctrlKey)
        && event.code === key)
    
}

import schema from "../pages/RuleEditor/data/schema.json" 
function sortJSON(data: IRule) {
    const sorted: IRule = {};

    for (const key of Object.keys(schema.properties)) {
        const value = data[key as keyof IRule];

        if (Array.isArray(value)) 
            sorted[key as keyof IRule] = value.length === 1 ? value[0] : value;

        if (value !== undefined)
            sorted[key as keyof IRule] = data[key as keyof IRule];
    }

    return sorted;
}

export {
    resetTolerance,
    updateTolerance,
    updateAllTolerance,
    keyCondition,
    sortJSON,
};
