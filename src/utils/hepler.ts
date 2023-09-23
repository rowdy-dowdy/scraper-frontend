export function parseSocketData (msg: any) {
  if (typeof msg !== 'string') return null
  const data: {
    type: string,
    value: any
  } = JSON.parse(msg)

  return data
}

export function formatSocketData(type: string, value?: any) {
  const data = JSON.stringify({
    type,
    value: value
  })
  return data
}