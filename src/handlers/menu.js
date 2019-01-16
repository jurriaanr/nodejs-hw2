import {categories, menuItems} from '../lib/order'

export const handlers = {
    get: async (data, callback) => {
        const menu = categories.reduce((acc, cat) => {
            acc[cat] = menuItems.filter((item) => item.category === cat)
            return acc
        }, {})
        callback(200, menu)
    },
}
