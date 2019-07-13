import * as fs from 'fs-extra'
import * as path from 'path'
import { FileSystem } from './FileSystem'

/**
 * Removes all files and sub directories in [dir].
 * @param dir The directory to remove.
 */
async function removeDirWithFilesRecursive(dir: string) {
    if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir)

        for (const file of files) {
            if (fs.statSync(path.join(dir, file)).isDirectory()) {
                await removeDirWithFilesRecursive(path.join(dir, file))
            } else {
                fs.unlinkSync(path.join(dir, file))
            }
        }

        fs.rmdirSync(dir)
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
        if (fs.existsSync(TEST_DIR)) {
            throw new Error(
                `Directory ${TEST_DIR} exists, but is needed for tests. If this is an artifact of a failed test, please remove it manually.`,
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
        fs.mkdirSync(TEST_DIR)

        await fileSystem.write(path.join(TEST_DIR, 'test.txt'), 'test')
        expect(fs.existsSync(path.join(TEST_DIR, 'test.txt'))).toBe(true)
        expect(fs.readFileSync(path.join(TEST_DIR, 'test.txt')).toString()).toBe('test')
    })

    it('should write a file in a non existing directory', async () => {
        await fileSystem.write(path.join(TEST_DIR, 'test.txt'), 'test')
        expect(fs.existsSync(path.join(TEST_DIR, 'test.txt'))).toBe(true)
    })

    it('should write a file in a subdirectory in a non existing directory', async () => {
        await fileSystem.write(path.join(TEST_DIR, 'sub', 'test.txt'), 'test')
        expect(fs.existsSync(path.join(TEST_DIR, 'sub', 'test.txt'))).toBe(true)
    })
})
