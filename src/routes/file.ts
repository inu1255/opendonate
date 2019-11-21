import * as cofs from "fs-extra";
import db from "../common/db";
import * as path from 'path';
import * as config from '../common/config';
import { Request, Response } from "express-serve-static-core";

export async function upload(req: Request, res: Response) {
    // gparam "../../api/file/upload.json" --ts
    interface UploadBody {
        f?: FormFile; // 文件
    }

    let body: UploadBody = req.body
    let user = req.session.user;
    let data: db.File = {
        name: body.f.name,
        ext: path.extname(body.f.name),
        ip: req.realip,
        ua: req.ua,
        create_at: +new Date(),
        create_id: user.id,
    }
    await db.insert('file', data);
    return {
        name: body.f.path.slice(config.upload.length + (+!config.upload.endsWith('/'))),
    }
}