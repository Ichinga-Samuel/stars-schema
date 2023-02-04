# stars-schema
***
## A Product Rating Schema Plugin for Mongoose

### Installation
```bash
npm install stars-schema
```

### Usage
***
#### Example
```javascript
import mongoose from 'mongoose'

import {ratings} from 'stars-schema'

const {Schema, model} = mongoose

const ProductSchema = new Schema({
    name: String
})

// creates a ten stars product ratings system. The name of the path is 'stars' rather than the default 'ratings'.
ProductSchema.plugin(ratings, {name: 'stars', levels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]})

// create a model
let product = mongoose.model('Product', ProductSchema)
let prod = product.create({name: "Product One"})

// use the weighted average getter function 
console.log(prod.stars) // 5.5

// get the full ratings without getters
console.log(prod.get('stars', null, {getters: false})) // {1: 1, 2:1, 3:1, 4:1, 5:1, 6:1, 7: 1, 8:1, 9:1, 10:1}

// give a five star rating. 
prod.stars = 5
await prod.save()  // no need to mark as modified

// update the whole ratings object
prod.stars = {1: 1, 2:1, 3:1, 4:1, 5:1, 6:1, 7: 1, 8:1, 9:1, 10:1}

// update from the model
await product.findOneAndUpdate({name: "Product One"}, {stars: {1: 1, 2:1, 3:1, 4:1, 5:1, 6:1, 7: 1, 8:1, 9:1, 10:1}})

// use the increment operator
await product.findOneAndUpdate({name: "Product One"}, {$inc:{['stars.5']: 1}})
```
#### Config Options
- name: string: A name for the path; defaults to *ratings*.
- levels: Array: An array representing the star system in use; defaults to *[1, 2, 3, 4, 5]*.
- getter: Function: A getter function if you don't want to use weighted average.
- setter: Function: A setter function if you don't need the default.
- validate: boolean: To validate or not; default is true.
- validator: Validator: A validator object.
- default: Object: A Default ratings object.