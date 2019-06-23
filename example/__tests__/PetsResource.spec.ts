import request from 'supertest'
import { SlushyFactory } from '../src/SlushyFactory'
import { Slushy } from '@slushy/server'
import { Context } from './Context'

describe('PetsResource', () => {
    let slushy: Slushy<Context>

    beforeEach(async () => {
        slushy = await SlushyFactory.create({
            loggerFactory: {
                create: () => console,
            },
        })
    })

    describe('getPets', () => {
        it('should return a list of pets', async () => {
            const response = await request(slushy.app).get('/pets')
            expect(response.status).toBe(200)
            expect(response.body).toBeInstanceOf(Array)
        })
    })
})
