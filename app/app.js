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
const Pagination = require('vue-bootstrap-paginator')

Vue.use(VueRouter)
Vue.use(VueBreadcrumbs)

Vue.component('auth', Auth)
Vue.component('photo-list', PhotoList)
Vue.component('simple-avatar', SimpleAvatar)
Vue.component('spinner', Spinner)
Vue.component('pagination', Pagination)

const router = new VueRouter({
    routes: [
        { path: '/', component: App },
        { path: '/album/:aid', redirect: '/album/:aid/photos/' },
        {
            path: '/albums/:page?',
            component: Albums,
        },
        {
            path: '/album/:aid',
            component: Album,
            children: [
                {
                    path: 'photos/:page?',
                    component: AlbumPhotoList,
                },
                {
                    path: 'comments',
                    component: Comments
                },
            ],
        },
    ],
})

const app = new Vue({
    router,
}).$mount('#app')
