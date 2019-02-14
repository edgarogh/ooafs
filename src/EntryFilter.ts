import Entry from './Entry';
import EntryType from './EntryType';

/**
 * Used to define a filter for filesystem entries. All properties are optionnal.
 */
interface EntryFilter {

    /**
     * Restrict the entry to a specific type
     */
    type?: EntryType;

    /**
     * Only match one or more extensions. The dot may be omitted
     */
    extensions?: string[];

    /**
     * Custom filtering function. The function can be asynchroneous
     * @param entry
     */
    filter?(entry: Entry): boolean | Promise<boolean>;

}

namespace EntryFilter {

    /**
     * Checks if a filesystem entry matches a given filter
     * @param entry - Filesystem entry to test against the filter
     * @param filter - Filter
     */
    export async function matches(entry: Entry, filter: EntryFilter): Promise<boolean> {
        if (!filter) return true;

        const type = await entry.type();

        // Check type
        if (filter.type && filter.type !== type) return false;

        // Check extensions (requires a file)
        if (filter.extensions) {
            if (type !== EntryType.FILE) return false;
            if (filter.extensions.every(ext => !entry.name.endsWith(ext))) return false;
        }

        // Run custom filter
        if (filter.filter) {
            const result = filter.filter(entry);
            const matches = (result instanceof Promise) ? await result : result;
            if (!matches) return false;
        }

        return true;
    }

}

export default EntryFilter;
