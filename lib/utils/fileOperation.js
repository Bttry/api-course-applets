const util = require('util')
const multer = require('koa-multer')
const path = require('path')
const fs = require('fs')
const moment = require('moment')
const exec = util.promisify(require('child_process').exec)
const isProd = process.env.NODE_ENV === 'production'

const outInfo = function(json) {
  if (json.error) return console.error('error: ', json.error)
  if (json.stderr) return console.error('stderr: ', json.stderr)
  isProd ? undefined : console.log(json.stdout)
}

const fileOperation = {
  /**
   * 复制文件
   * @param {String} inFile 输入文件
   * @param {String} outFile 输出文件
   */
  copyFile: async function(inFile, outFile) {
    const result = await exec(`cp -rf ${inFile} ${outFile}`)
    outInfo(result)
  },
  /**
   * 剪切文件
   * @param {String} inFile 输入文件
   * @param {String} outFile 输出文件
   */
  clippingFile: async function(inFile, outFile) {
    const result = await exec(`mv ${inFile} ${outFile}`)
    outInfo(result)
  },
  /**
   * 删除指定文件夹(包括子文件夹)
   * @param {String} folder 文件夹名
   */
  deleteFolder: async function(folder) {
    const result = await exec(`rm -rf ${folder}`)
    outInfo(result)
  },
  /**
   * 上传文件
   * @param {String} place  文件存放位置
   * @param {String} name  生成后文件名
   */
  uploadFile: function(place = 'uploads/temp') {
    const storage = multer.diskStorage({
      destination: path.resolve(__dirname, '../../', place),
      filename(ctx, file, cb) {
        const filenameArr = file.originalname.split('.')
        cb(null, Date.now() + '.' + filenameArr[filenameArr.length - 1])
      }
    })
    return multer({ storage })
  },
  /**
   * 查找(如果没有找到则创建)
   */
  decideFolder: (filename, dirList = []) => {
    let mode = '0775'
    if (dirList.length > 0) {
      dirList.forEach(obj => {
        let PATH = path.join(filename, obj)
        create(PATH)
      })
    } else {
      create(filename)
    }
    function create(PATH) {
      let arr = PATH.split(path.sep)
      if (arr[0] == '.') arr.shift()
      if (arr[0] == '..') arr.splice(0, 2, arr[0] + '/' + arr[1])
      inner(arr.shift(), arr)
    }
    function inner(cur, arr) {
      if (!fs.existsSync(cur)) {
        try {
          if (cur) fs.mkdirSync(cur, mode)
        } catch (err) {
          console.log(err)
        }
      }
      if (arr.length) inner(`${cur}/${arr.shift()}`, arr)
    }
  },
  /**
   * 搬迁文件，并按指定规则放置文件
   */
  moveFile: options => {
    let {
      tempFile = '',
      storage = '',
      storageType = 'customize',
      name = '',
      nameType = 'original'
    } = options

    return new Promise(resolve => {
      if (!tempFile) return resolve('')
      let uploadPath = path.resolve(__dirname, '../../uploads'),
        filePath = path.join(uploadPath, tempFile),
        fileAll = tempFile.split(path.sep).pop(),
        flieName = fileAll.slice(0, fileAll.lastIndexOf('.')),
        fileSuffix = fileAll.split('.').pop(),
        aimsStorage = '',
        aimsName = ''

      if (!fileSuffix) return resolve('')

      switch (storageType) {
        case 'customize':
          aimsStorage = storage
          break
        case 'date':
          aimsStorage = moment()
            .format('YYYY-MM-DD')
            .split('-')
            .join(path.sep)
          break
      }

      switch (nameType) {
        case 'original':
          aimsName = flieName
          break
        case 'customize':
          aimsName = name || flieName
          break
        case 'only':
          aimsName = fileOperation.returnGuid()
          break
      }
      aimsPath = '/' + path.join(aimsStorage, [aimsName, fileSuffix].join('.'))
      fileOperation.decideFolder(path.join(uploadPath, aimsStorage))
      fileOperation.clippingFile(filePath, path.join(uploadPath, aimsPath))

      resolve(aimsPath)
    })
  },
  /**
   * 生成全球唯一标示符
   */
  returnGuid: () => {
    function S4() {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
    }
    return S4() + S4() + '-' + S4() + '-' + S4() + S4() + S4()
  },
  /**
   *
   * @param {String} commandPath 无限循环文件
   */
  loadFiles(params) {
    let me = this,
      { commandPath, callback } = params
    fs.readdirSync(commandPath).forEach(files => {
      let readFile = `${commandPath}${path.sep}${files}`
      let stat = fs.lstatSync(readFile)
      if (!stat.isDirectory()) {
        // 当前文件夹下存在文件
        try {
          switch (Object.prototype.toString.call(callback)) {
            case '[object Function]':
            case '[object AsyncFunction]':
            case '[object GeneratorFunction]':
              callback({ files, readFile })
          }
        } catch (e) {
          console.log(e.message)
        }
      } else {
        fileOperation.loadFiles.call(me, readFile)
      }
    })
  }
}

module.exports = fileOperation
