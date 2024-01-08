import { Class } from '../domain/Class.js'
import { Database } from './Db.js'

export class ClassRepository extends Database<typeof Class> {
  constructor() {
    super(Class)
  }
}
