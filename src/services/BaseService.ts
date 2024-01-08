import { Database } from '../data/Db.js'
import { NotFoundError } from '../domain/Errors/NotFound.js'
import { Serializable, SerializableStatic } from '../domain/types.js'

export abstract class Service<Static extends SerializableStatic, Instance extends Serializable = InstanceType<Static>> {
  constructor(protected repository: Database<Static>) {}

  findById(id: string) {
    const entity = this.repository.findById(id)
    if (!entity) throw new NotFoundError(id, this.repository.dbEntity)
    return entity
  }

  list() {
    return this.repository.list()
  }

  listBy<Property extends keyof Instance>(property: Property, value: Instance[Property]) {
    const entity = this.repository.listBy(property, value)
    return entity
  }

  remove(id: string) {
    this.repository.remove(id)
    return
  }

  abstract update(id: string, newData: unknown): Instance
  abstract create(creationData: unknown): Instance
}
