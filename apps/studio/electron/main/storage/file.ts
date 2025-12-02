import { existsSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { BasePersistentStorage } from './base';

export class SingleFilePersistentStorage<T> extends BasePersistentStorage<T> {
    constructor(fileName: string, encrypted = false) {
        super(fileName, encrypted);
    }

    get FILE_PATH(): string {
        return path.join(this.APP_PATH, `${this.fileName}.json`);
    }

    read(): T | null {
        try {
            if (!existsSync(this.FILE_PATH)) {
                return null;
            }
            const data = readFileSync(this.FILE_PATH, 'utf8');
            return this.encrypted ? this.readEncryptedData(data) : this.readUnencryptedData(data);
        } catch (e) {
            console.error(`Error reading file ${this.FILE_PATH}: `, e);
            return null;
        }
    }

    replace(value: T) {
        try {
            const data = this.encrypted
                ? this.writeEncryptedData(value)
                : this.writeUnencryptedData(value);
            writeFileSync(this.FILE_PATH, data);
        } catch (e) {
            console.error(`Error writing file ${this.FILE_PATH}: `, e);
        }
    }

    update(partialValue: Partial<T>) {
        try {
            const existingValue = this.read();
            this.replace({ ...(existingValue ?? ({} as T)), ...partialValue });
        } catch (e) {
            console.error(`Error updating file ${this.FILE_PATH}: `, e);
        }
    }

    clear() {
        try {
            writeFileSync(this.FILE_PATH, '');
        } catch (e) {
            console.error(`Error clearing file ${this.FILE_PATH}: `, e);
        }
    }
}
