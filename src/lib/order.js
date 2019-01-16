export const pizzaChoices = {'Small': -100, 'Medium': 0, 'Large':100}
export const pastaChoices = {'Spaghetti': 0, 'Penne': 0, 'Tortellini': 100}

export const categories = ['pizza', 'pasta', 'beverage', 'dessert']
export const menuItems = [
    {
        id: 1001,
        category: 'pizza',
        name: 'Pizza Margherita  ',
        price: 745,
        ingredients: ['tomato', 'cheese'],
        choices: pizzaChoices
    },
    {
        id: 1002,
        category: 'pizza',
        name: 'Pizza Cipolla',
        price: 795,
        ingredients: ['tomato', 'cheese', 'union'],
        choices: pizzaChoices
    },
    {
        id: 1003,
        category: 'pizza',
        name: 'Pizza Pineapple',
        price: 850,
        ingredients: ['tomato', 'cheese', 'pineapple'],
        choices: pizzaChoices
    },
    {
        id: 1004,
        category: 'pizza',
        name: 'Pizza Banko',
        price: 895,
        ingredients: ['tomato', 'cheese', 'paprika', 'garlic', 'capers'],
        choices: pizzaChoices
    },
    {
        id: 1005,
        category: 'pizza',
        name: 'Pizza Napoletana',
        price: 895,
        ingredients: ['tomato', 'cheese', 'anchovies'],
        choices: pizzaChoices
    },
    {
        id: 1007,
        category: 'pizza',
        name: 'Pizza Mozarella',
        price: 895,
        ingredients: ['tomato', 'mozarella', 'pesto'],
        choices: pizzaChoices
    },
    {
        id: 1006,
        category: 'pizza',
        name: 'Pizza Choriza',
        price: 950,
        ingredients: ['tomato', 'cheese', 'chorizo', 'salami'],
        choices: pizzaChoices
    },
    {
        id: 1008,
        category: 'pizza',
        name: 'Pizza Hawaii',
        price: 990,
        ingredients: ['tomato', 'cheese', 'pineapple', 'ham'],
        choices: pizzaChoices
    },
    {
        id: 2001,
        category: 'pasta',
        name: 'Aglio e olio',
        price: 675,
        ingredients: ['oil', 'garlic', 'parsley', 'union', 'paprika'],
        choices: pastaChoices
    },
    {id: 2002, category: 'pasta', name: 'Napolitana', price: '795', ingredients: ['tomato'], choices: pastaChoices},
    {
        id: 2003,
        category: 'pasta',
        name: 'All \'arrabbiata',
        price: 895,
        ingredients: ['tomato', 'hot peppers'],
        choices: pastaChoices
    },
    {
        id: 2004,
        category: 'pasta',
        name: 'Bolognese',
        price: 920,
        ingredients: ['tomato', 'minced meat'],
        choices: pastaChoices
    },
    {
        id: 2005,
        category: 'pasta',
        name: 'Al tonno',
        price: 950,
        ingredients: ['tomato', 'tuna', 'coconut cream'],
        choices: pastaChoices
    },
    {
        id: 2006,
        category: 'pasta',
        name: 'Carbonara',
        price: 950,
        ingredients: ['tomato', 'bacon', 'union', 'egg yolk', 'cheese', 'cream sauce'],
        choices: pastaChoices
    },
    {id: 8001, category: 'beverage', name: 'Cola', price: 200},
    {id: 8002, category: 'beverage', name: 'Fanta', price: 200},
    {id: 8003, category: 'beverage', name: '7-up', price: 200},
    {id: 8004, category: 'beverage', name: 'Beer', price: 275},
    {id: 8005, category: 'beverage', name: 'White wine', price: 1250},
    {id: 8006, category: 'beverage', name: 'Red wine', price: 1250},
    {id: 9001, category: 'dessert', name: 'Tiramisu', price: 675},
    {id: 9002, category: 'dessert', name: 'Cannoli', price: 450},
    {id: 9003, category: 'dessert', name: 'Gelato', price: 450},
]

/**
 * Calculate the total price of the order
 * @param order
 * @returns {*}
 */
export const calculateTotal = (order) => order.items.reduce((acc, item) => {
    const menuItem = getMenuItem(item.id)
    acc += menuItem.price

    if(item.choice) {
        acc += menuItem.choices[item.choice]
    }

    return acc
}, 0)

/**
 * Validate the items in an order
 * @param val
 * @returns {boolean}
 */
export const itemsValidator = (val) => val.every((item) => {
    const menuItem = getMenuItem(item.id)

    if (menuItem) {
        // if there was no valid choice (not set or invalid value)
        if (menuItem.category === 'pizza' || menuItem.category === 'pasta') {
            if(!item.choice || !menuItem.choices.hasOwnProperty(item.choice)){
                return false
            }
        }

        // at least 1 item
        return item.quantity > 0
    }

    return false
})

/**
 * Get a single menu item by id
 * @param id
 * @returns {*}
 */
export const getMenuItem = (id) => menuItems.find((menuItem) => menuItem.id === id)