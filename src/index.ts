import Entry from './Entry';
import EntryFilter from './EntryFilter';
import { Directory, File } from './FSTypings';

type Constructor<T> = new (path: string) => T

const File = Entry as any as Constructor<File>
const Directory = Entry as any as Constructor<Directory>;

export {
    Entry,
    File,
    Directory,
    
    EntryFilter
}
