<template>
    <div class="photo-list-component">
        <template v-for="item in partitioned">
            <router-link :to="getItemLink(item)">
                <div class="div-partition" :style="getPartitionCss(item.partition)">
                    <component :is="descriptionComponent" :item="item"></component>
                    <img :src="item.partition.src" :alt="item.title">
                </div>
            </router-link>
        </template>
    </div>
</template>

<script>
    const getSize = require('../get-size')
    const calculateWidth = require('../calculate-width')
    const partitions = require('photo-partition')
    const clone = require('clone')

    const defaultDesiredHeight = 250;
    module.exports = {
        data: () => ({
            width: undefined,
            partitioned: [],
        }),
        props: [
            'items',
            'get-item-link',
            'description-component',
            'desired-height',
        ],
        computed: {
            partitioned: function () {
                console.log('computing partitioned')
                const vkSize = 'x'
                if (!this.width || !this.items.length) {
                    console.log('return')
                    return []
                }
                const previews = this.items
                    .map(item => getSize(item.sizes, vkSize))
                    // .filter(size => size.width !== 0 && size.height !== 0)

                // fall-over for when pictures don't have previews
                previews.forEach((preview) => {
                    if (preview.width === 0 && preview.height === 0) {
                        preview.width = 250;
                        preview.height = 250;
                    }
                })
                console.log(JSON.stringify(previews))
                console.log(this.width)
                const viewports = { [this.width]: this.width }
                console.log(viewports)
                const partitioned = partitions.partitions({
                    [this.width]: this.width
                }, previews, this.desiredHeight || defaultDesiredHeight)[this.width]
                console.log('partitions', partitioned)
                const merged = this.items
                    .map((item, index) => {
                        const partition = partitioned[index]
                        partition.src = getSize(item.sizes, vkSize).src
                        const newItem = clone(item)
                        return Object.assign({}, newItem, { partition }) // deep clone array
                    })
                console.log('merged', merged)
                return merged
            },
        },
        beforeDestroy: function () {
            console.log('before destroy')
            window.removeEventListener('resize', this.handleResize)
        },
        mounted: function () {
            console.log('mounted')
            this.updateWidth()
            window.addEventListener('resize', this.updateWidth)
        },
        methods: {
            getSize: function (item, type) {
                return getSize(item.sizes, type)
            },
            updateWidth: function () {
                this.width = calculateWidth(this.$el)
            },
            getPartitionCss: function (partition) {
                return `width:${partition.width}px; height:${partition.height}px`;
            },
        }
    }
</script>

<style>
    .div-partition {
        position: relative;
        display: inline-block;
        white-space: nowrap;
        vertical-align: top;
    }
    .div-partition > img {
        z-index: 1;
        position: absolute;
        top: 0;
        left: 0;
        padding: 0.1em;
        width: 100%;
        height: 100%;
    }
    .preview {
        max-width: 100px;
        max-height: 100px;
        display: block;
    }
</style>
