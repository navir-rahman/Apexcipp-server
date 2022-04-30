//user assignment11
//pass hCyDZ22co3lvMmPh
const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();

//midelware
app.use(cors())
app.use(express.json());

//conect mongo
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.p6x0e.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   console.log("mongo connected");
//   client.close();
// });

async function run() {
    try {
        await client.connect();
        const data_collection = client.db("assignment11").collection('products');

        //all data
        app.get('/all', async (req, res)=>{

            const query = {};
            const cursor = data_collection.find(query);
            const products=await cursor.toArray();
            res.send(products);
        })

        //single product
        app.get('/item/:id', async( req, res)=>{
            const id = req.params.id;
            console.log(id);
            const query = {_id: ObjectId(id)};
            const item= await data_collection.findOne(query);
            res.send(item)
        })

        //update single item
        app.post('/item/update/:id', async(req, res)=>{
            const id = req.params.id;
            const newquantity = req.body.quantity;
            console.log(newquantity);
            const update = await data_collection.updateOne({_id:ObjectId(id)},{$set:{qun:newquantity}})
            res.send(update);
        })

        //delete single item
        app.delete('/item/delete/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await data_collection.deleteOne(query);
            res.send(result);
        })


    } catch (error) {
        console.dir(error);
    }
}

run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('assignment server working');
});

app.listen(port, () => {
    console.log('Listening to port', port);
})

