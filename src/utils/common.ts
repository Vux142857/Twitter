export const enumToNumArray = (enumField: { [keys: string]: string | number }): number[] => {
  return Object.values(enumField).filter((value) => typeof value === 'number') as number[]
}

export const enumToStringArray = (enumField: { [keys: string]: string | number }): string[] => {
  return Object.values(enumField).filter((value) => typeof value === 'string') as string[]
}