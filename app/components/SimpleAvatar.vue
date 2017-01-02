<template>
    <div class="vk-avatar" :class="classObject">
        <img :src="photo" :alt="name">
    </div>
</template>
<script>
    module.exports = {
        data: () => ({
            radius: 50
        }),
        computed: {
            classObject: function () {
                return {
                    width: this.radius + 'px',
                    height: this.radius + 'px',
                    'border-radius': '50%',
                }
            },
        },
        props: [ 'photo', 'name' ]
    }
</script>
