import Vue from 'vue';
import utils from '../../common/utils';

Vue.directive('select', {
    bind(el, binding, vnode, oldVnode) {
        function fn() {
            utils.selectNode(el);
        }
        el.addEventListener('mouseenter', fn);
        vnode.context.$once('hook:beforeDestroy', function() {
            el.removeEventListener('mouseenter', fn);
        });
    },
});