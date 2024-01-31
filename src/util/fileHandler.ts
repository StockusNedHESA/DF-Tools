import { XMLBuilder } from "fast-xml-parser";
import { parseText, sortJSON } from "./functions";

/**
 * FileHandler is a class that handles file operations.
 * It has methods to get files, read files, and write files.
 */
class FileHandler {
    fileSystem: IFileSystemDirectory | undefined;
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
     * Iterates through the files and directories in the specified directory handle.
     *
     * @param {FileSystemDirectoryHandle} directoryHandle - The handle of the directory to iterate through.
     * @param {IFileSystemDirectory} dir - The directory object to store the entries.
     * @param {boolean} recursive - Indicates whether to iterate through subdirectories recursively.
     * @returns {Promise<IFileSystemDirectory>} The directory object with the entries.
     */
    private async iterateFiles(
        directoryHandle: FileSystemDirectoryHandle,
        dir: IFileSystemDirectory = {} as IFileSystemDirectory,
        recursive: boolean = false
    ): Promise<IFileSystemDirectory> {
        for await (const [name, handle] of directoryHandle.entries()) {
            const path = `${dir.path}/${name}`;

            dir.entries[path] = {
                path,
                handle,
                parentHandle: directoryHandle,
                entries: {},
            };

            if (handle.kind === "directory" && recursive) {
                await this.iterateFiles(handle, dir.entries[path], recursive);
            }
        }

        return dir;
    }

    /**
     * getFiles is a method that gets files from a directory.
     * It shows a directory picker, handles permissions, and sets the file system.
     *
     * @returns {Promise<[Error, null] | [null, IFileSystemDirectory]>} A promise that resolves to an error or a directory.
     */
    async getFiles(
        recursive: boolean = false
    ): Promise<[Error, null] | [null, IFileSystemDirectory]> {
        try {
            const fileSystem = await window.showDirectoryPicker();
            await this.handlePermissions(fileSystem);

            const dir: IFileSystemDirectory = {
                path: fileSystem.name,
                handle: fileSystem as FileSystemDirectoryHandle,
                entries: {},
            };

            this.fileSystem = await this.iterateFiles(
                fileSystem,
                dir,
                recursive
            );
            return [null, this.fileSystem];
        } catch (error) {
            return [error as Error, null];
        }
    }

    /**
     * findEntry is a private method that finds an entry in the file system that matches a filename.
     *
     * @param {string} filename - The filename to find.
     * @returns {IFileSystemDirectory} The found entry.
     */
    private findEntry(
        filename: string,
        entries: Record<string, IFileSystemDirectory>
    ): IFileSystemDirectory {
        return [...Object.values(entries)].find(
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
        filePath: string,
        entries: Record<string, IFileSystemDirectory> = this.fileSystem!.entries
    ): Promise<[IValidationError, null] | [null, IRule]> {
        try {
            if (this.fileSystem === undefined)
                return [{ msg: "No file system" } as IValidationError, null];

            const handle = this.findEntry(filePath, entries).handle;
            const file = (await handle.getFile(filePath)) as File;
            const content = await file.text();

            return parseText(content);
        } catch (error) {
            return [{msg: (error as Error).message} as IValidationError, null];
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

            const handle = this.findEntry(filePath, this.fileSystem!.entries)
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
