import { Database } from '../data/Db.js'
import { ConflictError } from '../domain/Errors/Conflict.js'
import { DomainError } from '../domain/Errors/DomainError.js'
import { Student, StudentCreationType, StudentUpdateType } from '../domain/Student.js'
import { Service } from './BaseService.js'
import { ParentService } from './ParentService.js'

export class StudentService extends Service<typeof Student> {
  constructor(repository: Database<typeof Student>, private readonly parentService: ParentService) {
    super(repository)
  }

  update(id: string, newData: StudentUpdateType): Student {
    const entity = this.findById(id)
    const updated = new Student({
      ...entity.toObject(),
      ...newData
    })
    this.repository.save(updated)
    return updated
  }

  create(creationData: StudentCreationType): Student {
    const existing = this.repository.listBy('document', creationData.document)
    if (existing.length > 0) {
      throw new ConflictError(creationData.document, Student)
    }
    creationData.parents.forEach((parentId) => this.parentService.findById(parentId))
    const entity = new Student(creationData)
    this.repository.save(entity)
    return entity
  }

  getParents(studentId: string) {
    const student = this.findById(studentId)
    return student.parents.map((parentId) => this.parentService.findById(parentId))
  }

  linkParents(id: string, parentsToUpdate: StudentCreationType['parents']) {
    const student = this.findById(id)
    parentsToUpdate.forEach((parentId) => this.parentService.findById(parentId))

    const newParents = parentsToUpdate.filter((parentId) => !student.parents.includes(parentId))
    this.#assertAtLeastOneParentLeft(newParents)
    student.parents = [...student.parents, ...newParents]
    this.repository.save(student)
    return student
  }

  #assertAtLeastOneParentLeft(parentArray: unknown[]): asserts parentArray is [string, ...string[]] {
    if (parentArray.length === 0) {
      throw new DomainError('Cannot remove all parents from a student', Student, {
        code: 'EMPTY_DEPENDENCY',
        status: 403
      })
    }
  }
}
