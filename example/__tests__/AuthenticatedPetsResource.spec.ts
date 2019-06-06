import request from 'supertest'
import { SlushyFactory } from '../src/SlushyFactory'
import { Slushy } from '@slushy/server'
import { AuthenticationMiddleware } from '../src/AuthenticationMiddleware';

describe('AuthenticatedPetsResource', () => {
    let slushy: Slushy

    beforeEach(async () => {
        slushy = await SlushyFactory.create({
            authenticationMiddleware: new AuthenticationMiddleware(),
            loggerFactory: {
                create: () => console,
            }
        })
    })

    describe('getPets', () => {
        it('should return a list of pets', async () => {
            const response = await request(slushy.app).get('/pets').set('authorization', 'Bearer token')
            expect(response.status).toBe(200)
            expect(response.body).toBeInstanceOf(Array)
        })
    })

    describe('createPet', () => {
        it('should respond with status code 401 and a error object', async () => {
            const response = await request(slushy.app).post('/pets').send({ name: 'little doggo' })
            expect(response.status).toBe(401)
            expect(response.body).toStrictEqual({ error: { message: 'unauthorized'}})
        })

    })

})