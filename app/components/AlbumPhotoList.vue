<template>
    <div>
        <h2>Photos {{ page }}</h2>
        <spinner v-if="loading"></spinner>
        <div v-else>
            <photo-list :items="photos" :get-item-link="getPhotoLink" :desired-height="desiredHeight"></photo-list>
        </div>
        <div style="width: 100%; text-align: center;">
            <pagination  :page="page" :pages="totalPages" @change="onPageChange" :pageFn="pageFn"></pagination>
        </div>
    </div>
</template>
<script>
    const PhotoList = require('./PhotoList.vue')
    const ipc = require('../ipc')

    module.exports = {
        data: () => ({
            loading: false,
            desiredHeight: 200,
            photos: null,
            count: 10,
        }),
        props: [ 'aid', 'page', 'total' ],
        computed: {
            totalPages: function () {
                return Math.ceil(this.total / this.count)
            },
        },
        watch: {
            page: function (newPage) {
                this.fetchData()
            }
        },
        methods: {
            pageFn: function (page) {
                return `./${page}`
            },
            getPhotoLink: function(item) {
                return String(item.pid)
            },
            onPageChange: function (page) {
                this.$router.push(this.pageFn(page))
            },
            fetchData: async function() {
                this.photos = null
                this.loading = true

                const offset = (this.page - 1) * this.count
                const count = this.count
                const photos = await ipc.send('getPhotos', {
                    offset,
                    count,
                    aid: this.aid,
                })
                console.log(`got photos for album ${this.aid}`, photos)
                this.loading = false
                this.photos = photos
            },
            handleKeyUp: function (event) {
                console.log('keyup', event)
                if (event.keyCode === 39 && this.page < this.totalPages) {
                    this.$router.push(this.pageFn(this.page + 1))
                }
                if (event.keyCode === 37 && this.page > 1) {
                    this.$router.push(this.pageFn(this.page - 1))
                }
            },
        },
        created: function () {
            this.fetchData()
            // window.addEventListener('keyup', this.handleKeyUp)
        },
        beforeDestroy: function () {
            // window.removeEventListener('keyup', this.handleKeyUp)
        },
        components: {
            PhotoList,
        },
    }
</script>
