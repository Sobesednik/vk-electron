// test/component-a.spec.js
var Vue = require('vue')
var ComponentA = require('../app/components/Auth.vue')

describe('auth.vue', () => {
    it('should have correct message', () => {
        // expect(ComponentA.data().msg).toBe('Hello from Component A!')
    })

    it('should render correct message', () => {
        // var vm = new Vue({
        //     template: '<div><test></test></div>',
        //     components: {
        //         'test': ComponentA
        //     }
        // }).$mount()

        // expect(vm.$el.querySelector('h2.red').textContent)
        //     .toBe('Hello from Component A!')
    })
})
