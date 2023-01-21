import * as assert from "assert"

import {Schema, model, connect} from "mongoose";

import {ratings} from "../esm";


describe('Test Schema', function (){
    let conn;
    let Product;
    this.timeout(100000)
    const uri = `${process.env.MONGODB_URI}`

    before('Initialize', async function(){
        const ProductSchema = new Schema({
            name: {
                type: String,
                unique: true
            }
        })
        ProductSchema.plugin(ratings, {levels:[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5], name: 'star'})
        Product = model('Product', ProductSchema)
        try{
            conn = await connect(uri)
            console.log(`MongoDB connected to ${conn.connection.host} ESM`)
            await Product.deleteMany({name: /Product/})
            await Product.create({name: 'Product One'})
            await Product.create({name: 'Product Two'})
        }
        catch (err){
            console.log(err)
            process.exit(1)
        }

    })

    describe('Test Default Stars',  function (){
        it("Should be 2.75", async function (){
            let prod = await Product.findOne({name: /Product/})
            assert.equal(2.75, prod.star)
        })
    })

    after("Cleanup", async function(){
        await Product.deleteMany({name: /Product/})
        await conn.connection.close()
    })
})

