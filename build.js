const fs = require('fs/promises')
const path = require('path')
const esbuild = require('esbuild')
const postcss = require('postcss')
const postcssModules = require('postcss-modules')
const cssnano = require('cssnano')

const classNames = {}

let currentId = 0

const nextName = (name) => {
  return `${name}__${currentId++}`
}

const CssModulesPlugin = () => ({
  name: 'CssModulesPlugin',
  setup(build) {
    const cssContent = {}

    build.onLoad(
      { filter: /\.css$/ },
      async ({ resolveDir, path: relativePath }) => {
        const filePath = path.resolve(resolveDir, relativePath)
        classNames[filePath] = classNames[filePath] ?? {}
        let classNameMap = {}
        const { css } = await postcss([
          postcssModules({
            getJSON(_, map) {
              classNameMap = map
            },
            generateScopedName(name) {
              if (!classNames[filePath][name]) {
                classNames[filePath][name] = nextName(name)
              }

              const scopedName = classNames[filePath][name]
              return scopedName
            },
          }),
        ]).process(await fs.readFile(filePath))

        cssContent[filePath] = css

        return {
          contents: `
            import classNames from 'classnames/bind'
            export default classNames.bind(${JSON.stringify(classNameMap)})
          `,
        }
      }
    )

    build.onEnd(async () => {
      const bundlePath = path.resolve(build.initialOptions.outdir, 'index.css')

      const { css } = await postcss([cssnano({ preset: 'default' })]).process(
        Object.keys(cssContent)
          .sort()
          .reverse()
          .map((key) => cssContent[key])
          .join('\n')
      )

      await fs.writeFile(bundlePath, css)
    })
  },
})

const recursiveCopy = async (srcDir, destDir) => {
  const absoluteSrc = path.resolve(__dirname, srcDir)
  const absoluteDest = path.resolve(__dirname, destDir)

  try {
    await fs.mkdir(absoluteDest)
  } catch (err) {}

  let entryStack = await fs.readdir(srcDir)
  let entry

  while ((entry = entryStack.pop())) {
    const entryPath = path.resolve(absoluteSrc, entry)
    const stats = await fs.stat(entryPath)

    const destPath = path.join(absoluteDest, entry)
    if (stats.isDirectory()) {
      try {
        const destStats = await fs.stat(destPath)
        if (!destStats.isDirectory()) {
          throw new Error(
            `Destination path exists and is not a directory: ${destPath}`
          )
        }
      } catch (err) {
        await fs.mkdir(destPath)
      }

      entryStack.push(
        ...(await fs.readdir(entryPath)).map((e) => path.join(entry, e))
      )
    } else {
      await fs.copyFile(entryPath, destPath)
    }
  }
}

recursiveCopy('./client/static', './dist')

esbuild.build({
  entryPoints: ['client/reset.css', 'client/index.tsx'],
  outdir: 'dist/assets',
  define: {
    'process.env.NODE_ENV': '"development"',
    __ENVIRONMENT__: '"development"',
  },
  minify: false,
  plugins: [CssModulesPlugin()],
  jsxFactory: 'h',
  jsxFragment: 'Fragment',
  bundle: true,
  watch: true,
})
