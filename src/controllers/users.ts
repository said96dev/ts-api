import express from 'express'
import { getUsers } from '../models/users'

export const getAllUsers = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const users = await getUsers()
    return res.json({
      users,
    })
  } catch (error) {
    console.error(error)
    res.sendStatus(404)
  }
}
