<template>
    <div class="vk-avatar">
        <img :src="photo" :alt="name">
    </div>
</template>

<script>
    const ipc = require('../ipc')
    module.exports = {
        props: ['id', 'name'],
        data: () => ({
            photo: undefined,
            first_name: undefined,
            last_name: undefined,
            photo: undefined,
        }),
        computed: {
            name: function () {
                return `${this.first_name} ${this.last_name}`
            },
        },
        created: async function () {
            const user = await ipc.send('getUserPhoto', { id: this.id, size: '50' })
            this.first_name = user.first_name
            this.last_name = user.last_name
            this.photo = user.photo_50
        },
    }
</script>

<style>
    .vk-avatar {
        display: inline-block;
    }
    .vk-avatar img {
        width: 50px;
        height: 50px;
        border-radius: 50%;
    }
</style>
