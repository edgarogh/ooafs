import * as Path from 'path';
import Entry from './Entry';
import EntryFilter from './EntryFilter';
import EntryType from './EntryType';
import Fs from 'fs';

/**
 * Common methods for all file entries
 */
export interface EntryBase {

    /**
     * Full absolute path of the entry
     */
    readonly path: string;

    /**
     * Absolute path of the entry
     */
    readonly absolutePath: string;

    readonly parsedPath: Path.ParsedPath;

    /**
     * Full name of the entry (with the extension if a file)
     */
    readonly name: string;

    /**
     * Casts the entry to a generic `Entry`. Only useful with TypeScript
     */
    asEntry(): Entry;

    /**
     * Copies the entry to destination
     * @param dest - Destination path or entry. The path may be absolute or 
     * relative to the parent
     * @returns The entry corresponding to the destination
     */
    copy(dest: string | EntryBase): Promise<this>;

    /**
     * Checks if the entry is the same as another one
     */
    equals(other: EntryBase): boolean;

    /**
     * Checks if the entry exists on the filesystem
     * @returns `true` if the entry exists
     */
    exists(): Promise<boolean>;

    type(): Promise<EntryType>;

    isFile(): Promise<boolean>;
    isDirectory(): Promise<boolean>;

    /**
     * Moves the entry to destination
     * @param dest - Destination path or entry. The path may be absolute or
     * relative to the parent
     * @returns The entry corresponding to the destination
     */
    move(dest: string | EntryBase): Promise<this>;

    /**
     * @returns The parent directory of the entry
     */
    parent(): Directory;

    /**
     * Removes the entry from the filesystem
     */
    remove(): Promise<void>;

    stat(): Promise<Fs.Stats>;

}

/**
 * Represents a file (not special ones like directories, sockets...)
 */
export interface File extends EntryBase {

    /**
     * The extension of the file with the dot, such as `.html`
     */
    readonly extension: string;

    /**
     * Creates this file
     * @returns {this}
     */
    createFile(): Promise<File>;

    createReadStream(options?: CreateReadStreamOptions): Fs.ReadStream;

    /**
     * Reads the content of the file
     */
    read(options: { encoding: string, flags?: string }): Promise<string>;
    read(options: { encoding?: never, flags?: string }): Promise<Buffer>;
    read(encoding: string): Promise<string>;
    read(): Promise<Buffer>;

    /**
     * @returns The size of the file in bytes
     */
    size(): Promise<number>;

    /**
     * Writes some data to the file
     * @param data 
     */
    write(data: any, options?: string | Fs.WriteFileOptions): Promise<void>;

}

/**
 * Represents a directory
 */
export interface Directory extends EntryBase {

    /**
     * @param relativePath Relative path of the entry
     * @returns A subentry of the directory
     */
    child(relativePath: string): Entry;

    /**
     * Creates this directory
     * @returns {this}
     */
    createDirectory(): Promise<Directory>;

    /**
     * Creates a directory in this directory
     * @returns The newly created directory
     */
    createDirectory(subpath: string): Promise<Directory>;

    /**
     * Creates a file in this directory
     * @returns The newly created file
     */
    createFile(subpath: string): Promise<File>;

    /**
     * @returns The content of the directory
     */
    list(filter: EntryFilter & { type: EntryType.DIRECTORY }): Promise<Directory[]>;
    list(filter: EntryFilter & { type: EntryType.FILE }): Promise<File[]>;
    list(filter?: EntryFilter): Promise<Entry[]>;

    /**
     * @returns The content of the directory and its subdirectories
     */
    listRecursively(filter: EntryFilter & { type: EntryType.DIRECTORY }): Promise<Directory[]>;
    listRecursively(filter: EntryFilter & { type: EntryType.FILE }): Promise<File[]>;
    listRecursively(filter?: EntryFilter): Promise<Entry[]>;

}

export type CreateReadStreamOptions = string | {
    flags?: string;
    encoding?: string;
    fd?: number;
    mode?: number;
    autoClose?: boolean;
    start?: number;
    end?: number;
    highWaterMark?: number;
};
