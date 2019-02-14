# [**ooafs**](https://www.npmjs.com/package/ooafs)

[![GitHub license](https://img.shields.io/github/license/edgarogh/ooafs.svg)](https://github.com/edgarogh/ooafs/blob/master/LICENSE)
[![David](https://img.shields.io/david/edgarogh/ooafs.svg)](https://www.npmjs.com/package/ooafs)

> OOAFS allows you to manipulate the FileSystem in an object-oriented fashion, by using objects to represent FS entries (like Java's File class) and promises instead of the old callbacks. This way, you don't have to spend your time concatenating paths and manually filtering files.
> Here's a little preview of what can be done:
> ```typescript
> let themesFolder = new Directory("./plugins/");
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
const file = new File("./path/file.txt");
```
> `Entry`, `File` and `Directory` are actually the same exact class. They just have different typings, `Entry` being the actual class. This is explained [here](#typescript-support).

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

const picturesDir = new Directory("pictures");
const images = await picturesDir.listRecursively(filter);
```

### TypeScript support
**ooafs** in entirely written in TypeScript and thus, is completely typed. In addition to that, when you import the module, you can use three "classes":
```typescript
import { Entry, File, Directory } from 'ooafs';
```
Actually, only `Entry` is a real class. `File` and `Directory` are litterally aliases, but exported under an interface that mask out methods that are unrelated to files or directories, respectively. For instance, if you define a new file:
```typescript
const file = new File("/path");

// This shows an error: File doesn't have a `list` method
file.list();
```
Although technically, `file` is an instance of `Entry` and **has** the `list()` method, all the methods that are not related to files are hidden so the compiler shows an error. It's a good way to prevent mistakes. If you ever need to have a plain `Entry`, you can use the `asEntry()` method instead of casting, which would require additional brackets.

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
