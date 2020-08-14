## opendonate

### 环境需求

mysql, redis, node8+

``` bash
npm install
```

### 运行后端

``` sql
-- 在mysql中创建数据库opendonate  
create database opendonate DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
```

``` bash
# 生成数据表
npx greendb merge -uroot -p123456 opendonate --force
```

``` bash
# 修改配置 src/lib/config.ts 或 config/.config.json 
# 默认用 config/.config.json 如果不存在则使用 src/lib/config.ts 并生成 config/.config.json 
# 主要是 mysql 相关的配置需要修改
npm start
```

### 运行前端

``` bash
cd web
npm start
# 访问 http://localhost:8080 就可以了
```

### 编译和部署

``` bash
# 编译后端, 编译到 项目下/dist 目录
npm run build
# 编译前端, 编译到 项目下/public 目录
cd web
npm run build
# 部署需要
api/
config/.config.json # 配置文件，根据 src/lib/config.ts 
dist/
public/
greendb.js
package.json

# 运行
node dist/app.js --port 3000
```