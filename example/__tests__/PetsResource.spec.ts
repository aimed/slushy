import { Slushy } from '@slushy/server'
import request from 'supertest'
import { Context } from '../src/Context'
import { SlushyFactory } from '../src/SlushyFactory'
import { testLoggerFactory } from './testLoggerFactory'

describe('PetsResource', () => {
    let slushy: Slushy<Context>

    beforeEach(async () => {
        slushy = await SlushyFactory.create({
            loggerFactory: testLoggerFactory,
        })
    })

    describe('getPets', () => {
        it('should return a list of pets', async () => {
            const response = await request(slushy.app).get('/pets')
            expect(response.status).toBe(200)
            expect(response.body).toBeInstanceOf(Array)
        })

        it('should return 400 for an invalid id with a message', async () => {
            const response = await request(slushy.app).get('/pets/123')
            expect(response.status).toBe(400)
            expect(response.body).toEqual({ message: 'No pet found.' })
        })
    })

    describe('defaultResponses', () => {
        it('should throw a default error', async () => {
            const response = await request(slushy.app).get('/pets/default-responses')
            expect(response.status).toBe(401)
            expect(response.body).toEqual({ errors: [{ message: expect.any(String) }] })
        })
    })
})
