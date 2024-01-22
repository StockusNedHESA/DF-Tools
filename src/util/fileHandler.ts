import { XMLBuilder } from "fast-xml-parser";
import { parseText, sortJSON } from "./functions";

/**
 * FileHandler is a class that handles file operations.
 * It has methods to get files, read files, and write files.
 */
class FileHandler {
    fileSystem: FileSystemDirectory | undefined;
    private Builder: XMLBuilder;

    constructor() {
        this.fileSystem = undefined;

        this.Builder = new XMLBuilder({
            format: true,
        });
    }

    /**
     * handlePermissions is a private method that handles permissions for a directory handle.
     * It queries for readwrite permission and if not granted, it requests for it.
     *
     * @param {FileSystemDirectoryHandle} handle - The directory handle.
     */
    private async handlePermissions(handle: FileSystemDirectoryHandle) {
        const permission = await handle.queryPermission({ mode: "readwrite" });

        if (permission !== "granted")
            await handle.requestPermission({ mode: "readwrite" });
    }

    /**
     * getFiles is a method that gets files from a directory.
     * It shows a directory picker, handles permissions, and sets the file system.
     *
     * @returns {Promise<[Error, null] | [null, FileSystemDirectory]>} A promise that resolves to an error or a directory.
     */
    async getFiles(): Promise<[Error, null] | [null, FileSystemDirectory]> {
        try {
            const fileSystem = await window.showDirectoryPicker();
            await this.handlePermissions(fileSystem);

            const dir: FileSystemDirectory = {
                path: fileSystem.name,
                handle: fileSystem as FileSystemDirectoryHandle,
                entries: {},
            };

            for await (const [name, handle] of fileSystem.entries()) {
                const path = `${dir.path}/${name}`;

                dir.entries[path] = {
                    path,
                    handle,
                    parentHandle: fileSystem,
                    entries: {},
                };
            }

            this.fileSystem = dir;
            return [null, dir];
        } catch (error) {
            return [error as Error, null];
        }
    }

    /**
     * findEntry is a private method that finds an entry in the file system that matches a filename.
     *
     * @param {string} filename - The filename to find.
     * @returns {FileSystemDirectory} The found entry.
     */
    private findEntry(filename: string): FileSystemDirectory {
        return [...Object.values(this.fileSystem!.entries)].find(
            (entry) => entry.path === filename
        )!;
    }

    /**
     * readFile is a method that reads a file from the file system.
     * It finds the file handle, gets the file, reads the text, and parses the text.
     *
     * @param {string} filePath - The path of the file to read.
     * @returns {Promise<[Error, null] | [null, IRule]>} A promise that resolves to an error or a rule.
     */
    public async readFile(
        filePath: string
    ): Promise<[Error, null] | [null, IRule]> {
        try {
            if (this.fileSystem === undefined)
                return [new Error("No file system"), null];

            const handle = this.findEntry(filePath).handle;
            const file = (await handle.getFile(filePath)) as File;
            const content = await file.text();

            return parseText(content);
        } catch (error) {
            return [error as Error, null];
        }
    }

    /**
     * writeFile is a method that writes a rule to a file in the file system.
     * It finds the file handle, creates a writable stream, builds the XML, and writes the XML to the file.
     *
     * @param {string} filePath - The path of the file to write.
     * @param {IRule} content - The rule to write.
     * @returns {Promise<Error | undefined>} A promise that resolves to an error or undefined.
     */
    public async writeFile(
        filePath: string,
        content: IRule
    ): Promise<Error | undefined> {
        try {
            if (this.fileSystem === undefined)
                return new Error("No file system");

            const handle = this.findEntry(filePath)
                .handle as FileSystemFileHandle;
            const writable = await handle.createWritable();

            const xml = this.Builder.build({
                Rule: {
                    Specification: sortJSON(content),
                },
            });

            await writable.write({
                type: "write",
                data: `<?xml version="1.0" encoding="utf-8"?>\n${xml}`,
            });
            await writable.close();
        } catch (error) {
            return error as Error;
        }
    }

    /**
     * writeFileAs is a method that writes a rule to a new file.
     * It shows a save file picker, creates a writable stream, builds the XML, and writes the XML to the file.
     *
     * @param {IRule} content - The rule to write.
     * @returns {Promise<Error | undefined>} A promise that resolves to an error or undefined.
     */
    public async writeFileAs(content: IRule) {
        try {
            console.log(content);
            const handle = await window.showSaveFilePicker({
                suggestedName: `${content.Id}.xml`,
            });

            const writable = await handle.createWritable();

            const xml = this.Builder.build({
                Rule: {
                    Specification: sortJSON(content),
                },
            });

            await writable.write({
                type: "write",
                data: `<?xml version="1.0" encoding="utf-8"?>\n${xml}`,
            });
            await writable.close();
        } catch (error) {
            return error as Error;
        }
    }
}

export default FileHandler;
