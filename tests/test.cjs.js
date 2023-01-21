const assert = require('assert')

const mongoose = require('mongoose')

const ratings = require('../cjs/ratings')


describe('Test Schema', function (){
    let Product;
    this.timeout(100000)
    const uri = `${process.env.MONGODB_URI}`

    before('Initialize', function(done){
        const ProductSchema = new mongoose.Schema({
            name: {
                type: String,
                unique: true
            }
        })

        ProductSchema.plugin(ratings, {levels:[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]})
        Product = mongoose.model('Product', ProductSchema)

        mongoose.connect(uri, function(err){
            if(err){console.log(err); process.exit(1)}
            console.log(`Mongodb connected on ${mongoose.connection.host}`)
            let prod1 = new Product({name: 'Product One'})
            let prod2 = new Product({name: 'Product Two'})

            prod1.save(function (err){
                if(err) console.log('prod1')
                    prod2.save(function (err){
                        if(err) console.log('cant save')
                        done()
                    })
                })
        })
    })

    describe('Test Default Stars', function (){
        it("Should be 5.5", function (done){
            Product.findOne({name: /Product/}, function(err, prod){
                assert.equal(5.5, prod.ratings)
                done()
            })
        })
    })

    after("Cleanup", function (done){
        Product.deleteMany({name: /Product/}, function (err){
            if(err) console.log(err)
            mongoose.connection.client.close(function (err){
                if(err) console.log(err)
                done()
            })
        })
    })
})

