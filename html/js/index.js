const {ipcRenderer} = require('electron');

function showError(message) {
    const n = noty({
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

function loaded() {
    $('#div-loading').remove();
    $('#div-loaded').show();
}

function login() {
    ipcRenderer.send('asynchronous-message', 'login');
}
function logout() {
    ipcRenderer.send('asynchronous-message', 'logout');
}

ipcRenderer.on('vkUser', (event, message) => {
    $('#login-vk-button').hide();
    $('#logout-vk-button').show();
    $('#vk-name').html(`${message.first_name} ${message.last_name}`);
    getAlbums();
});
ipcRenderer.on('logout', (event, message) => {
    $('#login-vk-button').show();
    $('#logout-vk-button').hide();
    $('#vk-name').html('');
});

$('#login-vk-button').click(function () {
    login();
});
$('#logout-vk-button').click(function () {
    logout();
});

ipcRenderer.on('error', (event, message) => {
    console.log(message);
    showError(message);
});

ipcRenderer.on('loaded', () => {
    loaded();
});

function getAlbums() {
    ipcRenderer.send('asynchronous-message', 'getAlbums');
}

ipcRenderer.on('albums', (event, message) => {
     console.log(message);
});
