import { z } from 'zod'

export const CreateUserSchema = z.looseObject({
  uid: z.string().min(1).max(255),
  info: z
    .looseObject({
      displayName: z.string().optional(),
      email: z.string().optional(),
      uid: z.string().optional(),
      isAnonymous: z.boolean().optional(),
    })
    .optional(),
})

export type CreateUserInput = z.infer<typeof CreateUserSchema>

export const CreateGameSchema = z.object({
  uid: z.string().min(1).max(255),
  total_time: z.number().int().nonnegative(),
  player_won: z.union([z.literal(0), z.literal(1)]),
  difficulty_level: z.number().int().nonnegative(),
  winning_score: z.number().int().nonnegative(),
  data: z.record(z.string(), z.unknown()).optional(),
})

export type CreateGameInput = z.infer<typeof CreateGameSchema>
