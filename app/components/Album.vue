<template>
    <div>
        Album {{ $route.params.aid }}
        <div v-if="album">
            {{ album.aid }}
            {{ album.thumb_id }}
            {{ album.owner_id }}
            {{ album.title }}
            {{ album.description }}
            {{ album.created }}
            {{ album.updated }}
            {{ album.size }}
            {{ album.privacy }}
            {{ album.privacy_view }}
            {{ album.privacy_comment }}
        </div>
        <router-link to="comments">Comments</router-link>
        <router-view></router-view>
        <!--<photo-list :items="photos" :get-item-link="getPhotoLink" desired-height="200"></photo-list>-->
    </div>
</template>

<script>
    const ipc = require('../ipc')
    const getSize = require('../get-size')

    module.exports = {
        data: function () {
            return {
                aid: this.$route.params.aid,
                album: undefined,
                photos: [],
            }
        },
        created: async function () {
            const res = await ipc.send('getAlbum', { aid: this.aid })
            this.album = res;
            // const photos = await ipc.send({ getPhotos: this.album.aid }, 'getPhotos')
            // console.log(`got photos for album ${this.aid}`)
            // this.photos = photos
        },
        methods: {
            getSize: function(item, size) {
                return getSize(item.sizes, size)
            },
            getPhotoLink: function(item) {
                return String(item.pid);
            }
        },
    }
</script>
