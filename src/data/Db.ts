import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname, resolve } from 'path'
import type { Serializable, SerializableStatic } from '../domain/types.js'
import { fileURLToPath } from 'url'

/**
 * Fazemos dessa classe uma classe abstrata para que a gente sempre precise
 * criar uma classe específica para cada entidade que queremos persistir
 * e evitar o uso de new Database(Parent) no entrypoint
 */
export abstract class Database<
  Static extends SerializableStatic,
  Instance extends Serializable = InstanceType<Static>
> {
  protected readonly dbPath: string
  protected dbData: Map<string, Instance> = new Map()
  readonly dbEntity: Static

  constructor(entity: Static) {
    this.dbPath = resolve(dirname(fileURLToPath(import.meta.url)), `.data/${entity.name.toLowerCase()}.json`)
    this.dbEntity = entity
    this.#initialize()
  }

  #initialize() {
    if (!existsSync(dirname(this.dbPath))) {
      mkdirSync(dirname(this.dbPath), { recursive: true })
    }
    if (existsSync(this.dbPath)) {
      const data: [string, Record<string, unknown>][] = JSON.parse(readFileSync(this.dbPath, 'utf-8'))
      for (const [key, value] of data) {
        this.dbData.set(key, this.dbEntity.fromObject(value))
      }
      return
    }
    this.#updateFile()
  }

  #updateFile() {
    const data = [...this.dbData.entries()].map(([key, value]) => [key, value.toObject()])
    writeFileSync(this.dbPath, JSON.stringify(data))
    return this
  }

  findById(id: string) {
    return this.dbData.get(id)
  }

  listBy<Property extends keyof Instance>(property: Property, value: Instance[Property]) {
    const allData = this.list()
    return allData.filter((data) => {
      let comparable = data[property] as unknown
      let comparison = value as unknown
      // Se a propriedade for um objeto, um array ou uma data
      // não temos como comparar usando ===
      // portanto vamos converter tudo que cair nesses casos para string
      if (typeof comparable === 'object')
        [comparable, comparison] = [JSON.stringify(comparable), JSON.stringify(comparison)]

      // Ai podemos comparar os dois dados
      return comparable === comparison
    })
  }

  list(): Instance[] {
    return [...this.dbData.values()]
  }

  remove(id: string) {
    this.dbData.delete(id)
    return this.#updateFile()
  }

  save(entity: Instance) {
    this.dbData.set(entity.id, entity)
    return this.#updateFile()
  }
}
