import { useState } from "react";

interface Remover {
    enabled: boolean;
    fields: string[];
}

interface Adder {
    enabled: boolean;
    fields: AdderField[];
}

interface AdderField {
    where: string;
    location: string;
    field: string;
    value: string;
}

function useManagerHook() {
    const [remover, setRemover] = useState<Remover>({
        enabled: false,
        fields: ["WorkflowStatus"],
    });

    const [adder, setAdder] = useState<Adder>({
        enabled: false,
        fields: [
            {
                where: "below",
                location: "Id",
                field: "ValidFrom",
                value: "22056",
            },
        ],
    });

    function toggle(type: "remover" | "adder") {
        if (type === "remover") setRemover({ ...remover, enabled: !remover.enabled });
        else setAdder({ ...adder, enabled: !adder.enabled });
    }

    function processRule(rule: IRule) {
        if (remover.enabled) removeField(rule);
        if (adder.enabled) addFeilds(rule);
        return rule;
    }

    function removeField(rule: IRule) {
        for (const key of remover.fields) {
            if (Object.prototype.hasOwnProperty.call(rule, key)) delete rule[key];
        }
    }

    function addFeilds(rule: IRule) {
        for (const item of adder.fields) {
            const locationKey = Object.keys(rule).indexOf(item.location);
            if (locationKey === -1) continue;

            addToObject(rule, item.field, item.value, locationKey + (item.where == "below" ? 1 : -1));

            set(rule, item.field, item.value);
        }
    }

    function addToObject(obj: { [key: string]: unknown }, key: string, value: string, index: number) {
        const temp: { [key: string]: unknown } = {};
        let i = 0;

        for (const prop in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                if (i === index && key) temp[key] = value;
                temp[prop] = obj[prop];
                i++;
            }
        }

        if (!index && key) temp[key] = value;

        return temp;
    }

    function set(object: { [key: string]: unknown }, key: string, value: unknown, properties = key.split("."), i = 0) {
        if (i === properties.length - 1) object[properties[i]] = value;
        else set(object[properties[i]] as { [key: string]: unknown }, "", value, properties, i + 1);
    }

    return { remover, setRemover, adder, setAdder, toggle, processRule };
}

export default useManagerHook;
