import express from 'express'
import { SlushyApplication } from './ServerImpl'
export class SlushyApplicationFactory {
    public create(): SlushyApplication {
        return express()
    }
}
