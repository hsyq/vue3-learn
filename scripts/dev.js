// 使用 minimist 解析命令行参数
const args = require('minimist')(process.argv.slice(2))

const path = require('path')

// 使用 esbuild 作为构建工具
const { build } = require('esbuild')

// 需要打包的模块。默认打包 reactivity 模块
const target = args._[0] || 'reactivity'

// 打包的格式。默认为 global，即打包成 IIFE 格式，在浏览器中使用
const format = args.f || 'global'

// 打包的入口文件。每个模块的 src/index.ts 作为该模块的入口文件
const entry = path.resolve(__dirname, `../packages/${target}/src/index.ts`)

// 打包文件的输出格式
const outputFormat = format.startsWith('global') ? 'iife' : format === 'cjs' ? 'cjs' : 'esm'

// 文件输出路径。输出到模块目录下的 dist 目录下，并以各自的模块规范为后缀名作为区分
const outfile = path.resolve(__dirname, `../packages/${target}/dist/${target}.${format}.js`)

// 读取模块的 package.json，它包含了一些打包时需要用到的配置信息
const pkg = require(path.resolve(__dirname, `../packages/${target}/package.json`))

// buildOptions.name 是模块打包为 IIFE 格式时的全局变量名字
const pgkGlobalName = pkg?.buildOptions?.name

console.log('模块信息：\n', entry, '\n', format, '\n', outputFormat, '\n', outfile)

// 使用 esbuild 打包
build({
  // 打包入口文件，是一个数组或者对象
  entryPoints: [entry],

  // 输入文件路径
  outfile,

  // 将依赖的文件递归的打包到一个文件中，默认不会进行打包
  bundle: true,

  // 开启 sourceMap
  sourcemap: true,

  // 打包文件的输出格式，值有三种：iife、cjs 和 esm
  format: outputFormat,

  // 如果输出格式为 IIFE，需要为其指定一个全局变量名字
  globalName: pgkGlobalName,

  // 默认情况下，esbuild 构建会生成用于浏览器的代码。如果打包的文件是在 node 环境运行，需要将平台设置为node
  platform: format === 'cjs' ? 'node' : 'browser',

  // 监听文件变化，进行重新构建
  watch: {
    onRebuild(error, result) {
      if (error) {
        console.error('build 失败：', error)
      } else {
        console.log('build 成功:', result)
      }
    }
  }
}).then(() => {
  console.log('watching ...')
})