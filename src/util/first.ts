// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {Optional} from 'js-optional'

export const first = <T>(arr: T[] = []): Optional<T> => {
  if (arr.length === 0) {
    return Optional.empty()
  }

  return Optional.ofNullable(arr[0])
}
