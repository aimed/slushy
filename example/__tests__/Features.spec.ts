import request from 'supertest'
import { testLoggerFactory } from './testLoggerFactory'
import { Slushy } from '@slushy/server'
import { Context } from './Context'
import { SlushyFactory } from '../src/SlushyFactory'

describe('Features', () => {
    let slushy: Slushy<Context>

    beforeEach(async () => {
        slushy = await SlushyFactory.create({
            loggerFactory: testLoggerFactory,
        })
    })

    it('should create response type for #/components/responses/', async () => {
        const response = await request(slushy.app).get('/features/component-responses')
        expect(response.status).toBe(400)
        expect(response.body).toEqual({ errors: [{ message: expect.any(String) }] })
    })
})
