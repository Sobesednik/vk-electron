<template>
    <div class="comments">
        <h2>Comments</h2>
        {{ aid }}
        <p v-for="comment in comments">
            {{ comment.from_id }}
            {{ comment.message }}
        </p>
    </div>
</template>

<script>
    const ipc = require('../ipc')

    module.exports = {
        data: function () {
            return {
                aid: this.$route.params.aid,
                comments: [],
            }
        },
        created: async function () {
            const res = await ipc.send({ getComments: { aid: this.aid } }, 'getComments')
            this.comments = res;
            console.log('got comments', res)
        }
    }
</script>

<style>
</style>
