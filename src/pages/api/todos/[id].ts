import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions)

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { id } = req.query

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid todo ID' })
  }

  if (req.method === 'PATCH') {
    try {
      const { title, description, completed } = req.body

      const todo = await prisma.todo.findFirst({
        where: {
          id,
          userId: session.user.id,
        },
      })

      if (!todo) {
        return res.status(404).json({ error: 'Todo not found' })
      }

      const updatedTodo = await prisma.todo.update({
        where: { id },
        data: {
          ...(title !== undefined && { title }),
          ...(description !== undefined && { description }),
          ...(completed !== undefined && { completed }),
        },
      })

      res.status(200).json(updatedTodo)
    } catch (error) {
      console.error('Failed to update todo:', error)
      res.status(500).json({ error: 'Failed to update todo' })
    }
  } else if (req.method === 'DELETE') {
    try {
      const todo = await prisma.todo.findFirst({
        where: {
          id,
          userId: session.user.id,
        },
      })

      if (!todo) {
        return res.status(404).json({ error: 'Todo not found' })
      }

      await prisma.todo.delete({
        where: { id },
      })

      res.status(200).json({ message: 'Todo deleted successfully' })
    } catch (error) {
      console.error('Failed to delete todo:', error)
      res.status(500).json({ error: 'Failed to delete todo' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}