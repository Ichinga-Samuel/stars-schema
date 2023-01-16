import assert from "assert";
import mongoose from 'mongoose'

import {ratings} from "./ratings.js";


describe("Test Schema", function(){
    this.timeout(1000000)
    let conn
    let productName = "Test Product One"
    let productTwo = "Test Product Two"
    let product
    before(async function(){
        conn = mongoose.connect(`mongodb+srv://IchingSamuel:${encodeURIComponent("OJ0mIrCE4hpUS0b5")}@cluster0.ijhjj.gcp.mongodb.net/?retryWrites=true'`, {useNewUrlParser: true, useFindAndModify: false})
        conn.then(conn => console.log(`MongoDb connected: ${conn.connection.host}`)).catch(err => {console.error(err); process.exit(1);})
        const ProductSchema = new mongoose.Schema({
            name: {
                type: String,
                unique: true
            }
        }, {toObject:{getters: true, }, toJSON:{getters: true}})
        ProductSchema.plugin(ratings, {name: "stars"})
        product =  mongoose.model('Product', ProductSchema)
        await product.create({name: productName})
        await product.create({name: productTwo})
    })

    describe("Check Default Ratings", async function(){
        let prod
        before("Find Product", async function (){
            prod = await product.findOne({name: productName})
        })
        it("should be 3 star ratings", async function(){
            assert.equal(3, prod.stars);

        })
        it("should be an object", async function(){
            let stars = prod.get('stars', null, {getters: false})
            assert.equal(JSON.stringify(stars), JSON.stringify({1: 1, 2: 1, 3:1, 4:1, 5:1}))
        })
    })

    describe("Update Individual Star Levels", function (){
        let star

        before("Update Star Level By One", async function(){
            let prod = await product.findOneAndUpdate({name: productName}, {$inc: {'stars.3': 1}}, {new: true})
            prod.stars = 5
            prod.save()
            star = prod.get('stars', null, {getters: false})
        })

        it("should have 3 three stars rating", function (){
            assert.equal(2, star['3'])
        })

        it("should have 2 five stars rating", function (){
            assert.equal(2, star['5'])
        })
    })

    describe("Update The Whole Stars Object", function(){
        let prod
        let prod2
        let stars1 = {1:5, 2:5, 3:5, 4:5, 5:5}
        let stars2 = {1:1, 2:2, 3:3, 4:4, 5:5}

        before('Find The Product', async function(){
            prod = await product.findOne({name: productName})
            prod2 = await product.findOne({name: productTwo})
            await prod.updateOne({stars: stars1}, {runValidators: true})
            prod2.stars = stars2
            prod2.save()
        })

        it('should replace the whole stars object', async function(){
            let prod = await product.findOne({name: productTwo})
            prod = prod.get('stars', null, {getters: false})
            assert.equal(JSON.stringify(stars2), JSON.stringify(prod))
        })

        it('should replace the whole stars object using update query', async function(){
            let prod = await product.findOne({name: productName})
            prod = prod.get('stars', null, {getters: false})
            assert.equal(JSON.stringify(stars1), JSON.stringify(prod))
        })
    })

    after('Close Connection', async function(){
        await product.deleteMany({name: /Test/})
        conn.then(conn => conn.connection.client.close())
    })


})
