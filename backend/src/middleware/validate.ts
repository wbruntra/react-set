import { zValidator } from '@hono/zod-validator'
import type { ZodSchema } from 'zod'

export function validate<T extends ZodSchema>(target: 'json' | 'query' | 'param', schema: T) {
  return zValidator(target, schema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          error: 'Validation failed',
          issues: result.error.issues,
        },
        400,
      )
    }
  })
}
