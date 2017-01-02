const debug = require('debug')('app:api')

async function onAsyncMessage(event, message) {
    debug('async message', message)
    if (!message.mid) {
        return
    }
    const mid = message.mid
    const reply = event.sender.send.bind(event.sender, mid)

    try {
        const data = message.data

        if (message.method === 'authVK') {
            const vkAuthUser = await this.vkAuthFlow()
            debug('authVK', vkAuthUser)
            return reply(vkAuthUser);
        }

        if (message.method === 'loginVK') {
            const user = await this.loginVK()
            debug('user after login', user)
            return reply(user)
        }

        if (message.method === 'logout') {
            const res = await this.logout()
            debug('logout', res)
            return reply(res)
        }

        if (message.method === 'getAlbums') {
            const albums = await this.getAlbums()
            debug('albums', albums)
            return reply(albums)
        }

        if (message.method === 'getAlbum') {
            const aid = parseInt(data.aid, 10)
            const albums = await this.vk.getAlbum(aid)
            const album = albums.filter(a => a.aid === aid)
            if (!album.length) {
                throw new Error('Album not found')
            }
            debug('album', album)
            return reply(album[0])
        }

        if (message.method === 'getComments') {
            const aid = parseInt(data.aid, 10)
            const comments = await this.vk.getComments(aid)
            const userIds = comments
                .map(comment => comment.from_id)
                .filter((id, index, array) => index === array.indexOf(id))

            const users = await this.vk.getUserPhoto(userIds)
            const usersObject = users.reduce((acc, user) => {
                acc[user.uid] = user
                return acc
            }, {})

            comments.forEach((comment) => {
                comment.user = usersObject[comment.from_id]
            })

            debug('comments', comments)
            return reply(comments)
        }

        if (message.method === 'getUserPhoto') {
            const id = data.id
            const size = data.size
            const res = await this.vk.getUserPhoto(id, size)
            const userPhoto = res[0]
            debug('photo', userPhoto)
            return reply(userPhoto)
        }

        throw new Error('Method not found');
    } catch (err) {
        console.error(err)
        reply({ error: err.message })
    }
}

module.exports = onAsyncMessage
