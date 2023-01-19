import {Schema, ValidateOpts, Document, Query} from 'mongoose'


function isPlainObject(o: Object): boolean{
    return Object(o) === o && Object.getPrototypeOf(o) === Object.prototype;
}

export type stars = {[key: number | string]: number}

function weightedAverage(ratings: stars): number{
    let items: Array<[string, number]> = Object.entries(ratings)
    let [sum, total]: Array<number> = [0, 0]
    for (let [key, value] of items) {
        total += value
        sum += value * parseFloat(key)
    }
    return sum / total
}

export interface Config{
    levels?: Array<number>,
    name?: string,
    validate?: boolean
    default?: stars,
    getter?(field: stars): number,
    setter?(value: number | stars): stars
    validator?: ValidateOpts<stars | number>
}


export function ratings(schema: Schema, options: Config){
    let config = {levels: [1, 2, 3, 4, 5], name: 'ratings', validate: true, ...options}
    let levels = config.levels
    let ratings: stars = {}
    let default_: stars = {}
    levels.map(i => {ratings[i] = i; default_[i] = 1})
    default_ = config.default || default_
    let name: string = config.name

    function isValid(rating: number | stars){
        const add = (a: number, b: number) => a + b
        if(typeof rating === 'number'){
            return levels.includes(rating)
        }
        else if(isPlainObject(rating)){
            return levels.reduce(add) === Object.keys(rating).map(i => Number(i)).reduce(add)
        }
        else{return false}
    }

    let doValidate = {
        validator: isValid,
        message: "Invalid ratings level"
    }
    let noValidate = {
        validator: function (ratings: stars){return true}
    }

    let validate = config.validate ? config.validator || doValidate : noValidate

    const ratingsSchema = new Schema(
        {
            [name]: {
                type: Schema.Types.Mixed,
                ...ratings,
                get: config.getter || weightedAverage,
                set: config.setter || function(this: Document | Query<any, any>, ratings: stars|number){
                        if (isPlainObject(ratings)){return ratings}
                        if(typeof ratings === "number" && this instanceof Document){
                            this.get(name, null, {getters: false})[ratings] = 1 + parseInt(this.get(name, null, {getters: false})[ratings])
                            return this.get(name, null, {getters: false})
                        }
                        },
                default: default_,
                validate: validate
            }
        }, {toObject:{getters: true, }, toJSON:{getters: true}})

    ratingsSchema.pre('save', function (this: Document, next){
        if(name in this.modifiedPaths){this.markModified(name)}
        next()
    })

    schema.add(ratingsSchema)
}