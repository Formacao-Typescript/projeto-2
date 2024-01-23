import { Router, Request } from 'express'
import { StudentCreationSchema, StudentUpdateSchema, StudentUpdateType } from '../domain/Student.js'
import { StudentService } from '../services/StudentService.js'
import zodValidationMiddleware from './middlewares/zodValidationMiddleware.js'
import { z } from 'zod'

const studentParentPatchSchema = z.object({ parentIds: z.string().uuid().array().nonempty() })
type StudentParentPatchType = z.infer<typeof studentParentPatchSchema>

export function studentRouterFactory(studentService: StudentService) {
  const router = Router()

  router.get('/:id', async (req, res, next) => {
    try {
      const student = studentService.findById(req.params.id)
      return res.json(student.toObject())
    } catch (error) {
      next(error)
    }
  })

  router.get('/', async (_, res) => {
    return res.json(studentService.list().map((student) => student.toObject()))
  })

  router.post('/', zodValidationMiddleware(StudentCreationSchema), async (req, res, next) => {
    try {
      const student = studentService.create(req.body)
      return res.status(201).json(student.toObject())
    } catch (error) {
      next(error)
    }
  })

  router.put(
    '/:id',
    zodValidationMiddleware(StudentUpdateSchema),
    async (req: Request<{ id: string }, any, StudentUpdateType>, res, next) => {
      try {
        const { id } = req.params
        const updated = studentService.update(id, req.body)
        return res.json(updated.toObject())
      } catch (error) {
        next(error)
      }
    }
  )

  router.delete('/:id', async (req, res) => {
    studentService.remove(req.params.id)
    return res.status(204).send()
  })

  router.get('/:id/parents', async (req, res, next) => {
    try {
      const { id } = req.params
      const parents = studentService.getParents(id)
      return res.json(parents.map((parent) => parent.toObject()))
    } catch (error) {
      next(error)
    }
  })

  router.patch(
    '/:id/parents',
    zodValidationMiddleware(studentParentPatchSchema),
    async (req: Request<{ id: string }, any, StudentParentPatchType>, res, next) => {
      try {
        const { id } = req.params
        const { parentIds } = req.body
        return res.json(studentService.linkParents(id, parentIds).toObject())
      } catch (error) {
        next(error)
      }
    }
  )

  return router
}
