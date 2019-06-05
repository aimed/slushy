import { fs } from 'mz'
import * as path from 'path'
import { FileSystem } from './FileSystem'

/**
 * Removes all files and sub directories in [dir].
 * @param dir The directory to remove.
 */
async function removeDirWithFilesRecursive(dir: string) {
    if (await fs.exists(dir)) {
        const files = await fs.readdir(dir)

        for (const file of files) {
            if ((await fs.stat(path.join(dir, file))).isDirectory()) {
                await removeDirWithFilesRecursive(path.join(dir, file))
            } else {
                await fs.unlink(path.join(dir, file))
            }
        }

        await fs.rmdir(dir)
    }
}

/**
 * A directory for tests that will be removed after every test if it exists.
 */
const TEST_DIR = path.join(__dirname, '..', '__test_dir_FileSystem__')

describe('FileSystem', () => {
    const fileSystem = new FileSystem()

    /**
     * A safety flag that is necessary, because we do not want to delete any existing files.
     */
    let isSafeToRemoveTestDir = false

    beforeAll(async () => {
        // Do never remove a directory that already exists.
        if (await fs.exists(TEST_DIR)) {
            throw new Error(
                `Directory ${TEST_DIR} exists, but is needed for tests. If this is an artifact of a failed test, please remove it manually.`
            )
        }

        isSafeToRemoveTestDir = true
    })

    afterEach(async () => {
        if (isSafeToRemoveTestDir) {
            await removeDirWithFilesRecursive(TEST_DIR)
        }
    })

    it('should write a file in an existing dir', async () => {
        await fs.mkdir(TEST_DIR)

        await fileSystem.write(path.join(TEST_DIR, 'test.txt'), 'test')
        expect(await fs.exists(path.join(TEST_DIR, 'test.txt'))).toBe(true)
        expect((await fs.readFile(path.join(TEST_DIR, 'test.txt'))).toString()).toBe('test')
    })

    it('should write a file in a non existing directory', async () => {
        await fileSystem.write(path.join(TEST_DIR, 'test.txt'), 'test')
        expect(await fs.exists(path.join(TEST_DIR, 'test.txt'))).toBe(true)
    })

    it('should write a file in a subdirectory in a non existing directory', async () => {
        await fileSystem.write(path.join(TEST_DIR, 'sub', 'test.txt'), 'test')
        expect(await fs.exists(path.join(TEST_DIR, 'sub', 'test.txt'))).toBe(true)
    })
})
