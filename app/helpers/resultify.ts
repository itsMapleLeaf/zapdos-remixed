export type Result<T> = [T, undefined] | [undefined, unknown]

export async function resultify<T>(
  promise: PromiseLike<T> | T,
): Promise<Result<T>> {
  try {
    return [await promise, undefined]
  } catch (error) {
    return [undefined, error]
  }
}
