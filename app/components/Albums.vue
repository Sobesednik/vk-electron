<template>
    <div>
        <h1>Albums</h1>
        <spinner v-if="!albums"></spinner>
        <photo-list v-else :items="albums" :get-item-link="getAlbumLink" :description-component="albumOverlay"></photo-list>
    </div>
</template>

<script>
    const ipc = require('../ipc')
    const AlbumOverlay = require('./AlbumOverlay.vue')
    const Vue = require('vue')

    module.exports = {
        data: () => ({
            albums: undefined,
            albumOverlay: AlbumOverlay,
        }),
        created: async function () {
            try {
                const res = await ipc.send('getAlbums');
                console.log('Albums', res);
                this.albums = res;
            } catch (err) {
                console.log(err);
            }
        },
        methods: {
            getAlbumLink: function (item) {
                return `/albums/${item.aid}/`;
            },
        }
    }
</script>
