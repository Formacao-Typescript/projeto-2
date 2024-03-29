import { ConflictError } from '../domain/Errors/Conflict.js'
import { Teacher, TeacherCreationType } from '../domain/Teacher.js'
import { Service } from './BaseService.js'

export class TeacherService extends Service<typeof Teacher> {
  update(id: string, newData: Partial<Omit<TeacherCreationType, 'id'>>) {
    const entity = this.findById(id)
    const updated = new Teacher({
      ...entity.toObject(),
      ...newData
    })
    this.repository.save(updated)
    return updated
  }

  create(creationData: TeacherCreationType) {
    const existing = this.repository.listBy('document', creationData.document)
    if (existing.length > 0) {
      throw new ConflictError(creationData.document, Teacher)
    }
    const entity = new Teacher(creationData)
    this.repository.save(entity)
    return entity
  }
}
