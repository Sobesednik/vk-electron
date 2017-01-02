<template>
    <div>
        <h2>Photos</h2>
        <photo-list :items="photos" :get-item-link="getPhotoLink" :desired-height="desiredHeight"></photo-list>
    </div>
</template>
<script>
    const PhotoList = require('./PhotoList.vue')
    const ipc = require('../ipc')

    module.exports = {
        data: () => ({
            desiredHeight: 200,
            photos: undefined,
        }),
        props: [ 'aid' ],
        methods: {
            getPhotoLink: function(item) {
                return String(item.pid);
            }
        },
        created: async function () {
            const photos = await ipc.send('getPhotos', { aid: this.aid } )
            console.log(`got photos for album ${this.aid}`, photos)
            this.photos = photos
        },
        components: {
            photoList: PhotoList,
        },
    }
</script>
