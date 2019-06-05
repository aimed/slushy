import { capitalize, isReferenceObject } from './utils'

describe('utils', () => {
    describe('capitalize', () => {
        it('should do nothing for empty strings', () => {
            expect(capitalize('')).toBe('')
        })

        it('should capitalize the first letter', () => {
            expect(capitalize('a')).toBe('A')
        })

        it('should capitalize only the first letter', () => {
            expect(capitalize('aa')).toBe('Aa')
        })
    })

    describe('isReferenceObject', () => {
        it.each([[null], [undefined], [''], {}])('should not identify (%s)', input => {
            expect(isReferenceObject(input)).toBe(false)
        })

        it('should identify an object with a $ref property as an reference object', () => {
            expect(isReferenceObject({ $ref: '#/test' })).toBe(true)
        })
    })
})
