import EntryFilter from './EntryFilter';
import EntryType from './EntryType';
import mock from 'mock-fs';
import { Directory, File, Entry } from './';
import { expect } from 'chai';

beforeEach(() => {
    mock({
        '/fake/': {

            'file.txt': "12345678",

            'directory': {
                'file1.json': "",
                'file1.txt': "",
                'file2.txt': "",
                'subdirectory': {
                    'file3.json': "",
                    'file3.txt': ""
                }
            },

            'empty': { },

            'tmp': {
                'file': '',
                'empty': { },
                'full': {
                    'a': {
                        '1': ""
                    },
                    'b': {

                    },
                    '': ""
                }
            }

        }
    });
});

afterEach(() => {
    mock.restore();
});

describe("Entry", () => {

    const root = new Entry("/fake").d;

    const file = new Entry("/fake/file.txt").f;
    const nonExistingFile = new Entry("/fake/file_.txt").f;
    const newFile = new Entry("/fake/newfile.txt").f;

    const directory = new Entry("/fake/directory/").d;
    const nonExistingDirectory = new Entry("/fake/directory_").d;
    const empty = new Entry("/fake/empty").d;
    const nonExistingEmpty = new Entry("/fake/empty_").d;

    describe("#parsedPath", () => {
        
        const parsedPath = file.parsedPath;

        it("should return `.txt`", () => {
            expect(parsedPath.ext).to.equal('.txt');
        });

        it("should return `/`", () => {
            expect(parsedPath.root).to.equal('/');
        });

    });

    describe("#child()", () => {

        it("should return child of a directory", () => {
            const child = root.child("file.txt");
            expect(child.equals(file)).to.be.true;
        });

        it("should return child of subdirectory", () => {
            const child = root.child("directory/file1.txt");
            expect(child.equals(directory.child("file1.txt"))).to.be.true;
        });

    });

    describe("#copy()", () => {

        it("should copy file by absolute path", async () => {
            await file.copy("/fake/newfile.txt");
            expect(await newFile.exists()).to.be.true;
        });

        it("should copy file by relative path", async () => {
            await file.copy("newfile.txt");
            expect(await newFile.exists()).to.be.true;
        });

        it("should copy file by entry", async () => {
            await file.copy(newFile);
            expect(await newFile.exists()).to.be.true;
        });

        it("should copy empty directory", async () => {
            await empty.copy(nonExistingEmpty);
            expect(await nonExistingEmpty.exists()).to.be.true;
        });

        it("should copy full firectory", async () => {
            await directory.copy(nonExistingDirectory);
            expect(await nonExistingDirectory.exists()).to.be.true;            
        });

    });

    describe("#createDirectory()", () => {

        it("should create directory (self)", async () => {
            expect((await nonExistingDirectory.createDirectory()).equals(nonExistingDirectory)).to.be.true;
            expect(await nonExistingDirectory.exists()).to.be.true;
            expect(await nonExistingDirectory.type()).to.equal(EntryType.DIRECTORY);
        });

        it("should create directory in directory", async () => {
            expect((await root.createDirectory("directory_")).equals(nonExistingDirectory)).to.be.true;
            expect(await nonExistingDirectory.exists()).to.be.true;
            expect(await nonExistingDirectory.type()).to.equal(EntryType.DIRECTORY);
        });

        it("should create directory in multiple directories", async () => {
            const sub = new Entry("/fake/directory_/sub").d;
            expect((await root.createDirectory("directory_/sub")).equals(sub)).to.be.true;
            expect(await sub.exists()).to.be.true;
            expect(await sub.type()).to.equal(EntryType.DIRECTORY);
        });

    });

    describe("#createFile()", () => {

        it("should create file (self)", async () => {
            expect((await nonExistingFile.createFile()).equals(nonExistingFile)).to.be.true;
            expect(await nonExistingFile.exists()).to.be.true;
            expect(await nonExistingFile.type()).to.equal(EntryType.FILE);
        });

        it("should create file in directory", async () => {
            expect((await root.createFile("file_.txt")).equals(nonExistingFile)).to.be.true;
            expect(await nonExistingFile.exists()).to.be.true;
            expect(await nonExistingFile.type()).to.equal(EntryType.FILE);
        });

        it("should create file in multiple directories", async () => {
            const sub = new Entry("/fake/directory_/file").f;
            expect((await root.createFile("directory_/file")).equals(sub)).to.be.true;
            expect(await sub.exists()).to.be.true;
            expect(await sub.type()).to.equal(EntryType.FILE);
        });

    });

    describe("#createReadStream()", () => {

        // I need to find a good way to do the assertions
        it("should return read stream");

    });

    describe("#equals()", () => {

        it("should return `true`", () => {
            expect(root.equals(new Entry("/fake/").d)).to.be.true;
        });

        it("should return `false`", () => {
            expect(root.equals(new Entry("/fake/abc").d)).to.be.false;
        });

    });

    describe("#exists()", () => {
        
        it("should return `true` for file", async () => {
            expect(await file.exists()).to.be.true;
        });

        it("should return `true` for directory", async () => {
            expect(await directory.exists()).to.be.true;
        });

        it("should return `false`", async () => {
            expect(await nonExistingFile.exists()).to.be.false;
        });

    });

    describe("#getType()", () => {

        it("should return `FILE`", async () => {
            expect(await file.type()).to.equal(EntryType.FILE);
        });

        it("should return `DIRECTORY`", async () => {
            expect(await directory.type()).to.equal(EntryType.DIRECTORY);
        });

    });

    describe("#list()", () => {

        it("should return content of directory", async () => {
            expect(await directory.list()).to.have.lengthOf(4);
        });

        it("should return filtered content of directory", async () => {
            const filter: EntryFilter = {
                extensions: ['.txt']
            };
            expect(await directory.list(filter)).to.have.lengthOf(2);
        });

    });

    describe("#listRecursively()", () => {

        it("should return recursive content of directory", async () => {
            expect(await directory.listRecursively()).to.have.lengthOf(6);
        });

        it("should return recursive filtered content of directory", async () => {
            const filter: EntryFilter = {
                extensions: ['.txt']
            };
            expect(await directory.listRecursively(filter)).to.have.lengthOf(3);
        });

    });

    describe("#move()", () => {

        it("should move file", async () => {
            await file.move(newFile);
            expect(await newFile.exists()).to.be.true;
        });

        it("should move empty directory", async () => {
            await empty.move(nonExistingEmpty);
            expect(await nonExistingEmpty.exists()).to.be.true;
        });

        it("should move full firectory", async () => {
            await directory.move(nonExistingDirectory);
            expect(await nonExistingDirectory.exists()).to.be.true;
        });

    });

    describe("#parent()", () => {

        it("should return parent directory of file", () => {
            expect(file.parent().path).to.equal('/fake');
        });

        it("should return parent directory of directory", () => {
            expect(directory.parent().path).to.equal('/fake');
        });

    });

    describe("#read()", () => {

        it("should return string content", async () => {
            const content = await file.read('utf8');
            expect(content).to.equal("12345678");
        });

    });

    describe("#remove()", () => {

        it("should remove file", async () => {
            const tmpFile = new Entry("/fake/tmp/file").f;
            await tmpFile.remove();
            expect(await tmpFile.exists()).to.be.false;
        });

        it("should remove empty directory", async () => {
            const emptyDir = new Entry("/fake/tmp/empty/").d;
            await emptyDir.remove();
            expect(await emptyDir.exists()).to.be.false;
        });

        // Hangs because of incompatibility between mock-fs and fs-extra
        xit("should remove full directory", async () => {
            const fullDir = new Entry("/fake/tmp/full/").d;
            await fullDir.remove();
            expect(await fullDir.exists()).to.be.false;
        });

    });

    describe("#stat()", () => {

        it("should return correct size", async () => {
            const stat = await file.stat();
            expect(stat.size).to.equal(8);
        });

    });

    describe("#write()", () => {

        it("should write data to a file", async () => {
            const newFile = root.child("newFile.txt");
            await newFile.write("87654321");
            expect(await newFile.size()).to.equal(8);
        });

    });

    describe(".from()", () => {

        it("should take an entry as parameter", () => {
            expect(Entry.from(file).equals(file)).to.be.true;
        });

        it("should take a string as parameter", () => {
            expect(Entry.from(file.path).equals(file)).to.be.true;
        });

    });

});
