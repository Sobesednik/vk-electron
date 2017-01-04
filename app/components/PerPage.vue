<template>
    <div>
        <form class="form-inline" style="display:inline;">
            <label v-if="label" :for="getSelectId()">{{ label }}</label>
            <select :id="getSelectId()" @change="onChange($event.target.value)">
                <option v-for="option in options" :selected="current === option">{{ option }}</option>
            </select>
        </form>
        {{ current }}
    </div>
</template>

<script>
    const ipc = require('../ipc')

    module.exports = {
        data: () => ({
            current: 10,
        }),
        props: {
            options: {
                type: Array,
                default: () => [ 5, 10, 20 ]
            },
            total: Number,
            // current: Number,
            label: { type: String, default: 'per page' },
        },
        methods: {
            getSelectId: function () {
                return `select-${this._uid}`
            },
            onChange: function (value) {
                const val = Number(value)
                this.current = val
                this.$emit('change', val)
            }
        }
    }
</script>

<style>
</style>
