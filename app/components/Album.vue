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
        <router-link to="./">Photos</router-link>
        <router-link to="comments">Comments</router-link>
        <router-view :aid="aid"></router-view>
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
            }
        },
        created: async function () {
            const res = await ipc.send('getAlbum', { aid: this.aid })
            this.album = res;
        },
        methods: {
            getSize: function(item, size) {
                return getSize(item.sizes, size)
            },
        },
    }
</script>
