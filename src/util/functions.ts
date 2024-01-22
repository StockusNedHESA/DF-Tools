/**
 * updateTolerance is a function that updates the background color of a button based on a toggle.
 * It uses XPath to find the button and changes its background color.
 *
 * @param {string} type - The text of the button.
 * @param {boolean} toggle - Whether to change the background color.
 */
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

/**
 * updateAllTolerance is a function that updates the background color of all buttons based on a rule.
 * It loops over the keys and calls updateTolerance for each key.
 *
 * @param {IRule} data - The rule.
 */
function updateAllTolerance(data: IRule) {
    for (const key of ["DFENI", "HEFCW", "OFS", "SFC", "DFEEYSG", "WG"]) {
        const toggle = data[`AppliesTo${key}` as keyof IRule];
        updateTolerance(key, !!toggle);
    }
}

/**
 * resetTolerance is a function that resets the background color of all buttons.
 * It calls updateAllTolerance with a rule that has all keys set to undefined.
 */
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

/**
 * keyCondition is a function that checks if a key was pressed with a modifier.
 * It checks if the platform is Mac and uses the meta key as the modifier, otherwise it uses the ctrl key.
 *
 * @param {KeyboardEvent} event - The keyboard event.
 * @param {string} key - The key to check.
 * @returns {boolean} Whether the key was pressed with the modifier.
 */
function keyCondition(event: KeyboardEvent, key: string) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return ((navigator.userAgentData.platform === "Mac"
            ? event.metaKey
            : event.ctrlKey) && event.code === key
    );
}

import schema from "../pages/RuleEditor/data/schema.json";
/**
 * sortJSON is a function that sorts a rule based on a schema.
 * It loops over the keys in the schema and sets the values in the sorted rule.
 *
 * @param {IRule} data - The rule to sort.
 * @returns {IRule} The sorted rule.
 */
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

import { XMLParser, XMLValidator } from "fast-xml-parser";

const Parser = new XMLParser({
    ignoreAttributes: false,
    parseAttributeValue: true,
    numberParseOptions: {
        leadingZeros: false,
        hex: false,
        skipLike: /(?:)/,
    },
});

/**
 * parseText is a function that parses XML text into a rule.
 * It validates the XML text and parses it into a rule.
 * It also ensures that certain keys in the rule are arrays.
 *
 * @param {string} text - The XML text to parse.
 * @returns {[Error, null] | [null, IRule]} An error or the parsed rule.
 */
function parseText(text: string): [Error, null] | [null, IRule] {
    if (!XMLValidator.validate(text)) return [new Error("Invalid XML"), null];

    const rule = Parser.parse(text).Rule.Specification;

    for (const key of ["DMFlags", "HistoryOfChange", "FieldsToDisplay"])
        if (rule[key])
            rule[key] = Array.isArray(rule[key]) ? rule[key] : [rule[key]];

    return [null, rule];
}

export {
    resetTolerance,
    updateTolerance,
    updateAllTolerance,
    keyCondition,
    sortJSON,
    parseText,
};
