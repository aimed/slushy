import request from 'supertest'
import { testLoggerFactory } from './testLoggerFactory'
import { Slushy } from '@slushy/server'
import { Context } from '../src/Context'
import { SlushyFactory } from '../src/SlushyFactory'

describe('Validation', () => {
    let slushy: Slushy<Context>

    beforeEach(async () => {
        slushy = await SlushyFactory.create({
            loggerFactory: testLoggerFactory,
        })
    })

    describe('query', () => {
        it('should accept a request if the parameter is correct', async () => {
            const response = await request(slushy.app).get('/validation/query?query=queryValue')
            expect(response.status).toBe(200)
            expect(response.body).toEqual({ query: 'queryValue' })
        })

        it('should not accept a request a required parameter is not set', async () => {
            const response = await request(slushy.app).get('/validation/query')
            expect(response.status).toBe(400)
        })
    })
})
