<template>
    <div class="comment">
        <div class="table-avatar inline">
            <simple-avatar :photo="photo" :name="full_name">
            </simple-avatar>
        </div>
        <div class="table-meta inline">
            <p class="meta">
                <span class="user-name">{{ full_name }}</span>
                <span class="date">{{ cdate }}</span>
            </p>
            <p class="comment" v-html="comment.message"></p>
        </div>
    </div>
</template>
<script>
    module.exports = {
        computed: {
            full_name: function () {
                return `${this.user.first_name} ${this.user.last_name}`
            },
            photo: function () {
                return this.user.photo_50
            },
            cdate: function () {
                return new Date(this.comment.date * 1000).toUTCString();
            }
        },
        props: [ 'comment', 'user'],
    }
</script>
<style>
    div.comment {
        padding: 0.5em;
        display: table;
        width: 100%;
    }
    div.comment > div.table-avatar {
        display: table-cell;
        width: 60px;
    }
    div.comment > div.table-meta {
        display: table-cell;
    }

    p.meta, p.comment {
        margin: 0;
    }
    span.user-name {
        font-weight: 500;
    }
    div.inline {
        display: inline-block;
        vertical-align: top;
    }
    div.comment:hover {
        background-color: rgba(51, 122, 183, 0.1);
        border-radius: 0.5em;
    }
    span.date {
        font-style: italic;
    }
</style>
