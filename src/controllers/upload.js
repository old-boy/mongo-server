const path = require('path')
const fs = require('fs')
const Busboy = require('busboy')
const qiniu = require('qiniu')
const qiniuConfig = require('../config/qiniuConfig.js')

// 写入目录
const mkdirsSync = (dirname) => {
  if (fs.existsSync(dirname)) {
    return true
  } else {
    if (mkdirsSync(path.dirname(dirname))) {
      fs.mkdirSync(dirname)
      return true
    }
  }
  return false
}

function getSuffix(fileName) {
  return fileName
    .split('.')
    .pop()
}
// 重命名
function Rename(fileName) {
  return Math
    .random()
    .toString(16)
    .substr(2) + '.' + getSuffix(fileName)
}
// 删除文件
function removeTemImage(path) {
  fs.unlink(path, (err) => {
    if (err) {
      throw err
    }
  })
}
// 上传到七牛
const upToQiniu = async (filePath, key) => {  
  const accessKey = qiniuConfig.accessKey // 你的七牛的accessKey
  const secretKey = qiniuConfig.secretKey // 你的七牛的secretKey
  const mac = new qiniu.auth.digest.Mac(accessKey, secretKey)

  const options = {
    scope: qiniuConfig.bucket // 你的七牛存储对象
  }
  const putPolicy = new qiniu.rs.PutPolicy(options)
  const uploadToken = putPolicy.uploadToken(mac)

  const config = new qiniu.conf.Config()
  // 空间对应的机房
  config.zone = qiniu.zone.Zone_z1
  const localFile = filePath
  const formUploader = new qiniu.form_up.FormUploader(config)
  const putExtra = new qiniu.form_up.PutExtra()
  // 文件上传
  return new Promise((resolved, reject) => {
    formUploader.putFile(uploadToken, key, localFile, putExtra, function (respErr, respBody, respInfo) {
      if (respErr) {
        reject(respErr)
      }
      if (respInfo.statusCode == 200) {
        resolved(respBody)
      } else {
        resolved(respBody)
      }
    })
  })

}
// 上传到本地服务器
function uploadFile(ctx, options) {
  const _emmiter = new Busboy({headers: ctx.req.headers})
  const fileType = options.fileType
  const filePath = path.join(options.path, fileType)
  const confirm = mkdirsSync(filePath)
  if (!confirm) {
    return
  }
  console.log('start uploading...')
  return new Promise((resolve, reject) => {
    _emmiter
      .on('file', function (fieldname, file, filename, encoding, mimetype) {
        const fileName = Rename(filename)
        const saveTo = path.join(path.join(filePath, fileName))
        file.pipe(fs.createWriteStream(saveTo))
        file.on('end', function () {
          resolve({imgPath: `/${fileType}/${fileName}`, imgKey: fileName})
        })
      })

    _emmiter.on('finish', function () {
      console.log('finished...')
    })

    _emmiter.on('error', function (err) {
      console.log('err...')
      reject(err)
    })

    ctx
      .req
      .pipe(_emmiter)
  })
}

const upload = async function (ctx, next) {

  const serverPath = path.join(__dirname, '../../static/')
  // 获取上存图片
  const result = await uploadFile(ctx, {
    fileType: 'uploadCache',
    path: serverPath
  })
  const imgPath = path.join(serverPath, result.imgPath)
  // 上传到七牛
  const qiniu = await upToQiniu(imgPath, result.imgKey)
  // 上存到七牛之后 删除原来的缓存图片
  removeTemImage(imgPath)
  ctx.body = {
    imgUrl: `http://img.shifeng1993.com/${qiniu.key}`
  }
}
module.exports = upload;
