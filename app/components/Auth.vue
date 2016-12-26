<template>
    <div id="vk-auth" class="col-xs-12">
        <div v-if="user" class="vk-profile">
            <img v-bind:src="photo" v-bind:alt="name">
            <span>{{ name }}</span>
        </div>
        <button v-bind:disabled="loading" v-if="!user" class="btn btn-sm btn-primary" v-on:click="signin">Login VK</button>
        <button v-bind:disabled="loading" v-if="user" class="btn btn-sm btn-primary" v-on:click="signout">Logout VK</button>
    </div>
</template>

<script>
    const ipc = require('../ipc');

    const data = {
        loading: false,
        user: null,
    }

    module.exports = {
        data: () => data,
        computed: {
            name: function () {
                return this.user ? `${this.user.first_name} ${this.user.last_name}` : undefined;
            },
            photo: function () {
                return this.user && 'photo' in this.user ? this.user.photo : undefined;
            }
        },
        created: async function () {
            this.loading = true;
            try {
                const res = await ipc.send('authVK', 'loginVK');
                console.log(res);
                this.user = res;
            } catch (err) {
                console.log(err);
            }
            this.loading = false;
        },
        methods: {
            signin: async function () {
                this.loading = true;
                try {
                    const res = await ipc.send('loginVK');
                    console.log(res);
                    this.user = res;
                } catch (err) {
                    console.log(err);
                }
                this.loading = false;
            },
            signout: async function () {
                this.loading = true;
                try {
                    const res = await ipc.send('logout');
                    this.user = null;
                } catch (err) {
                    console.log(err);
                }
                this.loading = false;
            },
        },
    }
</script>

<style>
    .vk-profile img {
        width: 28px;
        height: 28px;
        border-radius: 50%;
    }
    .vk-profile {
        display: inline-block;
    }
</style>
