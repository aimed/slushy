import { Slushy } from '@slushy/server'
import * as fs from 'fs'
import request from 'supertest'
import { Context } from '../src/Context'
import { SlushyFactory } from '../src/SlushyFactory'
import { testLoggerFactory } from './testLoggerFactory'

describe('Features', () => {
    let slushy: Slushy<Context>

    beforeEach(async () => {
        slushy = await SlushyFactory.create({
            loggerFactory: testLoggerFactory,
        })
    })

    describe('#/components/responses', () => {
        describe('CodeGen', () => {
            it('should create response type for #/components/responses/', async () => {
                const response = await request(slushy.app).get('/features/component-responses')
                expect(response.status).toBe(400)
                expect(response.body).toEqual({ errors: [{ message: expect.any(String) }] })
            })
        })
    })

    describe('File uploads', () => {
        describe('Server', () => {
            it('should accept an uploaded file', async () => {
                const response = await request(slushy.app)
                    .post('/features/file-upload')
                    .attach('file', __filename)
                expect(response.status).toBe(200)
                expect(response.body.content).toBe(fs.readFileSync(__filename).toString())
            })
        })
    })

    describe('File downloads', () => {
        describe('Server', () => {
            it('should send a file', async () => {
                const response = await request(slushy.app).get('/features/file-download')
                expect(response.status).toBe(200)
                expect(response.body).toBeTruthy()
            })
        })
    })
})
