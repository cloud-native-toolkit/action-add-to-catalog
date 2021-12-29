import fs from 'fs-extra'
import YAML from 'js-yaml'
import {join} from 'path'
import {LoggerApi} from '../logger'
import {Container} from 'typescript-ioc'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class YamlFile<T = any> {
  filename: string
  contents: T

  constructor(filename: string, contents: T) {
    this.filename = filename
    this.contents = contents
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static async load<S = any>(file: string): Promise<YamlFile<S>> {
    const logger: LoggerApi = Container.get(LoggerApi)

    const fullPath = join(process.cwd(), file)
    if (!fs.existsSync(fullPath)) {
      throw new Error(`File not found: ${fullPath}`)
    }

    logger.debug(`Loading file: ${fullPath}`)
    const contents: Buffer = await fs.readFile(fullPath)

    logger.info(`Loaded file contents: ${contents.toString()}`)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: S = YAML.load(contents.toString()) as any

    logger.info(`Parsed result: ${JSON.stringify(result)}`)

    return new YamlFile(file, result)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static async update<S = any>(
    file: string,
    values: Partial<S>
  ): Promise<YamlFile<S>> {
    const yamlFile: YamlFile<S> = await YamlFile.load<S>(file)

    yamlFile.setValues(values)

    await yamlFile.write()

    return yamlFile
  }

  setValues(values: Partial<T>): YamlFile<T> {
    Object.assign(this.contents, values)

    return this
  }

  async write(): Promise<YamlFile<T>> {
    await fs.writeFile(this.filename, this.contents)

    return this
  }
}
