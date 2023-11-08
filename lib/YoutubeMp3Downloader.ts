/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-unused-vars */
import os from 'os'
import EventEmitter from 'events'
import ffmpeg from 'fluent-ffmpeg'
import ytdl from 'ytdl-core'
import async from 'async'
import progress from 'progress-stream'
import sanitize from 'sanitize-filename'
interface YoutubeMp3DownloaderType {
  youtubeBaseUrl?: string
  youtubeVideoQuality?: string
  outputPath?: string
  queueParallelism?: number
  progressTimeout?: number
  requestOptions?: any
  outputOptions?: any
  allowWebm?: boolean
  downloadQueue?: any
  ffmpegPath: string
}
class YoutubeMp3Downloader extends EventEmitter {
  private youtubeBaseUrl: string
  private youtubeVideoQuality: string
  private outputPath: string
  private queueParallelism: number
  private progressTimeout: number
  private requestOptions: any
  private outputOptions: any
  private allowWebm: boolean
  private downloadQueue: any
  private ffmpegPath: string
  constructor(options: YoutubeMp3DownloaderType) {
    super()
    this.youtubeBaseUrl = 'http://www.youtube.com/watch?v='
    this.youtubeVideoQuality = options && options.youtubeVideoQuality ? options.youtubeVideoQuality : 'highestaudio'
    this.outputPath = options && options.outputPath ? options.outputPath : os.homedir()
    this.queueParallelism = options && options.queueParallelism ? options.queueParallelism : 1
    this.progressTimeout = options && options.progressTimeout ? options.progressTimeout : 1000
    this.requestOptions = options && options.requestOptions ? options.requestOptions : { maxRedirects: 5 }
    this.outputOptions = options && options.outputOptions ? options.outputOptions : []
    this.allowWebm = options && options.allowWebm ? options.allowWebm : false
    this.ffmpegPath = options && options.ffmpegPath ? options.ffmpegPath : 'ffmpeg'
    if (options && options.ffmpegPath) {
      ffmpeg.setFfmpegPath(options.ffmpegPath)
    }

    this.setupQueue()
  }

  private setupQueue() {
    // Async download/transcode queue
    const self = this
    this.downloadQueue = async.queue(function (task: any, callback: any) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      self.emit('queueSize', self.downloadQueue.running() + self.downloadQueue.length())

      self.performDownload(task, function (err: any, result: any) {
        callback(err, result)
      })
    }, self.queueParallelism)
  }

  download(videoId: string, fileName: string) {
    const self: this = this
    const task = {
      videoId: videoId,
      fileName: fileName
    }
    this.downloadQueue.push(task, function (err: EventEmitter, data: any) {
      self.emit('queueSize', self.downloadQueue.running() + self.downloadQueue.length())

      if (err) {
        self.emit('error', err, data)
      } else {
        self.emit('finished', err, data)
      }
    })
  }

  async performDownload(task: any, callback: any) {
    let info: any
    const self: this = this
    const videoUrl = this.youtubeBaseUrl + task.videoId
    const resultObj = {
      file: task.fileName || null,
      videoId: task.videoId,
      stats: task.stats || {},
      youtubeUrl: task.youtubeUrl || null,
      title: task.title || null,
      videoTitle: task.videoTitle || null,
      artist: task.artist || null,
      thumbnail: task.thumbnail || null
    }

    try {
      const downloadOptions: ytdl.downloadOptions = {
        quality: this.youtubeVideoQuality,
        requestOptions: this.requestOptions
      }
      info = await ytdl.getInfo(videoUrl, downloadOptions)
    } catch (err) {
      return callback(err)
    }

    const videoTitle = sanitize(info.videoDetails.title)
    let artist = 'Unknown'
    let title = 'Unknown'
    const thumbnail = info.videoDetails.thumbnails
      ? info.videoDetails.thumbnails[0].url
      : info.videoDetails.thumbnail || null

    if (videoTitle.indexOf('-') > -1) {
      const temp = videoTitle.split('-')
      if (temp.length >= 2) {
        artist = temp[0].trim()
        title = temp[1].trim()
      }
    } else {
      title = videoTitle
    }

    // Derive file name, if given, use it, if not, from video title
    const fileName = task.fileName
      ? this.outputPath + '/' + sanitize(task.fileName)
      : this.outputPath + '/' + (videoTitle || info.videoId) + '.mp3'

    // Stream setup
    const streamOptions = {
      quality: this.youtubeVideoQuality,
      requestOptions: this.requestOptions,
      filter: (format: any) => format.container === 'mp3'
    }

    if (!this.allowWebm) {
      streamOptions.filter = (format) => format.container === 'mp4'
    }

    const stream = ytdl.downloadFromInfo(info, streamOptions)

    stream.on('error', function (err) {
      callback(err, null)
    })

    stream.on('response', function (httpResponse) {
      // Setup of progress module
      const str = progress({
        length: parseInt(httpResponse.headers['content-length']),
        time: self.progressTimeout
      })

      // Add progress event listener
      str.on('progress', function (progress: any) {
        if (progress.percentage === 100) {
          resultObj.stats = {
            transferredBytes: progress.transferred,
            runtime: progress.runtime,
            averageSpeed: parseFloat(progress.speed.toFixed(2))
          }
        }
        self.emit('progress', { videoId: task.videoId, progress: progress })
      })
      let outputOptions = ['-id3v2_version', '4', '-metadata', 'title=' + title, '-metadata', 'artist=' + artist]
      if (self.outputOptions) {
        outputOptions = outputOptions.concat(self.outputOptions)
      }

      const audioBitrate = info.formats.find((format: any) => !!format.audioBitrate).audioBitrate

      // Start encoding
      const proc = ffmpeg({
        source: stream.pipe(str)
      })
        .audioBitrate(audioBitrate || 192)
        .withAudioCodec('libmp3lame')
        .toFormat('mp3')
        .outputOptions(...outputOptions)
        .on('error', function (err) {
          return callback(err.message, null)
        })
        .on('end', function () {
          resultObj.file = fileName
          resultObj.youtubeUrl = videoUrl
          resultObj.videoTitle = videoTitle
          resultObj.artist = artist
          resultObj.title = title
          resultObj.thumbnail = thumbnail
          return callback(null, resultObj)
        })
        .saveToFile(fileName)
    })
  }
}

export default YoutubeMp3Downloader
