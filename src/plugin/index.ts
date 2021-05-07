import { join } from 'path'
import { MockData, MockDataResolver } from 'ts-mock-generator'
import type { Connect } from 'vite'
import type { Options } from '../types'
import { logger } from '../utils'

let mockData: MockData[]
export const getOrGenerateMockData = async(opts: Options) => {
  const mockDataResolver = new MockDataResolver({
    configPath: join(process.cwd(), 'tsconfig.json'),
    basePath: join(process.cwd(), opts.basePath),
    mockDir: opts.mockDir ? join(process.cwd(), opts.mockDir) : undefined,
    includes: opts.includes || []
  })

  mockData = mockDataResolver.getOrGenerateData()

  if (opts.watchFile) {
    mockDataResolver.watchMockFile((data: MockData[]) => {
      mockData = data
    })
    mockDataResolver.watchRequestFile((data: MockData[]) => {
      mockData = data
    })
  }
}

const getTargetMockData = (url: string | undefined) => mockData.filter(data => data.url === url)

const sleep = (delay: number) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(null)
    }, delay)
  })

export const requestMiddleware: Connect.NextHandleFunction = async(req, res, next) => {
  const url = req.url?.split('?')[0]
  const targetMockData = getTargetMockData(url)
  if (targetMockData.length > 0) {
    logger.info(`invoke mock proxy: ${url}`)
    const [data] = targetMockData
    if (data.timeout) {
      await sleep(data.timeout)
    }
    res.setHeader('Content-Type', 'application/json')
    res.statusCode = data.httpCode ? data.httpCode : 200
    res.end(JSON.stringify(data.response))
    return
  }

  next()
}
