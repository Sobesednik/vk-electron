<template>
    <div class="comments">
        <h2>Comments</h2>
        <template v-for="comment in comments">
            <comment :comment="comment" :user="comment.user"></comment>
        </template>
    </div>
</template>

<script>
    const ipc = require('../ipc')
    const comment = require('./Comment.vue')

    module.exports = {
        data: function () {
            return {
                aid: this.$route.params.aid,
                comments: [],
            }
        },
        created: async function () {
            const res = await ipc.send('getComments', { aid: this.aid } )
            this.comments = res;
            console.log('got comments', res)
        },
        components: { comment }
    }
</script>
