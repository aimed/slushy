import { Slushy } from '@slushy/server'
import request from 'supertest'
import { Context } from '../src/Context'
import { SlushyFactory } from '../src/SlushyFactory'
import { testLoggerFactory } from './testLoggerFactory'

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

    describe('header', () => {
        it('should accept a request if the parameter is correct', async () => {
            const response = await request(slushy.app)
                .get('/validation/header')
                .set('x-header', 'x-header')
            expect(response.status).toBe(200)
            expect(response.body).toEqual({ header: 'x-header' })
        })

        it('should not accept a request a required parameter is not set', async () => {
            const response = await request(slushy.app).get('/validation/header')
            expect(response.status).toBe(400)
        })
    })

    describe('body', () => {
        describe('default values', () => {
            it('should set the default value', async () => {
                const response = await request(slushy.app)
                    .post('/validation/body/set-defaults')
                    .send({})
                expect(response.status).toBe(200)
                expect(response.body).toEqual({ default: 'default' })
            })

            it('should pass values without defaults', async () => {
                const response = await request(slushy.app)
                    .post('/validation/body/set-defaults')
                    .send({ noDefault: 'noDefault' })
                expect(response.status).toBe(200)
                expect(response.body).toEqual({ default: 'default', noDefault: 'noDefault' })
            })
        })
    })

    describe('path', () => {
        it('should accept a request if the parameter is correct', async () => {
            const response = await request(slushy.app).get('/validation/path/1/1')
            expect(response.status).toBe(200)
        })

        it('should coerce path parameters', async () => {
            const response = await request(slushy.app).get('/validation/path/1/1')
            expect(response.status).toBe(200)
            expect(response.body).toEqual({ num: 1, str: '1' })
        })

        it('should not accept a request if a required parameter is not set', async () => {
            const response = await request(slushy.app).get('/validation/path')
            expect(response.status).toBe(404)
        })

        it('should not accept a request if a parameter is of the wrong type', async () => {
            const response = await request(slushy.app).get('/validation/path/string/string')
            expect(response.status).toBe(400)
        })
    })
})
