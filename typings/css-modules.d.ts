type ClassNames = string | { [key: string]: boolean } | ClassNames[]

declare module '*.css' {
  const classNames: (names: ClassNames) => string
  export = classNames
}
