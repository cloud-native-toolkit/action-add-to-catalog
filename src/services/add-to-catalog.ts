// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {YamlFile} from '../util/yaml-file'
import {first} from '../util/first'

export interface AddToCatalogParams {
  catalogFile: string
  category: string
  name: string
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
    const catalog: YamlFile<Catalog> = await YamlFile.load(values.catalogFile)

    this.validateModuleDuplication(catalog.contents, values.name)

    const category: CatalogCategory = first(
      catalog.contents.categories.filter(c => c.category === values.category)
    ).orElseThrow(() => new MissingCategoryError(values.category))

    category.modules.push(this.buildModule(values))

    await catalog.write()
  }

  validateModuleDuplication(catalog: Catalog, name: string): void {
    const matchingModules: CatalogModule[] = catalog.categories
      .reduce((result: CatalogModule[], current: CatalogCategory) => {
        result.push(...current.modules)

        return result
      }, [])
      .filter(m => m.name === name)

    if (matchingModules.length > 0) {
      throw new DuplicateModuleError(matchingModules[0])
    }
  }

  buildModule({
    name,
    id,
    group,
    cloudProvider,
    softwareProvider
  }: AddToCatalogParams): CatalogModule {
    return {
      name,
      id,
      group,
      cloudProvider,
      softwareProvider
    }
  }
}
