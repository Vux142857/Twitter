import { Router } from 'express'
const staticRouter = Router()
import {
  serveImageController,
  serveSegmentController,
  streamStaticVideoController,
  streamStaticVideoHLSController
} from '~/controllers/media.controllers'

// WIP: 90% - 100%
// Desciption: Serve image
// Route: /api/static/image/:name
// Method: GET
// Response OK: {file}
staticRouter.get('/image/:name', serveImageController)

// WIP: 50% - 60%
// Desciption: Serve video
// Route: /api/static/video/:id
// Method: GET
// Response OK: {file}
staticRouter.get('/video/:id', streamStaticVideoController)

// WIP: 50% - 60%
// Desciption: Serve video HLS
// Route: /api/static/video-hls/:id
// Method: GET
// Response OK: {file}
staticRouter.get('/video-hls/:id/master.m3u8', streamStaticVideoHLSController)

// WIP: 50% - 60%
// Desciption: Serve segment in video HLS
// Route: /api/static/video-hls/:id/:v/:segment
// Method: GET
// Response OK: {file}
staticRouter.get('/video-hls/:id/:v/:segment', serveSegmentController)

export default staticRouter
