<template>
    <div>
        <h2>Comments</h2>
        <spinner v-if="!comments"></spinner>
        <template v-else v-for="comment in comments">
            <comment :comment="comment" :user="comment.user"></comment>
        </template>
    </div>
</template>

<script>
    const ipc = require('../ipc')
    const comment = require('./Comment.vue')

    module.exports = {
        data: () => ({
            comments: undefined,
        }),
        props: [ 'aid' ],
        created: async function () {
            this.comments = await ipc.send('getComments', { aid: this.aid } )
        },
        components: { comment }
    }
</script>
