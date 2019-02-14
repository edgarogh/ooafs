import Entry from '../Entry';
import EntryType from '../EntryType';

export default class EntryMock extends Entry {

    private existing = true;

    constructor(
        path: string,
        private entryType: EntryType = EntryType.UNKNOWN
    ) {
        super(path);
    }

    public type() {
        return Promise.resolve(this.entryType);
    }

    public list() {
        return Promise.resolve([]);
    }

    public listRecursively() {
        return Promise.resolve([]);
    }

    public exists() {
        return Promise.resolve(this.existing);
    }

    public stat() {
        return Promise.reject(new Error("Cannot stat mock file"));
    }

    public createReadStream(): never {
        throw new Error("Cannot open mock file");
    }

    public delete() {
        this.existing = false;
        return Promise.resolve();
    }

}
