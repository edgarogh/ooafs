import EntryFilter from './EntryFilter';
import EntryMock from './test/EntryMock';
import EntryType from './EntryType';
import { expect } from 'chai';

describe("EntryFilter", () => {

    describe(".matches()", () => {

        it("should match type", async () => {
            const filter: EntryFilter = {
                type: EntryType.DIRECTORY
            }
            expect(await EntryFilter.matches(new EntryMock('', EntryType.DIRECTORY), filter)).to.be.true;
            expect(await EntryFilter.matches(new EntryMock('', EntryType.FILE), filter)).to.be.false;
        });

        it("should match extensions", async () => {
            const filter: EntryFilter = {
                extensions: ['.html', '.txt']
            }
            expect(await EntryFilter.matches(new EntryMock('src/index.html', EntryType.FILE), filter)).equals(true, ".html");
            expect(await EntryFilter.matches(new EntryMock('src/index.txt', EntryType.FILE), filter)).equals(true, ".txt");
            expect(await EntryFilter.matches(new EntryMock('src/index.css', EntryType.FILE), filter)).equals(false, ".css");
        });

        it("should match custom filter", async () => {
            const filter: EntryFilter = {
                filter(entry) {
                    return entry.name === 'hello';
                }
            }
            expect(await EntryFilter.matches(new EntryMock('src/hello'), filter)).equals(true);
            expect(await EntryFilter.matches(new EntryMock('src/world'), filter)).equals(false);
        });

    });

});
