import Vue from 'vue';
import filter from './filter';
import utils from '../common/utils';
import request from '../common/request';
import './directive';
import IListItem from './IListItem';
Vue.component('IListItem', IListItem);
import ITree from './ITree';
Vue.component('ITree', ITree);
import IIcon from './IIcon';
Vue.component('IIcon', IIcon);
import IDate from './IDate';
Vue.component('IDate', IDate);
// import IEditor from './IEditor/Demo';
// Vue.component('IEditor', IEditor);
import IDateRange from './IDateRange';
Vue.component("IDateRange", IDateRange);
import IHeader from './IHeader';
Vue.component("IHeader", IHeader);
import IForm from './IForm';
Vue.component("IForm", IForm);

Vue.prototype.$get = function(url, data, config) {
    if (!data) return request.get(url, config);
    data = utils.clearNull(data);
    let ss = [];
    for (let k in data) {
        let v = data[k];
        if (typeof v === "undefined") continue;
        if (typeof v === "object") v = JSON.stringify(v);
        ss.push(`${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
    }
    ss = ss.join('&');
    return request.get(url + (url.indexOf('?') < 0 ? '?' : '&') + ss, config);
};
Vue.prototype.$post = request.post;
for (let k in filter) {
    Vue.filter(k, filter[k]);
}