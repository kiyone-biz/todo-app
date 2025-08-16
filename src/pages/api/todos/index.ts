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

  if (req.method === 'GET') {
    try {
      const todos = await prisma.todo.findMany({
        where: {
          userId: session.user.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      res.status(200).json(todos)
    } catch (error) {
      console.error('Failed to fetch todos:', error)
      res.status(500).json({ error: 'Failed to fetch todos' })
    }
  } else if (req.method === 'POST') {
    try {
      const { title, description } = req.body

      if (!title) {
        return res.status(400).json({ error: 'Title is required' })
      }

      const todo = await prisma.todo.create({
        data: {
          title,
          description,
          userId: session.user.id,
        },
      })

      res.status(201).json(todo)
    } catch (error) {
      console.error('Failed to create todo:', error)
      res.status(500).json({ error: 'Failed to create todo' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}