webpackJsonp([2],{P17Q:function(t,e){},mP9T:function(t,e,a){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var r,i,n,s,l=a("K6ED"),o=a.n(l),u=a("BO1k"),c=a.n(u),v=a("Xxa5"),p=a.n(v),m=a("mvHQ"),d=a.n(m),_=a("exGp"),f=a.n(_),y=a("Zx67"),h=a.n(y),b=a("Zrlr"),w=a.n(b),k=a("wxAW"),g=a.n(k),x=a("zwoO"),q=a.n(x),O=a("Pf15"),$=a.n(O),T=a("7+uW"),z=a("443i"),P=(a("ipus"),a("JaHG"));var C,S,j,N,E,Q,A=(r=Object(z.a)(),i=P.a.loading(),r((s=function(t){function e(){var t,a,r,i;w()(this,e);for(var n=arguments.length,s=Array(n),l=0;l<n;l++)s[l]=arguments[l];return a=r=q()(this,(t=e.__proto__||h()(e)).call.apply(t,[this].concat(s))),r.loading=!1,r.query=P.a.query({type:null,state:0,ret:null,r:"day"},!0),r.payType=["支付宝","微信"],r.stateType=["待审核","支付失败","支付成功"],r.sendType=["待发货","发货失败","发货成功","手动发货"],r.columns=[{title:"ID",name:"id",width:64},{title:"IP",name:"ip",width:128},{title:"客户端",name:"ua",sortable:!0,width:84},{title:"支付方式",name:"type",sortable:!0,width:84},{title:"价格",name:"price",sortable:!0,width:64},{title:"创建时间",name:"create_at",sortable:!0,width:96},{title:"已支付",name:"pay_at",sortable:!0,width:84},{title:"状态",name:"state",width:84},{title:"发货",name:"ret",width:84},{title:"附加信息",name:"ext"},{title:"操作",name:"tools",width:48}],r.list=[],r.sort={name:"create_at",order:"desc"},i=a,q()(r,i)}return $()(e,t),g()(e,[{key:"format",value:function(t){t.price&&(t.price/=100),t.os=P.a.os(t.ua)}},{key:"onOk",value:function(){var t=f()(p.a.mark(function t(e,a,r){var i,n;return p.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:if(!(r&&e.api&&e.ret>1)){t.next=7;break}return t.next=3,this.$message.confirm("该订单已发货成功，确定要再次发货?");case 3:if(i=t.sent,i.result){t.next=7;break}return t.abrupt("return");case 7:return t.next=9,this.$post("orders/set",{id:e.id,state:a,send:r},{loading:!0});case 9:(n=t.sent).msg?this.$message.alert(d()(n.msg),"发货接口报错"):this.$message.alert("发货成功"),n.ret&&(e.ret=n.ret),e.state=a;case 13:case"end":return t.stop()}},t,this)}));return function(e,a,r){return t.apply(this,arguments)}}()},{key:"refresh",value:function(){var t=f()(p.a.mark(function t(){var e,a,r,i,n,s,l,o,u,v,m,d;return p.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return e=this.$refs.date.getRange(),a=e.min,r=e.max,i=P.a.clearNull({type:this.query.type,state:this.query.state,ret:this.query.ret,create_max:r,create_min:a}),t.next=4,this.$get("orders/search",i);case 4:for(n=t.sent,s=n.list,l=!0,o=!1,u=void 0,t.prev=9,v=c()(s);!(l=(m=v.next()).done);l=!0)d=m.value,this.format(d);t.next=17;break;case 13:t.prev=13,t.t0=t.catch(9),o=!0,u=t.t0;case 17:t.prev=17,t.prev=18,!l&&v.return&&v.return();case 20:if(t.prev=20,!o){t.next=23;break}throw u;case 23:return t.finish(20);case 24:return t.finish(17);case 25:this.list=s;case 26:case"end":return t.stop()}},t,this,[[9,13,17,25],[18,,20,24]])}));return function(){return t.apply(this,arguments)}}()},{key:"mounted",value:function(){this.refresh()}},{key:"table_data",get:function(){var t=this.list.concat(),e=this.sort.name;if(e){var a="desc"==this.sort.order?-1:1;t.sort(function(t,r){var i=t[e]-r[e];if(i)return i*a})}return t}}]),e}(T.default),C=s.prototype,S="refresh",j=[i],N=o()(s.prototype,"refresh"),E=s.prototype,Q={},Object.keys(N).forEach(function(t){Q[t]=N[t]}),Q.enumerable=!!Q.enumerable,Q.configurable=!!Q.configurable,("value"in Q||Q.initializer)&&(Q.writable=!0),Q=j.slice().reverse().reduce(function(t,e){return e(C,S,t)||t},Q),E&&void 0!==Q.initializer&&(Q.value=Q.initializer?Q.initializer.call(E):void 0,Q.initializer=void 0),void 0===Q.initializer&&(Object.defineProperty(C,S,Q),Q=null),n=s))||n),D={render:function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"pages-orders"},[a("br"),t._v(" "),a("div",{staticStyle:{padding:"12px"}},[a("i-date-range",{ref:"date",attrs:{type:t.query.r,max:"now",all:""},on:{change:function(e){t.refresh()},"update:type":function(e){t.$set(t.query,"r",e)}}})],1),t._v(" "),a("div",{staticClass:"tar"},[a("mu-select",{staticStyle:{width:"8em","margin-right":"1em"},attrs:{label:"支付方式"},model:{value:t.query.type,callback:function(e){t.$set(t.query,"type",e)},expression:"query.type"}},[a("mu-option",{attrs:{label:"全部",value:null}}),t._v(" "),t._l(t.payType,function(t,e){return a("mu-option",{key:e,attrs:{label:t,value:e}})})],2),t._v(" "),a("mu-select",{staticStyle:{width:"8em","margin-right":"1em"},attrs:{label:"支付状态"},model:{value:t.query.state,callback:function(e){t.$set(t.query,"state",e)},expression:"query.state"}},[a("mu-option",{attrs:{label:"全部",value:null}}),t._v(" "),t._l(t.stateType,function(t,e){return a("mu-option",{key:e,attrs:{label:t,value:e}})})],2),t._v(" "),a("mu-select",{staticStyle:{width:"8em","margin-right":"1em"},attrs:{label:"发货状态"},model:{value:t.query.ret,callback:function(e){t.$set(t.query,"ret",e)},expression:"query.ret"}},[a("mu-option",{attrs:{label:"全部",value:null}}),t._v(" "),t._l(t.sendType,function(t,e){return a("mu-option",{key:e,attrs:{label:t,value:e}})})],2),t._v(" "),a("mu-button",{attrs:{color:"primary"},on:{click:t.refresh}},[t._v("搜索")])],1),t._v(" "),a("div",[t._v("最多显示1000条")]),t._v(" "),a("mu-paper",{attrs:{"z-depth":1}},[a("mu-data-table",{attrs:{loading:t.loading,columns:t.columns,data:t.table_data,sort:t.sort},on:{"update:sort":function(e){t.sort=e}},scopedSlots:t._u([{key:"default",fn:function(e){var r=e.row;return[a("td",[t._v(t._s(r.id))]),t._v(" "),a("td",[t._v(t._s(r.ip))]),t._v(" "),a("td",[a("span",{attrs:{title:r.ua}},[t._v(t._s(r.os))])]),t._v(" "),a("td",{staticClass:"tac"},[t._v(t._s(t.payType[r.type]))]),t._v(" "),a("td",{staticClass:"tac"},[t._v(t._s(r.price?r.price:"不设"))]),t._v(" "),a("td",[a("i-date",{attrs:{value:r.create_at,digits:1}})],1),t._v(" "),a("td",{staticClass:"tac"},[r.pay_at?a("span",[t._v("\n\t\t\t\t\t\t"+t._s(t._f("diff")(r.pay_at-r.create_at))+"后\n\t\t\t\t\t")]):t._e()]),t._v(" "),a("td",[t._v(t._s(t.stateType[r.state||0]))]),t._v(" "),a("td",[t._v(t._s(2==r.state?t.sendType[r.ret||0]:""))]),t._v(" "),a("td",[t._v(t._s(r.ext))]),t._v(" "),a("td",[a("mu-menu",{attrs:{cover:"",placement:"bottom-end"}},[a("mu-icon",{attrs:{value:"more_vert"}}),t._v(" "),a("mu-list",{attrs:{slot:"content"},slot:"content"},[a("mu-list-item",{directives:[{name:"show",rawName:"v-show",value:!r.api,expression:"!row.api"}],attrs:{button:""},on:{click:function(e){t.onOk(r,2)}}},[a("mu-list-item-title",[t._v("确认")])],1),t._v(" "),a("mu-list-item",{directives:[{name:"show",rawName:"v-show",value:!r.api,expression:"!row.api"}],attrs:{button:""},on:{click:function(e){t.onOk(r,2,1)}}},[a("mu-list-item-title",[t._v("已发货")])],1),t._v(" "),a("mu-list-item",{directives:[{name:"show",rawName:"v-show",value:r.api,expression:"row.api"}],attrs:{button:""},on:{click:function(e){t.onOk(r,2,1)}}},[a("mu-list-item-title",[t._v("确认并发货")])],1),t._v(" "),a("mu-list-item",{attrs:{button:""},on:{click:function(e){t.onOk(r,1)}}},[a("mu-list-item-title",[t._v("支付失败")])],1)],1)],1)],1)]}}])})],1)],1)},staticRenderFns:[]};var G=a("VU/8")(A,D,!1,function(t){a("P17Q")},null,null);e.default=G.exports}});