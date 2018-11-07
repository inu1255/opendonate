const Home = function() { return import('../pages/Home'); };
const UserEdit = function() { return import('../pages/UserEdit'); };
const Pay = function() { return import('../pages/Pay'); };
const QrCode = function() { return import('../pages/QrCode'); };
const Orders = function() { return import('../pages/Orders'); };
const Donate = function() { return import('../pages/Donate'); };
const Project = function() { return import('../pages/Project'); };

let routes = [];

// 菜单项
routes.push({
    path: "/qrcode",
    name: "收款码",
    icon: "qrcode",
    component: QrCode,
    meta: { menu: true, login: true }
},{
    path: '/project',
    name: '项目',
    icon: "api",
    component: Project,
    meta: { menu: true, login: true }
}, {
    path: '/orders',
    name: '订单',
    icon: "order",
    component: Orders,
    meta: { menu: true, login: true }
}, {
    path: '/user_edit',
    name: '修改个人信息',
    component: UserEdit,
    meta: { login: true }
}, );

routes.push({
    path: '/pay',
    name: '支付',
    component: Pay,
    meta: { solo: true }
}, {
    path: '/',
    name: '主页',
    icon: "home",
    component: Home,
    meta: { solo: true }
}, {
    path: '/donate/:id',
    name: '捐赠记录',
    component: Donate,
    meta: { title: '捐赠记录', solo: true }
}, );

export default routes;