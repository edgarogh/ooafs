# [**ooafs**](https://www.npmjs.com/package/ooafs)

[![GitHub license](https://img.shields.io/github/license/edgarogh/ooafs.svg)](https://github.com/edgarogh/ooafs/blob/master/LICENSE)
[![David](https://img.shields.io/david/edgarogh/ooafs.svg)](https://www.npmjs.com/package/ooafs)

> OOAFS allows you to manipulate the FileSystem in an object-oriented fashion, by using objects to represent FS entries (like Java's File class) and promises instead of the old callbacks. This way, you don't have to spend your time concatenating paths and manually filtering files.
> Here's a little preview of what can be done:
> ```typescript
> let themesFolder = new Entry("./plugins/").d;
> let themes = await themesFolder.list({ type: EntryType.DIRECTORY });
> 
> for (let themeFolder of themes) {
>   const manifestFile = themeFolder.child('manifest.json');
>   
>   if (!await manifestFile.exists()) continue;
> 
>   const manifest = JSON.parse(await manifestFile.read('utf8'));
>   const iconStream = themeFolder.child('icon.png').createReadStream();
>   
>   loadTheme(manifest.name, iconStream, themeFolder);
> }
> ```

## Setup

### Download
`npm install ooafs`

### Import / Require
```javascript
import { Entry, File, Directory } from 'ooafs';

// Create a file wrapper
const file: File = new Entry("./path/file.txt");
```
> `Entry` is a class, while `File` and `Directory` are interfaces implemented by this class. These interfaces can be used for a better type-safety

## Usage
The library is completely typed, so as long as you use a relatively good editor like VSCode, you shouldn't have much problems finding the available methods and properties.

### Examples
```typescript
function backupNodeProject(project: Directory, backupFolder: Directory) {
    // `name` is the basename of the project folder
    const backup = backupFolder.child(project.name);

    project.copy(backup);

    // Delete 20Gb of useless data !
    backup.child("node_modules").remove();
}
```

```typescript
import { Directory, EntryFilter } from 'ooafs';

const filter: EntryFilter = {
    extensions: ['.png', '.jpeg', '.jpg', '.bmp'],

    // Custom filtering function
    async filter(image) {
        return (await image.size()) > 1023;
    }
};

// const picturesDir: Directory = new Entry("pictures");
// is the same as:
const picturesDir = new Entry("pictures").d;
const images = await picturesDir.listRecursively(filter);
```

### TypeScript support
**ooafs** in entirely written in TypeScript and thus, is completely typed. In addition to that, when you import the module, you can use two interfaces, `File` and `Directory` to mask out methods that are not related to files and directories, respectively:
```typescript
import { Entry, File, Directory } from 'ooafs';

const file: File = new Entry("/path");

// This shows an error: File doesn't have a `list` method
file.list();
```

Instead of manually casting your `Entry` instance to one of the two interfaces, you can also use a specifically made getter:
```typescript
import { Entry } from 'ooafs';

// Add `.f` behind the constructor expression
// file is now typed as `File`
const file = new Entry("/path").f;

// This shows an error: File doesn't have a `list` method
file.list();
```

Three are available: `.e`, `.d` and `.f`.

## Bugs & Suggestions
If you notice any bug or have a suggestion, please tell me about it in the issues, it will help everyone!

## Tests

Tests are created with [mocha](https://github.com/mochajs/mocha) and asserted with [chai.expect](https://github.com/chaijs/chai).

You can run the suite using
```bash
npm test
```

## License

**ooafs** is licensed under the very permissive [MIT License](https://tldrlegal.com/license/mit-license). You may use it for commercial projects if you comply to the license.
