import { LocalStorage } from "./storage";
import request from '../../common/request';
import utils from '../../common/utils';

const store = new LocalStorage("user", {
    user: null,
    body: {}
});

store.addMutations({
    'user'(state, data) {
        state.user = data;
        if (data) {
            utils.cacheUsers([data]);
        }
    }
});

store.addActions({
    async login({ commit, state }, body) {
        let user = await request.post("user/login", body, { loading: true });
        if (body.remember) store.commit("body", body);
        store.commit("user", user);
    },
    async register({ commit, state }, body) {
        let user = await request.post("user/register", body, { loading: true });
        store.commit("user", user);
    },
    async whoami({ commit, state }, force) {
        let user = await request.get("user/whoami", { force: +force }, { loading: true });
        store.commit("user", user);
    },
    async logout({ commit, state }) {
        try {
            await request.get("user/logout", null, { loading: true });
        } catch (error) { console.log(error); }
        store.commit("user", null);
    },
});

setTimeout(() => {
    request.get("user/whoami").then(user => store.commit("user", user));
}, 0);

export default store;