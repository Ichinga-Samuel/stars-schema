import mongoose from 'mongoose'


function isPlainObject(o) {
    return Object(o) === o && Object.getPrototypeOf(o) === Object.prototype;
}

function weightedAverage(ratings) {
    let items = Object.entries(ratings)
    let [sum, total] = [0, 0]
    for (let [key, value] of items) {
        total += value
        sum += value * parseFloat(key)
    }
    return sum / total
}

export function ratings(schema, options={}){
    options = {levels: [1, 2, 3, 4, 5], name: 'ratings', validate: true, ...options}
    let levels = options.levels
    let obj = {}
    let defaults = {}
    levels.map(i => {obj[i] = "number"; defaults[i] = 1})
    let name = options.name
    function isValid(rating){
        const add = (a, b) => a + b
        if(rating instanceof Number){
            return levels.includes(rating)
        }
        else if(isPlainObject(rating)){
            return levels.reduce(add) === Object.keys(rating).map(i => Number(i)).reduce(add)
        }
        else{return false}
    }

    function set(ratings){
        if (isPlainObject(ratings)) {
            return ratings
        }
        this.get(name, null, {getters: false})[ratings] = 1 + parseInt(this.get(name, null, {getters: false})[ratings])
        return this.get(name, null, {getters: false})
    }

    let doValidate = {
        validator: isValid,
        message: "Invalid ratings level"
    }
    let noValidate = {
        validator: function (ratings){return true}
    }

    let validate = options.validate ? options.validator || doValidate : noValidate

    const ratingsSchema = new mongoose.Schema(
        {
            [name]: {
                type: mongoose.Mixed,
                ...obj,
                get: options.getter || weightedAverage,
                set: options.setter || set,
                default: options.default || defaults,
                validate: validate
            }
        }, {toObject:{getters: true, }, toJSON:{getters: true}})

    schema.pre('save', function (next){
        this.markModified(name)
        next()
    })
    schema.add(ratingsSchema)
}