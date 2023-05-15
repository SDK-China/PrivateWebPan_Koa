const sql = require("../../database/");
const mysql = require("mysql");
const jwt = require('jsonwebtoken');
const jwtKey = "SDK-CHINA"
const getDatetime = require("../../database/utils/getDatetime")
// app.use(koaBody({
//     multipart:true,
//     formidable:{
//         maxFlieSize:40000*1024*1024  //设置最大上传大小为4G
//     }
// }));


const routes = [
    //注册接口
    {
        url: "/regiser",
        method: "POST",
        handle: async ctx => {
            let { username, password, password2 } = ctx.request.query;
            const result = await new Promise((resolve, reject) => {
                sql.query(`SELECT * FROM user_info WHERE usersname=${mysql.escape(username)}`, (err, result) => {
                    err ? reject("获取数据失败") : resolve(result);
                })
            })
            if (!/^[a-zA-Z0-9_-]{6,16}$/g.test(username)) return ctx.body = {
                success: false,
                message: "账号格式错误"
            }

            if (result.length) return ctx.body = {
                success: false,
                message: "用户名已存在"
            }

            if (!/(?!^(\d+|[a-zA-Z]+|[~!@#$%^&*()_.]+)$)^[\w~!@#$%^&*()_.]{8,16}$/g.test(password)) return ctx.body = {
                success: false,
                message: "密码格式错误"
            }

            if (password !== password2) return ctx.body = {
                success: false,
                message: "两次密码输入不一致"
            }

            try {
                //添加用户输入的用户名和密码到MySql
                let datetime = getDatetime(Date.now())
                let { affectedRows } = await new Promise((resolve, reject) => {
                    sql.query(`INSERT INTO user_info(usersname, password) VALUES(${mysql.escape(username)}, ${mysql.escape(password)})`,
                        (err, result) => {
                            err ? reject(err) : resolve(result);
                        })
                })
                //为用户创建根目录，在MySql添加用户的根目录
                if (affectedRows > 0) {
                    affectedRows = await new Promise((resolve, reject) => {
                        sql.query(`INSERT INTO directory(path,usersname,create_time,update_time,delete_time) VALUES(${mysql.escape("/")},${mysql.escape(username)},${mysql.escape(datetime)},${mysql.escape(datetime)},${mysql.escape(datetime)})`,
                            (err, result) => {
                                err ? reject(err) : resolve(result.affectedRows)
                            })
                    })
                } else return ctx.body = {
                    success: false,
                    message: "为用户创建目录时失败"
                }
                console.log(affectedRows)
                return ctx.body = affectedRows > 0 ? {
                    success: true,
                    message: "注册成功"
                } : {
                    success: false,
                    message: "注册失败"
                }

            } catch (e) {
                console.log(e)
                return ctx.body = {
                    success: false,
                    message: "注册用户时出错"
                }
            }

            // const userInfo = result[0]
            // ctx.body = result[0]
        }

    },
    //登录接口
    {
        url: "/login",
        method: "POST",
        handle: async ctx => {
            let { username, password } = ctx.request.query;
            try {
                const result = await new Promise((resolve, reject) => {
                    sql.query(`SELECT * FROM user_info WHERE usersname=${mysql.escape(username)}`, (err, result) => {
                        err ? reject("获取数据失败") : resolve(result);
                    })
                })
                if (!result.length) return ctx.body = {
                    success: false,
                    message: "用户名不存在"
                }
                const userInfo = result[0]
                if (userInfo.password === password) {
                    const result = await new Promise((resolve, reject) => {
                        jwt.sign(
                            { username }, // 除了pwd
                            jwtKey,
                            { expiresIn: `${7 * 24 * 60 * 60}s` }, // 定义失效时间为30s
                            (err, token) => {
                                if (err) {
                                    reject(err)
                                    return;
                                }
                                ctx.session.username = username
                                resolve({
                                    success: true,
                                    message: "登录成功",
                                    username,
                                    token
                                })
                            }
                        )
                    })

                    ctx.body = result
                } else {
                    ctx.body = {
                        success: false,
                        message: "密码错误"
                    }
                }

            } catch (e) {
                console.log(e)
                ctx.body = {
                    success: false,
                    message: "未知错误"
                }
            }
        }
    },

]

module.exports = routes;
