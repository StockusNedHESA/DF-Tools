import * as Functions from "../../util/functions";
import { JSDOM } from "jsdom";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Schema = require("../../pages/RuleEditor/data/schema.json");

const { window } = new JSDOM();

describe("Functions", () => {
    describe("keyCondition", () => {
        it("should handle the key press event", () => {
            const event = new window.KeyboardEvent("keypress", {
                code: "KeyS",
                ctrlKey: true,
            });
            const result = Functions.keyCondition(event, "KeyS");

            expect(result).toBeTruthy();
        });

        it("should handle the key press event when CTRL not present", () => {
            const event = new window.KeyboardEvent("keydown", {
                code: "KeyS",
                ctrlKey: false,
            });

            const result = Functions.keyCondition(event, "KeyS", window.navigator);

            expect(result).toBeFalsy();
        });
    });

    describe("sortJSON", () => {
        it("should sort the JSON", () => {
            const data = {
                FieldsToDisplay: ["Test"],
                Id: "Test",
            } as unknown as IRule;

            const result = Functions.sortJSON(data, Schema);

            expect(result).toHaveProperty("Id", "Test");
            expect(result).toHaveProperty("FieldsToDisplay", ["Test"]);

            expect(Object.keys(result)[0]).toEqual("Id");
        });
    });

    describe("parseText", () => {
        it("should return an error if the XML is invalid", () => {
            const [error, rule] = Functions.parseText("invalid");

            expect(error).toBeInstanceOf(Error);
            expect(error).toHaveProperty("message", "Invalid XML");

            expect(rule).toBeNull();
        });

        it("should return a rule if the XML is valid", () => {
            const [error, rule] = Functions.parseText(
                "<Rule><Specification><Id>Test</Id></Specification></Rule>"
            );

            expect(error).toBeNull();

            expect(rule).toHaveProperty("Id", "Test");
        });

        it("should return a rule with arrays for certain keys", () => {
            const [error, rule] = Functions.parseText(
                "<Rule><Specification><FieldsToDisplay>Test</FieldsToDisplay></Specification></Rule>"
            );

            expect(error).toBeNull();

            expect(rule).toHaveProperty("FieldsToDisplay", ["Test"]);
        });

        it("should return a rule with arrays for certain keys even if there is only one value", () => {
            const [error, rule] = Functions.parseText(
                "<Rule><Specification><FieldsToDisplay>Test</FieldsToDisplay><FieldsToDisplay>Test2</FieldsToDisplay></Specification></Rule>"
            );

            expect(error).toBeNull();

            expect(rule).toHaveProperty("FieldsToDisplay", ["Test", "Test2"]);
        });
    });
});
