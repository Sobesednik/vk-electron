<template>
    <div>
        <h1>Albums</h1>
        <spinner v-if="!albums"></spinner>
        <div v-else>
            <!--<per-page :total="50" :current="10" label="Per page:"></per-page>-->
            <photo-list :items="albums" :get-item-link="getAlbumLink" :description-component="albumOverlay"></photo-list>
        </div>
    </div>
</template>

<script>
    const ipc = require('../ipc')
    const AlbumOverlay = require('./AlbumOverlay.vue')
    const PerPage = require('./PerPage.vue')

    module.exports = {
        data: function () {
            return {
                page: String(this.$route.params.page) || 1,
                albums: undefined,
                albumOverlay: AlbumOverlay,
                albumsCount: undefined,
            }
        },
        created: async function () {
            this.albumsCount = await ipc.send('getAlbumsCount')
            const res = await ipc.send('getAlbums');
            console.log('Albums', res);
            this.albums = res;
        },
        methods: {
            getAlbumLink: function (item) {
                return `/album/${item.aid}/photos/`;
            },
        },
        components: {
            PerPage,
        }
    }
</script>
