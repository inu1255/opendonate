import * as fs from "fs";
import * as conf from '../lib/config';
import { argv } from "yargs";

const config_path = "config/.config.json";
const config = Object.assign(conf, {
    save() {
        fs.writeFile(config_path, JSON.stringify(config, null, 2), err => (err ? console.error(err) : ""));
    }
});

try {
    const text = fs.readFileSync(config_path, "utf8");
    Object.assign(config, JSON.parse(text));
} catch (error) {
    console.log("使用默认配置");
    config.save();
}

if (argv.port != null) config.port = argv.port as number;
if (argv.dev != null) config.dev = argv.dev as boolean;
if (argv.v === true) config.v = true;
else if (argv.v != null) config.v = false;

export = config;
