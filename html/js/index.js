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

function login() {
    ipcRenderer.send('asynchronous-message', 'loginVK');
}
function auth() {
    ipcRenderer.send('asynchronous-message', 'authVK');
}
function logout() {
    ipcRenderer.send('asynchronous-message', 'logout');
}

ipcRenderer.on('authVK', (event, message) => {
    $('#login-vk-button').hide();
    $('#logout-vk-button').show();
    const div = createVkProfileDiv(`${message.first_name} ${message.last_name}`, message.photo);
    $('#vk-auth').prepend(div);
});
ipcRenderer.on('logout', (event, message) => {
    $('#login-vk-button').show();
    $('#logout-vk-button').hide();
    $('#vk-auth .vk-profile').remove();
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

auth();
