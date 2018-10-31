const utils = require('../common/utils');
const email = require('../common/email');
const config = require('../common/config');
const db = require('../common/db');

exports.sendEmail = async function() {
    let rows = await db.execSQL(`select email,o.cnt from (select user_id,count(id) as cnt from orders where state=0 and create_at>? group by user_id) as o left join user on user.id=o.user_id`, [config.notify_at || 0], true);
    for (let row of rows) {
        email.sendHtml(row.email, `您有${row.cnt}条订单需要处理`, `<a href="http://perpay.inu1255.cn/orders?type=null&state=0&ret=null&r=day">点此处理</a>`);
    }
    config.notify_at = +new Date();
    config.save();
    return 30e3; // 30秒
};