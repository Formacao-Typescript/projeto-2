import { Database } from '../data/Db.js'
import { NotFoundError } from '../domain/Errors/NotFound.js'
import { Serializable, SerializableStatic } from '../domain/types.js'

export abstract class Service<E extends SerializableStatic, I extends Serializable = InstanceType<E>> {
  constructor(protected repository: Database<E>) {}

  findById(id: string) {
    const entity = this.repository.findById(id)
    if (!entity) throw new NotFoundError(id, this.repository.dbEntity)
    return entity
  }

  list() {
    return this.repository.list()
  }

  listBy<P extends keyof I>(property: P, value: I[P]) {
    const entity = this.repository.listBy(property, value)
    return entity
  }

  remove(id: string) {
    this.repository.remove(id)
    return
  }

  abstract update(id: string, newData: unknown): I
  abstract create(creationData: unknown): I
}
