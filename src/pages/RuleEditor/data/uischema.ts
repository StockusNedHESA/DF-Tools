export default VerticalLayout([
    Group("Initial Information", [
        HorizontalLayout([
            Control("ID", "Id"),
            HorizontalLayout([
                Control("Valid From", "ValidFrom"),
                Control("Valid To", "ValidTo"),
                Control("Intolerable Flag", "IntolerableFlag"),
            ]),
        ]),
        Control("Plain English Description", "PlainEnglishDescription", {
            options: { multi: true },
        }),
        HorizontalLayout([
            Control("Status", "Status"),
            Control("Last Updated By", "LastUpdatedBy"),
            Control("Peer Reviewed By", "PeerReviewedBy"),
        ]),
    ]),
    Group("Tolerance / Approval Limits", [
        Categorization(
            ["DFENI", "HEFCW", "OFS", "SFC", "DFEEYSG", "WG", "UKRI"].map((name) =>
                Category(name, [
                    HorizontalLayout([
                        ToleranceToggle("Applies to", `AppliesTo${name}`),
                        Control("Trigger Record Count", `${name}TriggerRecordCount`),
                        Control("Trigger Condition", `${name}TriggerCondition`),
                        Control("Trigger Percentage", `${name}TriggerPercentage`),
                    ]),
                    Divider(),
                    HorizontalLayout([
                        VerticalLayout([
                            Control("Provider Record Count", `${name}ProviderRecordCount`, {
                                ...depeondOnOthers(name, "RecordCount"),
                            }),
                            Control("Provider Percentage", `${name}ProviderPercentage`, {
                                ...depeondOnOthers(name, "Percentage"),
                            }),
                        ]),
                        VerticalLayout([
                            Control("Hesa Record Count", `${name}HESARecordCount`, {
                                ...depeondOnOthers(name, "RecordCount"),
                            }),
                            Control("HESA Percentage", `${name}HESAPercentage`, {
                                ...depeondOnOthers(name, "Percentage"),
                            }),
                        ]),
                        VerticalLayout([
                            Control("SC Record Count", `${name}SCRecordCount`, {
                                ...depeondOnOthers(name, "RecordCount"),
                            }),
                            Control("SC Percentage", `${name}SCPercentage`, {
                                ...depeondOnOthers(name, "Percentage"),
                            }),
                        ]),
                    ]),
                ])
            )
        ),
    ]),
    Group("Quality Rule", [
        Control("Technical Population", "TechnicalPopulation", {
            options: { multi: true },
        }),
        Spacing(),
        Control("Technical Validity", "TechnicalValidity", {
            options: { multi: true },
        }),
        Spacing(),
        Control("Developer Notes", "DeveloperNotes", { options: { multi: true } }),
        Spacing(),
        ArrayTable("Fields To Display", "FieldsToDisplay"),
        Spacing(),
        ArrayTable("DM Flags", "DMFlags"),
        Divider(),
        Spacing(),
        HorizontalLayout([Control("Validity", "Validity"), Control("Category", "Category"), Control("Group", "Group"), Control("Rule Scope", "RuleScope")]),
    ]),
    Group("Other", [
        Categorization([
            Category("Initial Information", [
                Control("Reason Required", "ReasonRequired", { options: { multi: true } }),
                Spacing(),
                Control("Author Notes", "AuthorNotes", { options: { multi: true } }),
                Spacing(),
                Divider(),
                Spacing(),
                HorizontalLayout([
                    Control("Review Date", "ReviewDate", {
                        options: { multi: true },
                    }),
                    Control("Legacy Rule Id", "LegacyRuleId", { options: { multi: true } }),
                ]),
            ]),
            Category("History Of Change", [
                Control("Reason For Change", "ReasonForChange", {
                    options: { multi: true },
                }),
                ArrayTable("History Of Change", "HistoryOfChange"),
            ]),
        ]),
    ]),
]) as ISchemaStandard;

interface ISchemaStandard {
    type: string;
    label?: string;
    elements: ISchemaStandard[];
    options?: object;
}

function VerticalLayout<T>(elements: T[]) {
    return {
        type: "VerticalLayout",
        elements,
    };
}

function HorizontalLayout<T>(elements: T[]) {
    return {
        type: "HorizontalLayout",
        elements,
    };
}

function Group<T>(label: string, elements: T[]) {
    return {
        type: "Group",
        label,
        elements,
    };
}

function Categorization<T>(elements: T[]) {
    return {
        type: "Categorization",
        elements,
    };
}

function Category<T>(label: string, elements: T[]) {
    return {
        type: "Category",
        label,
        elements,
    };
}

function RuleScope<T>(label: string, elements: T[]) {
    return {
        type: "RuleScope",
        label,
        elements,
    };
}

function Control<T extends object>(label: string, scope: string, params: T = {} as T) {
    return {
        type: "Control",
        label,
        scope: `#/properties/${scope}`,
        ...params,
    };
}

function Divider() {
    return { type: "Divider" };
}

function Spacing() {
    return { type: "Spacing" };
}

function ToleranceToggle(label: string, scope: string) {
    return {
        type: "ToleranceToggle",
        label,
        scope: `#/properties/${scope}`,
    };
}

function ArrayTable(label: string, scope: string) {
    return {
        type: "ArrayTable",
        label,
        scope: `#/properties/${scope}`,
    };
}

function depeondOnOthers(name: string, type: string) {
    return {
        rule: {
            effect: "ENABLE",
            condition: {
                scope: "#",
                schema: {
                    required: [`${name}Trigger${type}`],
                },
            },
        },
    };
}
