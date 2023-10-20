import express, { response } from 'express'
import { random, authentication } from '../helpers'
import { createUser, getUserByEmail } from '../models/users'
export const register = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password, username } = req.body
    if (!email || !password || !username) {
      return res.status(400)
    }
    const EmailAlreadyExists = await getUserByEmail(email)
    if (EmailAlreadyExists) {
      res.sendStatus(400)
    }
    const salt = random()
    const user = await createUser({
      email: email,
      username: username,
      authentication: {
        password: authentication(salt, password),
        salt,
      },
    })
    return res.json({ user: user })
  } catch (error) {
    console.log(error)
    return res.status(400)
  }
}

export const login = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.sendStatus(401)
    }
    const user = await getUserByEmail(email).select(
      '+authentication.salt +authentication.password'
    )
    if (!user) {
      return res.sendStatus(401)
    }
    const expectedHash = authentication(user.authentication.salt, password)
    if (expectedHash !== user.authentication.password) {
      return res.sendStatus(403)
    }

    const salt = random()
    user.authentication.sessionToken = authentication(salt, user._id.toString())
    await user.save()
    res.cookie('Said-Auth', user.authentication.sessionToken, {
      domain: 'localhost',
      path: '/ ',
    })

    return res.json({ user })
  } catch (error) {
    console.log(error)
    return res.status(400)
  }
}
