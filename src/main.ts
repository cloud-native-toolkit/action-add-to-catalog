import * as core from '@actions/core'
import {Container} from 'typescript-ioc'
import {LoggerApi} from './util'
import {AddToCatalog} from './services/add-to-catalog'
import {ActionLogger} from './util/logger/logger.action'

const getId = (id?: string, repoUrl?: string): string => {
  if (id) {
    return id
  }

  if (!repoUrl) {
    throw new Error('Repo id not provided')
  }

  return repoUrl.replace('https://', '')
}

async function run(): Promise<void> {
  Container.bind(LoggerApi).to(ActionLogger)

  const logger: LoggerApi = Container.get(LoggerApi)

  try {
    const catalogFile: string = core.getInput('catalogFile')
    const category: string = core.getInput('category')
    const name: string = core.getInput('name')
    const displayName: string = core.getInput('displayName')
    const group: string = core.getInput('group')
    const cloudProvider: string = core.getInput('cloudProvider')
    const softwareProvider: string = core.getInput('softwareProvider')
    const id: string = getId(core.getInput('id'), core.getInput('repoUrl'))

    const input = {
      catalogFile,
      category,
      name,
      displayName,
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

run().catch(error => console.error(`Error processing action: ${error.message}`))
