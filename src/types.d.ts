export {};

declare global {
    interface IRule {
        Id?: string;
        ValidFrom?: string;
        ValidTo?: string;
        PlainEnglishDescription?: string;
        Status?: "Deleted" | "Amended" | "Added" | "Carried Forward";
        WorkflowStatus?:
            | "Work in Progress"
            | "Ready for PR"
            | "PR Failed"
            | "Ready for SC"
            | "SC Failed"
            | "Ready for Dev"
            | "On Hold";
        LastUpdatedBy?: string;
        PeerReviewedBy?: string;
        IntolerableFlag?: "Yes" | "No";
        AppliesToDFENI?: boolean;
        DFENITriggerRecordCount?: string;
        DFENITriggerCondition?: "AND" | "OR";
        DFENITriggerPercentage?: string;
        DFENIProviderRecordCount?: string;
        DFENIProviderPercentage?: string;
        DFENIHESARecordCount?: string;
        DFENIHESAPercentage?: string;
        DFENISCRecordCount?: string;
        DFENISCPercentage?: string;
        AppliesToHEFCW?: boolean;
        HEFCWTriggerRecordCount?: string;
        HEFCWTriggerCondition?: "AND" | "OR";
        HEFCWTriggerPercentage?: string;
        HEFCWProviderRecordCount?: string;
        HEFCWProviderPercentage?: string;
        HEFCWHESARecordCount?: string;
        HEFCWHESAPercentage?: string;
        HEFCWSCRecordCount?: string;
        HEFCWSCPercentage?: string;
        AppliesToOFS?: boolean;
        OFSTriggerRecordCount?: string;
        OFSTriggerCondition?: "AND" | "OR";
        OFSTriggerPercentage?: string;
        OFSProviderRecordCount?: string;
        OFSProviderPercentage?: string;
        OFSHESARecordCount?: string;
        OFSHESAPercentage?: string;
        OFSSCRecordCount?: string;
        OFSSCPercentage?: string;
        AppliesToSFC?: boolean;
        SFCTriggerRecordCount?: string;
        SFCTriggerCondition?: "AND" | "OR";
        SFCTriggerPercentage?: string;
        SFCProviderRecordCount?: string;
        SFCProviderPercentage?: string;
        SFCHESARecordCount?: string;
        SFCHESAPercentage?: string;
        SFCSCRecordCount?: string;
        SFCSCPercentage?: string;
        AppliesToDFEEYSG?: boolean;
        DFEEYSGTriggerRecordCount?: string;
        DFEEYSGTriggerCondition?: "AND" | "OR";
        DFEEYSGTriggerPercentage?: string;
        DFEEYSGProviderRecordCount?: string;
        DFEEYSGProviderPercentage?: string;
        DFEEYSGHESARecordCount?: string;
        DFEEYSGHESAPercentage?: string;
        DFEEYSGSCRecordCount?: string;
        DFEEYSGSCPercentage?: string;
        AppliesToWG?: boolean;
        WGTriggerRecordCount?: string;
        WGTriggerCondition?: "AND" | "OR";
        WGTriggerPercentage?: string;
        WGProviderRecordCount?: string;
        WGProviderPercentage?: string;
        WGHESARecordCount?: string;
        WGHESAPercentage?: string;
        WGSCRecordCount?: string;
        WGSCPercentage?: string;
        TechnicalPopulation?: string;
        TechnicalValidity?: string;
        Validity?: "Valid" | "Invalid";
        DMFlags?: (
            | "Enhanced Coding Frame"
            | "Derived Field"
            | "Reference Data"
        )[];
        Category?:
            | "Coverage"
            | "Guidance"
            | "Data integrity"
            | "Continuity"
            | "Credibility report"
            | "Updateability"
            | "Foundational (TBC)"
            | "Valid values";
        Group?: string;
        FieldsToDisplay?: string[];
        DeveloperNotes?: string;
        ReasonRequired?: string;
        AuthorNotes?: string;
        ReasonForChange?: string;
        HistoryOfChange?: string[];
        ReviewDate?: string;
        LegacyRuleId?: string;
        [k: string]: unknown;
    }

    interface FileSystemDirectory {
        path: string;
        handle: FileSystemDirectoryHandle | FileSystemFileHandle;
        parentHandle?: FileSystemDirectoryHandle;
        entries: Record<string, FileSystemDirectory>;
    }

    interface FileOption {
        [key: string]: FileOptionContent[];
    }

    interface FileOptionContent {
        id: string;
        group: string;
        label: string;
    }

    interface EditToolbarProps {
        setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
        setRowModesModel: (
            newModel: (oldModel: GridRowModesModel) => GridRowModesModel
        ) => void;
    }

    interface PickerRef {
            saveFile: (rule: IRule) => Promise<boolean>;
    }
}
