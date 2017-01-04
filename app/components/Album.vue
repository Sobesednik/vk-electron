<template>
    <div>
        <h1> Album {{ $route.params.aid }} </h1>
        <router-link :to="`/album/${aid}`">Photos</router-link>
        <router-link :to="`/album/${aid}/comments`">Comments</router-link>
        <spinner v-if="!album"></spinner>
        <div v-else>
            <p class="album-info">
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
            </p>
            <router-view :aid="aid" :page="page" :total="album.size"></router-view>
        </div>
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
        computed: {
            page: function () {
                return Number(this.$route.params.page) || 1
            }
        },
        methods: {
            getSize: function(item, size) {
                return getSize(item.sizes, size)
            },
        },
    }
</script>
