import request from 'supertest'
import { SlushyFactory } from './SlushyFactory'
import { testLoggerFactory } from './testLoggerFactory'
import { Slushy } from '@slushy/server'
import { Context } from './Context'

describe('Features', () => {
    let slushy: Slushy<Context>

    beforeEach(async () => {
        slushy = await SlushyFactory.create({
            loggerFactory: testLoggerFactory,
        })
    })

    it('should create response type for #/components/responses/', async () => {
        const response = await request(slushy.app).get('/features/component-responses')
        expect(response.status).toBe(401)
        expect(response.body).toContainEqual({ errors: [{ message: expect.any(String) }] })
    })
})
