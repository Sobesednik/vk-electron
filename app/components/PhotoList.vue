<template>
    <div>
        <template v-if="partitioned" v-for="item in partitioned">
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
            width: null,
            partitioned: null,
        }),
        props: {
            items: { type: Array },
            getItemLink: { type: Function },
            descriptionComponent: { },
            desiredHeight: { type: Number, default: defaultDesiredHeight },
        },
        computed: {
            partitioned: function () {
                console.log('computing partitioned')
                if (!this.width || !this.items) {
                    return
                }
                // don't partition empty
                if (Array.isArray(this.items) && !this.items.length) {
                    return []
                }
                const vkSize = 'x'
                const previews = this.items
                    .map(item => getSize(item.sizes, vkSize))

                // fall-over for when pictures don't have previews
                previews.forEach((preview) => {
                    if (preview.width === 0 && preview.height === 0) {
                        preview.width = 250;
                        preview.height = 250;
                    }
                })
                const viewports = { [this.width]: this.width }
                console.log(viewports)
                const partitioned = partitions.partitions(viewports, previews, this.desiredHeight)[this.width]

                const merged = this.items
                    .map((item, index) => {
                        const partition = partitioned[index]
                        partition.src = getSize(item.sizes, vkSize).src
                        return Object.assign(clone(item), { partition }) // deep clone array
                    })
                return merged
            },
        },
        beforeDestroy: function () {
            console.log('before destroy')
            window.removeEventListener('resize', this.updateWidth)
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
                return {
                    width: `${partition.width}px`,
                    height: `${partition.height}px`,
                }
            },
        }
    }
</script>

<style scoped>
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
