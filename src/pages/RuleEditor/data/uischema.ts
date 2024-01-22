const VerticalLayout = (elements: object[]) => ({
    type: "VerticalLayout",
    elements,
});
const HorizontalLayout = (elements: object[]) => ({
    type: "HorizontalLayout",
    elements,
});
const Group = (label: string, elements: object[]) => ({
    type: "Group",
    label,
    elements,
});
const Categorization = (elements: object[]) => ({
    type: "Categorization",
    elements,
});
const Category = (label: string, elements: object[]) => ({
    type: "Category",
    label,
    elements,
});
const Control = (label: string, scope: string, params: object = {}) => ({
    type: "Control",
    label,
    scope: `#/properties/${scope}`,
    ...params,
});
const Divider = () => ({ type: "Divider" });
const Spacing = () => ({ type: "Spacing" });
const ToleranceToggle = (label: string, scope: string) => ({
    type: "ToleranceToggle",
    label,
    scope: `#/properties/${scope}`,
});
const ArrayTable = (label: string, scope: string) => ({
    type: "ArrayTable",
    label,
    scope: `#/properties/${scope}`,
});

const depeondOnOthers = (name: string, type: string) => ({
    rule: {
        effect:"ENABLE",
        condition: {
            scope: "#",
            schema: {
                required: [`${name}Trigger${type}`],
            },
        },
    }
});

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
            options: {multi:true}
        }),
        HorizontalLayout([
            VerticalLayout([
                Control("Status", "Status"),
                Control("Workflow Status", "WorkflowStatus"),
            ]),
            VerticalLayout([
                Control("Last Updated By", "LastUpdatedBy"),
                Control("Peer Reviewed By", "PeerReviewedBy"),
            ]),
        ]),
    ]),
    Group("Tolerance / Approval Limits", [
        Categorization(
            ["DFENI", "HEFCW", "OFS", "SFC", "DFEEYSG", "WG"].map((name) =>
                Category(name, [
                    HorizontalLayout([
                        ToleranceToggle("Applies to", `AppliesTo${name}`),
                        Control(
                            "Trigger Record Count",
                            `${name}TriggerRecordCount`
                        ),
                        Control("Trigger Condition", `${name}TriggerCondition`),
                        Control(
                            "Trigger Percentage",
                            `${name}TriggerPercentage`
                        ),
                    ]),
                    Divider(),
                    HorizontalLayout([
                        VerticalLayout([
                            Control(
                                "Provider Record Count",
                                `${name}ProviderRecordCount`,
                                { ...depeondOnOthers(name, "RecordCount") }
                            ),
                            Control(
                                "Provider Percentage",
                                `${name}ProviderPercentage`,
                                { ...depeondOnOthers(name, "Percentage") }
                            ),
                        ]),
                        VerticalLayout([
                            Control(
                                "Hesa Record Count",
                                `${name}HESARecordCount`,
                                { ...depeondOnOthers(name, "RecordCount") }
                            ),
                            Control(
                                "HESA Percentage",
                                `${name}HESAPercentage`,
                                { ...depeondOnOthers(name, "Percentage") }
                            ),
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
            options: {multi:true}
        }),
        Spacing(),
        Control("Technical Validity", "TechnicalValidity", {
            options: {multi:true}
        }),
        Spacing(),
        Control("Developer Notes", "DeveloperNotes", { options: {multi:true} }),
        Spacing(),
        ArrayTable("Fields To Display", "FieldsToDisplay"),
        Spacing(),
        ArrayTable("DM Flags", "DMFlags"),
        Divider(),
        Spacing(),
        HorizontalLayout([
            Control("Validity", "Validity"),
            Control("Category", "Category"),
            Control("Group", "Group"),
        ]),
    ]),
    Group("Other", [
        Categorization([
            Category("Initial Information", [
                Control("Reason Required", "ReasonRequired", { options: {multi:true} }),
                Spacing(),
                Control("Author Notes", "AuthorNotes", { options: {multi:true} }),
                Spacing(),
                Divider(),
                Spacing(),
                HorizontalLayout([
                    Control("Review Date", "ReviewDate", {
                        options: {multi:true}
                    }),
                    Control("Legacy Rule Id", "LegacyRuleId", { options: {multi:true} }),
                ]),
            ]),
            Category("History Of Change", [
                Control("Reason For Change", "ReasonForChange", {
                    options: {multi:true}
                }),
                ArrayTable("History Of Change", "HistoryOfChange"),
            ]),
        ]),
    ]),
]);
