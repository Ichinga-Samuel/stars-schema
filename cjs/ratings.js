"use strict";
const mongoose = require("mongoose")


function isPlainObject(o) {
    return Object(o) === o && Object.getPrototypeOf(o) === Object.prototype;
}


function weightedAverage(ratings) {
    let items = Object.entries(ratings);
    let [sum, total] = [0, 0];
    for (let [key, value] of items) {
        total += value;
        sum += value * parseFloat(key);
    }
    return sum / total;
}


function setter(ratings){
    if (isPlainObject(ratings)){return ratings}
    if(typeof ratings === "number" && this instanceof mongoose.Document){
        this.get(name, null, {getters: false})[ratings] = 1 + parseInt(this.get(name, null, {getters: false})[ratings])
        return this.get(name, null, {getters: false})
    }
}


function ratings(schema, options) {
    let config = { levels: [1, 2, 3, 4, 5], name: 'ratings', validate: true, ...options}
    let levels = config.levels
    let ratings = {};
    let default_ = {};
    levels.map(i => { ratings[i] = i; default_[i] = 1; });
    default_ = config.default || default_;
    let name = config.name;

    function isValid(rating){
        const add = (a, b) => a + b;
        if (typeof rating === 'number') {
            return levels.includes(rating);
        }
        else if (isPlainObject(rating)) {
            return levels.reduce(add) === Object.keys(rating).map(i => Number(i)).reduce(add);
        }
        else {
            return false;
        }
    }

    let doValidate = {
        validator: isValid,
        message: "Invalid ratings level"
    };

    let noValidate = {
        validator: function (ratings) { return true; }
    };

    let validate = config.validate ? config.validator || doValidate : noValidate;

    const ratingsSchema = new mongoose.Schema({
        [name]: {
            type: mongoose.Schema.Types.Mixed,
            ...ratings,
            get: config.getter || weightedAverage,
            set: config.setter || setter,
            default: default_,
            validate: validate
        }
    }, { toObject: { getters: true, }, toJSON: { getters: true } });

    ratingsSchema.pre('save', function (next) {
        if (name in this.modifiedPaths) {
            this.markModified(name);
        }
        next();
    });
    schema.add(ratingsSchema);
}


module.exports = {ratings}
