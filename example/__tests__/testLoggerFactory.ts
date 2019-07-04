import { LoggerFactory } from '@slushy/server'

export class TestLoggerFactory implements LoggerFactory {
    create() {
        return {
            log: jest.fn(),
            info: jest.fn(),
            error: jest.fn(),
        }
    }
}
export const testLoggerFactory = new TestLoggerFactory()
