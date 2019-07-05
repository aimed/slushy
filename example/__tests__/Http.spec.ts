import request from 'supertest'
import { testLoggerFactory } from './testLoggerFactory'
import { Slushy } from '@slushy/server'
import { Context } from '../src/Context'
import { SlushyFactory } from '../src/SlushyFactory'

describe('Http', () => {
    let slushy: Slushy<Context>

    beforeEach(async () => {
        slushy = await SlushyFactory.create({
            loggerFactory: testLoggerFactory,
        })
    })

    describe('get', () => {
        it('should be able to get', async () => {
            const response = await request(slushy.app).get('/http')
            expect(response.status).toBe(200)
        })
    })

    describe('put', () => {
        it('should be able to put', async () => {
            const response = await request(slushy.app).put('/http')
            expect(response.status).toBe(200)
        })
    })

    describe('post', () => {
        it('should be able to post', async () => {
            const response = await request(slushy.app).post('/http')
            expect(response.status).toBe(200)
        })
    })

    describe('delete', () => {
        it('should be able to delete', async () => {
            const response = await request(slushy.app).delete('/http')
            expect(response.status).toBe(200)
        })
    })

    describe('patch', () => {
        it('should be able to patch', async () => {
            const response = await request(slushy.app).patch('/http')
            expect(response.status).toBe(200)
        })
    })
})
