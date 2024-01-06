import { Router } from 'express'
const staticRouter = Router()
import { serveImageController, streamStaticVideoController } from '~/controllers/media.controllers'

// WIP: 90% - 100%
// Desciption: Serve image
// Route: /api/static/image/:name
// Method: GET
// Response OK: {file}
staticRouter.get('/image/:name', serveImageController)

// WIP: 50% - 60%
// Desciption: Serve video
// Route: /api/static/video/:name
// Method: GET
// Response OK: {file}
staticRouter.get('/video/:name', streamStaticVideoController)

export default staticRouter
