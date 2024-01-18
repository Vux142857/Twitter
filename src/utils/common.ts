export const enumToNumArray = (enumField: { [keys: string]: string | number }): number[] => {
  return Object.values(enumField).filter((value) => typeof value === 'number') as number[]
}