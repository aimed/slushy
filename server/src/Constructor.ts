export type Constructor<T> = Function & {
    prototype: T
}
