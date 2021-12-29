import {Container} from 'typescript-ioc'
import {LoggerApi} from './logger.api'
import {ConsoleLogger} from './logger.console'

export * from './logger.api'

Container.bind(LoggerApi).to(ConsoleLogger)
