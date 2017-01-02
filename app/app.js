require('bootstrap/dist/css/bootstrap.css');

const Vue = require('vue')
const App = require('./App.vue')
const Auth = require('./components/Auth.vue')
const PhotoList = require('./components/PhotoList.vue')

const VueRouter = require('vue-router')
const VueBreadcrumbs = require('vue2-breadcrumbs')

const Albums = require('./components/Albums.vue')
const Album = require('./components/Album.vue')
const Comments = require('./components/Comments.vue')
const SimpleAvatar = require('./components/SimpleAvatar.vue')
const AlbumPhotoList = require('./components/AlbumPhotoList.vue')
const Spinner = require('./components/Spinner.vue')

Vue.use(VueRouter)
Vue.use(VueBreadcrumbs)

Vue.component('auth', Auth)
Vue.component('photo-list', PhotoList)
Vue.component('simple-avatar', SimpleAvatar)
Vue.component('spinner', Spinner)

const router = new VueRouter({
    routes: [
        { path: '/', component: App, meta: { breadcrumb: 'Home Page' } },
        {
            path: '/albums',
            component: Albums,
            meta: { breadcrumb: 'Albums' },
         },
        {
            path: '/albums/:aid',
            component: Album,
            children: [
                {
                    path: '/',
                    component: AlbumPhotoList,
                },
                {
                    path: 'comments',
                    component: Comments
                }
            ]
        },
    ],
})

const app = new Vue({
    router,
}).$mount('#app')
