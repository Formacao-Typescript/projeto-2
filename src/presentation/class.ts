import { Request, Router } from 'express'
import { z } from 'zod'
import { ClassCreationType, ClassCreationSchema, ClassUpdateType, ClassUpdateSchema } from '../domain/Class.js'
import { ClassService } from '../services/ClassService.js'
import zodValidationMiddleware from './middlewares/zodValidationMiddleware.js'

const teacherPatchSchema = z.object({ teacherId: z.string().uuid() })
type TeacherPatchType = z.infer<typeof teacherPatchSchema>

export function classRouterFactory(classService: ClassService) {
  const router = Router()

  router.get('/:id', async (req, res, next) => {
    try {
      const { id } = req.params
      const classEntity = classService.findById(id)
      return res.json(classEntity.toObject())
    } catch (error) {
      next(error)
    }
  })

  router.get('/', async (req, res) => {
    return res.json(classService.list().map((classEntity) => classEntity.toObject()))
  })

  router.post(
    '/',
    zodValidationMiddleware(ClassCreationSchema.omit({ id: true })),
    async (req: Request<never, any, Omit<ClassCreationType, 'id'>>, res, next) => {
      try {
        const classEntity = classService.create(req.body)
        return res.status(201).json(classEntity.toObject())
      } catch (error) {
        next(error)
      }
    }
  )

  router.put(
    '/:id',
    zodValidationMiddleware(ClassUpdateSchema),
    async (req: Request<{ id: string }, any, ClassUpdateType>, res, next) => {
      try {
        const { id } = req.params
        const updated = classService.update(id, req.body)
        return res.json(updated.toObject())
      } catch (error) {
        next(error)
      }
    }
  )

  router.delete('/:id', async (req, res, next) => {
    try {
      classService.remove(req.params.id)
      return res.status(204).send()
    } catch (error) {
      next(error)
    }
  })

  router.get('/:id/students', async (req, res, next) => {
    try {
      const { id } = req.params
      const students = classService.getStudents(id)
      return res.json(students.map((student) => student.toObject()))
    } catch (error) {
      next(error)
    }
  })

  router.get('/:id/teacher', async (req, res, next) => {
    try {
      const { id } = req.params
      const teacher = classService.getTeacher(id)
      return res.json(teacher.toObject())
    } catch (error) {
      next(error)
    }
  })

  return router
}
