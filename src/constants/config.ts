import agrv from 'minimist'

const environment = agrv(process.argv.slice(2)).envi
export const isDev = (environment === 'development')
