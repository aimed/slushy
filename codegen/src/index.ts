import commander from 'commander'
import { OASParser } from './OASParser'
import { log } from './log'

commander
    .version(require('../package.json').version, '-v, --version')
    .command('gen <openApiFile> <outDir>')
    .action(async function(openApiFile, outDir) {
        const oasParser = new OASParser()
        oasParser
            .parseOAS(openApiFile, outDir)
            .then(() => log('Done!'))
            .catch(error => console.error(error.stack || error.message))
    })

commander.parse(process.argv)
