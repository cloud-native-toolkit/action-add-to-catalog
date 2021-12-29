import * as core from '@actions/core'
import {Container} from 'typescript-ioc'
import {LoggerApi} from './util/logger'
import {AddToCatalog} from './services/add-to-catalog'

async function run(): Promise<void> {
  const logger: LoggerApi = Container.get(LoggerApi)

  try {
    const catalogFile: string = core.getInput('catalogFile')
    const category: string = core.getInput('category')
    const name: string = core.getInput('name')
    const id: string = core.getInput('id')
    const group: string = core.getInput('group')
    const cloudProvider: string = core.getInput('cloudProvider')
    const softwareProvider: string = core.getInput('softwareProvider')

    const input = {
      catalogFile,
      category,
      name,
      id,
      group,
      cloudProvider,
      softwareProvider
    }
    logger.info(`Adding module: ${name}`)
    logger.debug(
      `Adding to catalog with input values: ${JSON.stringify(input)}`
    )

    const service: AddToCatalog = Container.get(AddToCatalog)
    await service.run(input)

  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
