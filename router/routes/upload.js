
const multer = require("koa-multer")
const connection = require("../../database")
const sql = require("../../database/");
const mysql = require("mysql");
const getDatetime = require("../../database/utils/getDatetime")
// 自定义文件储存处理器
const storage = multer.diskStorage({
    destination: function (req, file, cb) { // 上传文件的储存地址
        cb(null, 'static/uploads/')
    },
    filename: function (req, file, cb) { // 自定义上传的文件名称
        const singfileArray = file.originalname.split('.');
        const fileExtension = singfileArray[singfileArray.length - 1];
        cb(null, Date.now() + "." + fileExtension);
    }
})

// 初始化上传文件中间件
const upload = multer({ storage: storage })

const addUploadRoute = router => {
    router.post('/upload', upload.single('file'), async (ctx) => {
        const { headers, file } = ctx.req;
        // 将文件信息存储到数据库中
        connection.query(`INSERT INTO file_info `)
        ctx.body = {
            path: 'http://' + headers.host + '/uploads/' + file.filename, // 拼接成完整的地址
            message: 'ok'
        };
    })
}
module.exports = addUploadRoute