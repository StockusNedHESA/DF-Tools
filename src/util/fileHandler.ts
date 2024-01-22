import { XMLBuilder } from "fast-xml-parser";
import { parseText, sortJSON } from "./functions";

class FileHandler {
    fileSystem: FileSystemDirectory | undefined;
    private Builder: XMLBuilder;

    constructor() {
        this.fileSystem = undefined;

        this.Builder = new XMLBuilder({
            format: true,
        });
    }

    private async handlePermissions(handle: FileSystemDirectoryHandle) {
        const permission = await handle.queryPermission({ mode: "readwrite" });

        if (permission !== "granted")
            await handle.requestPermission({ mode: "readwrite" });
    }

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

    private findEntry(filename: string): FileSystemDirectory {
        return [...Object.values(this.fileSystem!.entries)].find(
            (entry) => entry.path === filename
        )!;
    }

    public async readFile(
        filePath: string
    ): Promise<[Error, null] | [null, IRule]> {
        try {
            if (this.fileSystem === undefined)
                return [new Error("No file system"), null];

            const handle = this.findEntry(filePath).handle;
            const file = await handle.getFile(filePath) as File;
            const content = await file.text();

            return parseText(content);
        } catch (error) {
            return [error as Error, null];
        }
    }

    public async writeFile(
        filePath: string,
        content: IRule
    ): Promise<Error | undefined> {
        try {
            if (this.fileSystem === undefined)
                return new Error("No file system");

            const handle = this.findEntry(filePath).handle as FileSystemFileHandle;
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

    public async writeFileAs(content: IRule) {
        try {
            console.log(content)
            const handle = await window.showSaveFilePicker({
                suggestedName: `${content.Id}.xml`
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
