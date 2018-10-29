import router from '../router';

function wrap_query(params) {
    let data = {};
    let query;
    for (let k in params) {
        let v = params[k];
        Object.defineProperty(data, k, {
            configurable: true,
            enumerable: true,
            get() {
                let v = router.currentRoute.query[k];
                try {
                    v = JSON.parse(v);
                } catch (err) {}
                return v;
            },
            set(v) {
                let query = {};
                query[k] = typeof v === "string" ? v : JSON.stringify(v);
                router.push({ query });
            }
        });
        if (router.currentRoute.query[k] == null) {
            query = query || {};
            query[k] = v;
        } else {
            data[k] = router.currentRoute.query[k];
        }
    }
    if (query) router.push({ query });
    return data;
}

export default wrap_query;