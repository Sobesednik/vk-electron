require('animate.css')
require('lazy-vue')
const noty = require('noty');
require('bootstrap/dist/css/bootstrap.css');

const Vue = require('vue')
const App = require('./App.vue')
const Auth = require('./components/Auth.vue')
const PhotoList = require('./components/PhotoList.vue')

const VueRouter = require('vue-router')
const VueBreadcrumbs = require('vue2-breadcrumbs')

const Albums = require('./components/Albums.vue')
const Album = require('./components/Album.vue')

Vue.use(VueRouter)
Vue.use(VueBreadcrumbs)

Vue.component('Auth', Auth)
Vue.component('photo-list', PhotoList)

const router = new VueRouter({
    routes: [
        { path: '/', component: App, meta: { breadcrumb: 'Home Page' } },
        {
            path: '/albums',
            component: Albums,
            meta: { breadcrumb: 'Albums' },
         },
        { path: '/albums/:id', component: Album, meta: { breadcrumb: 'Album' } },
    ],
})

const app = new Vue({
    router,
}).$mount('#app')
