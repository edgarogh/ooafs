import * as Path from 'path';
import EntryFilter from './EntryFilter';
import EntryType from './EntryType';
import Fs from 'fs-extra';
import {
    CreateReadStreamOptions,
    Directory,
    EntryBase,
    File
    } from './FSTypings';

/**
 * This class represents a generic filesystem entry. If you use TypeScript, you 
 * can use the `File` and `Directory` interfaces which hide some methods for a 
 * better type-safety
 */
export default class Entry implements File, Directory {

    public readonly path: string;

    constructor(path: string) {
        // Remove trailing slash
        this.path = path.replace(/[\\/]+$/, '');
    }

    // Utility getters for type-safety

    public get e() {
        return this as Entry;
    }

    public get d() {
        return this as Directory;
    }

    public get f() {
        return this as File;
    }

    // Properties

    public get absolutePath() {
        return Path.resolve(this.path);
    }

    public get parsedPath() {
        return Path.parse(this.path);
    }

    public get name() {
        return this.parsedPath.base;
    }

    public get extension(): string {
        return this.parsedPath.ext;
    }

    // Methods

    public child(relativePath: string): Entry {
        return new Entry(Path.join(this.path, relativePath));
    }

    public async copy(dest: string | EntryBase): Promise<this> {
        const dstPath = (typeof dest === 'string')
            ? Path.resolve(this.parent().path, dest)
            : dest.path;
        await Fs.copy(this.path, dstPath);
        return new Entry(dstPath) as this;
    }

    public createDirectory(): Promise<Directory>;
    public createDirectory(subpath: string): Promise<Directory>;
    public async createDirectory(subpath?: string): Promise<Directory> {
        if (subpath) {
            const child = this.child(subpath);
            await Fs.mkdirs(child.path);
            return child;
        } else {
            await Fs.mkdirs(this.path);
            return this;
        }
    }

    public createFile(): Promise<File>;
    public createFile(subpath: string): Promise<File>;
    public async createFile(subpath?: string): Promise<File> {
        if (subpath) {
            const child = this.child(subpath);
            await Fs.createFile(child.path);
            return child;
        } else {
            await Fs.createFile(this.path);
            return this;
        }
    }

    public createReadStream(options?: CreateReadStreamOptions): Fs.ReadStream {
        return Fs.createReadStream(this.path, options);
    }

    public equals(other: EntryBase) {
        return this.absolutePath === other.absolutePath;
    }

    public async exists(): Promise<boolean> {
        try {
            await Fs.stat(this.path);
            return true;
        } catch (_) {
            return false;
        }
    }

    public async type(): Promise<EntryType> {
        const stat = await this.stat();
        if (stat.isDirectory()) return EntryType.DIRECTORY;
        if (stat.isFile()) return EntryType.FILE;
        return EntryType.UNKNOWN;
    }

    public async isDirectory(): Promise<boolean> {
        return await this.type() === EntryType.DIRECTORY;
    }

    public async isFile(): Promise<boolean> {
        return await this.type() === EntryType.FILE;
    }

    public list(filter: EntryFilter & { type: EntryType.DIRECTORY }): Promise<Directory[]>;
    public list(filter: EntryFilter & { type: EntryType.FILE }): Promise<File[]>;
    public list(filter?: EntryFilter): Promise<Entry[]>;
    public async list(filter?: EntryFilter) {
        const list: Entry[] = [];

        for (let subpath of await Fs.readdir(this.path)) {
            const subentry = new Entry(Path.resolve(this.path, subpath));
            if (await EntryFilter.matches(subentry, filter)) {
                list.push(subentry);
            }
        }

        return list;
    }

    public listRecursively(filter: EntryFilter & { type: EntryType.DIRECTORY }): Promise<Directory[]>;
    public listRecursively(filter: EntryFilter & { type: EntryType.FILE }): Promise<File[]>;
    public listRecursively(filter?: EntryFilter): Promise<Entry[]>;
    public async listRecursively(filter?: EntryFilter) {
        const list: Entry[] = [];

        async function addEntry(entry: Entry, includeThis = true) {
            if (includeThis && await EntryFilter.matches(entry, filter)) {
                list.push(entry);
            }

            if (await entry.isDirectory()) {
                for (let subentry of await (entry as Directory).list()) {
                    await addEntry(subentry);
                }
            }
        }

        await addEntry(this, false);
        return list;
    }

    public async move(dest: string | EntryBase): Promise<this> {
        const dstPath = (typeof dest === 'string')
            ? Path.resolve(this.parent().path, dest)
            : dest.path;
        await Fs.move(this.path, dstPath);
        return new Entry(dstPath) as this;
    }

    public parent(): Directory {
        return new Entry(Path.dirname(this.path));
    }

    public read(options: { encoding: string, flags?: string }): Promise<string>;
    public read(options: { encoding?: never, flags?: string }): Promise<Buffer>;
    public read(encoding: string): Promise<string>;
    public read(): Promise<Buffer>;
    public read(options?: {}): Promise<Buffer | string> {
        return Fs.readFile(this.path, options);
    }

    public remove() {
        return Fs.remove(this.path);
    }

    public async size(): Promise<number> {
        return (await this.stat()).size;
    }

    public stat(): Promise<Fs.Stats> {
        return Fs.stat(this.path);
    }

    public async write(data: any, options?: string | Fs.WriteFileOptions) {
        await Fs.writeFile(this.path, data, options);
    }

    /**
     * Returns an `Entry`
     * @param path If the path is already an entry, it is returned as is. If it 
     * is specified as a string, a new `Entry` is returned
     */
    public static from(path: string): Entry;
    public static from<T extends EntryBase>(path: string | T): T;
    public static from(path: string | EntryBase): Entry {
        if (typeof path === 'string') {
            return new Entry(path);
        } else {
            return path as Entry;
        }
    }

}
