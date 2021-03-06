// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {Container} from 'typescript-ioc'
import {LoggerApi, YamlFile} from '../util'

export interface AddToCatalogParams {
  catalogFile: string
  category: string
  name: string
  displayName?: string
  id: string
  group?: string
  cloudProvider?: string
  softwareProvider?: string
}

export interface CatalogModule {
  name: string
  id: string
  metadataUrl?: string
  aliases?: string[]
  group?: string
  cloudProvider?: string
  softwareProvider?: string
}

interface CatalogCategory {
  category: string
  categoryName: string
  selection: string
  modules: CatalogModule[]
}

interface Catalog {
  categories: CatalogCategory[]
}

export class MissingCategoryError extends Error {
  readonly category: string

  constructor(category: string) {
    super(`Unable to find category: ${category}`)
    this.category = category
  }
}

export class DuplicateModuleError extends Error {
  readonly module: CatalogModule

  constructor(module: CatalogModule) {
    super(`Module already exists in catalog: ${module.name}`)
    this.module = module
  }
}

export class AddToCatalog {
  async run(values: AddToCatalogParams): Promise<void> {
    const logger: LoggerApi = Container.get(LoggerApi)

    logger.info(`Loading catalog file: ${values.catalogFile}`)
    const catalog: YamlFile<Catalog> = await YamlFile.load(values.catalogFile)

    logger.info(
      `Validating module name does not exist in the catalog: ${values.name}`
    )
    this.validateModuleDuplication(catalog.contents, values.name)

    logger.info(`Finding category in catalog: ${values.category}`)
    const categories: CatalogCategory[] = catalog.contents.categories.filter(
      c => c.category === values.category
    )
    if (categories.length === 0) {
      throw new MissingCategoryError(values.category)
    }

    const category: CatalogCategory = categories[0]

    logger.info(`Adding new module to catalog`)
    category.modules.push(this.buildModule(values))

    await catalog.write()
  }

  validateModuleDuplication(catalog: Catalog, name: string): void {
    if (!catalog) {
      throw new Error('Catalog missing!!!')
    }
    if (!catalog.categories) {
      throw new Error('Catalog categories missing!!!')
    }

    const matchingModules: CatalogModule[] = catalog.categories
      .reduce((result: CatalogModule[], current: CatalogCategory) => {
        const modules = current.modules || []
        result.push(...modules)

        return result
      }, [])
      .filter(m => m.name === name)

    if (matchingModules.length > 0) {
      throw new DuplicateModuleError(matchingModules[0])
    }
  }

  buildModule({
    name,
    displayName,
    id,
    group,
    cloudProvider,
    softwareProvider
  }: AddToCatalogParams): CatalogModule {
    return Object.assign(
      {
        id
      },
      displayName ? {name: displayName} : {name},
      group ? {group} : {},
      cloudProvider ? {cloudProvider} : {},
      softwareProvider ? {softwareProvider} : {}
    )
  }
}
