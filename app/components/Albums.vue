<template>
    <div>
        <h1>Albums</h1>
        <photo-list :items="albums" :get-item-link="getAlbumLink" :description-component="albumOverlay"></photo-list>
    </div>
</template>

<script>
    const ipc = require('../ipc')
    const AlbumOverlay = require('./AlbumOverlay.vue')
    const Vue = require('vue')

    const data = {
        albums: [],
        albumOverlay: AlbumOverlay
    }
    module.exports = {
        data: () => data,
        created: async function () {
            try {
                const res = await ipc.send('getAlbums');
                console.log('got albums', res);
                this.albums = res;
            } catch (err) {
                console.log(err);
            }
        },
        methods: {
            getAlbumLink: function (item) {
                return String(item.aid);
            },
        }
    }
</script>
