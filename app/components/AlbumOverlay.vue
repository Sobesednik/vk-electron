<template>
    <div class="partition-table">
        <p class="p-partition">{{ item.title }} <span class="a-count">{{ item.size }}</span></p>
    </div>
</template>

<script>
    module.exports = {
        props: [ 'item' ],
    }
</script>

<style>
    .partition-table {
        display: none;
        background-color: rgba(255,255,255,0.5);
        position: relative;
        z-index: 3;
        width: 100%;
        height: 100%;
    }
    .p-partition {
        display: table-cell;
        vertical-align: middle;
        font-family: 'PT Sans Narrow', sans-serif;
        color: #333;
        white-space: normal;
        background-color: rgba(255,255,255,0.5);
        background-clip: content-box;
        box-shadow: inset 0px 0px 0px 0.25em rgba(255,255,255,0.5);

        font-size: 2em;
        text-align: center;
        padding: 0.25em;
    }
    .div-partition:hover > .partition-table {
        display: table;
    }
    .a-count {
        font-family: 'Cookie', cursive;
    }
</style>
