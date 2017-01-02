<template>
    <img :src="photo" :alt="name" :style="styleObject">
</template>

<script>
    module.exports = {
        data: () => ({
            radius: 50
        }),
        computed: {
            styleObject: function () {
                return {
                    width: `${this.radius}px`,
                    height: `${this.radius}px`,
                    'border-radius': '50%',
                }
            },
        },
        props: [ 'photo', 'name' ]
    }
</script>
