import { SlushyResourceConfiguration } from './SlushyResourceConfiguration'
import { SlushyAuthenticationMiddleware } from "./SlushyAuthenticationMiddleware";

export interface SlushyConfig {
    resourceConfiguration: SlushyResourceConfiguration
    authenticationMiddleware?: SlushyAuthenticationMiddleware
    hostname?: string
}
