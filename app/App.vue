<template>
    <div class="container" id="app">
        <div class="row">
            <div class="col-xs-12" style="margin-bottom: 20px;">
                <a href="/">Home</a>
                <a href="/upload">Upload</a>
                <a href="/users">Users</a>
            </div>
        </div>
        <div class="row">
            <Auth></Auth>
        </div>
    </div>
</template>

<script>
    const { ipcRenderer } = require('electron');

    require("animate.css");
    const noty = require('noty');
    require('bootstrap/dist/css/bootstrap.css');

    ipcRenderer.on('error', (event, message) => {
        console.log(message);
        showError(message);
    });

    function showError(message) {
        noty({
            text: message,
            layout: 'topRight',
            type: 'error',
            timeout: 5000,
            theme: 'relax',
            animation: {
                open: 'animated fadeInDown',
                close: 'animated fadeOut',
            },
        });
    }

    const Auth = require('./components/Auth.vue')

    module.exports = {
        data: () => ({ msg: 123 }),
        components: {
            Auth,
        }
    }
</script>
