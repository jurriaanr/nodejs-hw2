/**
 * The default rule to check form field against
 * @param val
 * @returns {boolean}
 */
const defaultRule = val => val.length > 0

/**
 * The value
 * @type {number}
 */
export const NO_VALUE = -100000

/**
 * Check the given value for type and content
 * @param val
 * @param type
 * @param rule
 * @returns {*}
 */
export const getValue = (val, type = 'string', rule = defaultRule) => {
    if (typeof (val) === type) {
        let trimmedVal
        if (type === 'string') {
            trimmedVal = val.trim()
        } else {
            trimmedVal = val
        }

        if (!rule || rule(trimmedVal)) {
            return trimmedVal
        }
    }

    return NO_VALUE
}

/**
 * Map incoming request data to the given fields
 * @param fields
 * @param data
 * @returns {Uint8Array | BigInt64Array | *[] | Float64Array | Int8Array | Float32Array | Int32Array | Uint32Array | Uint8ClampedArray | BigUint64Array | Int16Array | Uint16Array}
 */
export const mapFields = (fields, data) => fields.map((field) => {
    field.value = field.getter(data)
    return field
})

/**
 * Check if all required fields have a value
 * @param fields
 * @returns {boolean}
 */
export const allFieldsHaveValue = (fields) => fields.every(field => !field.required || field.value !== NO_VALUE)

/**
 * Show what required fields are missing their value
 * @param fields
 * @return {*}
 */
export const getMissingFields = (fields) => fields.reduce((acc, field) => {
    if(field.required && field.value === NO_VALUE){
        acc.push(field.name)
    }
    return acc
}, [])

/**
 * Check if at least one of the fields has value
 * @param fields
 * @returns {boolean}
 */
export const someFieldsHaveValue = (fields) => fields.some(field => field.value !== NO_VALUE)

/**
 * The default field type that sets some default values
 * @type {{getter: (function(*): *), name: string, rule: (function(*): boolean), type: string, value: number, required: boolean}}
 */
export const defaultField = {
    name: '',
    value: NO_VALUE,
    type: 'string',
    required: true,
    hidden: false,
    rule: defaultRule,
    getter: function (data) {
        return getValue(data.params[this.name], this.type, this.rule)
    },
}

// General validators

export const addressValidator  = (val) => val.street.length > 0 && val.zip.length && val.city.length