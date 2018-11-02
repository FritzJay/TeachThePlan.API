import { Router, Request, Response } from 'express'

export let baseRouter = Router()

baseRouter.get('/', (_request: Request, response: Response) => {
    return response.status(200).json({
      message: "Welcome to Teach The Planet api!",
    })
})
