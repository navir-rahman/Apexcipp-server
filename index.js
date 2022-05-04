const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const jwt= require('jsonwebtoken')
const app = express();

//midelware
app.use(cors())
app.use(express.json());


//jwt function
function varifyjwt(req,res, next){
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify (token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        //console.log('decoded', decoded);
        req.decoded = decoded;
        next();
    })
}

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
        const user_collection = client.db("assignment11").collection('userProducts');


        //authentication
        app.post('/login', async(req,res)=>{
            const user= req.body;
            const access_token= jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,{
                expiresIn: '30d'
            });
            res.send({access_token})
        })
        //all data
        app.get('/all', async (req, res)=>{
            const query = {};
            const cursor = data_collection.find(query);
            const products=await cursor.toArray();
            res.send(products);
        })
        //all data
        app.get('/sixInfo', async (req, res)=>{
            const query = {};
            const cursor = data_collection.find(query).limit(6);
            const products=await cursor.toArray();
            res.send(products);
        })

        //single product
        app.get('/item/:id', async( req, res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const item= await data_collection.findOne(query);
            res.send(item)
        })

        //update single item
        app.post('/item/update/:id', async(req, res)=>{
            const id = req.params.id;
            const newquantity = req.body.quantity;
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


        //update user item
        app.post('/item/userupdate/:id', async(req, res)=>{
            const id = req.params.id;
            const newquantity = req.body.quantity;
            const update = await user_collection.updateOne({_id:ObjectId(id)},{$set:{qun:newquantity}})
            res.send(update);
        })

        //delete user item
        app.delete('/useritem/delete/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await user_collection.deleteOne(query);
            res.send(result);
        })

        //add data
        app.post('/additem', async(req, res)=>{
            const newItem = req.body;
             const result = await data_collection.insertOne(newItem);
             res.send(result);
        })
        //add my item
        app.post('/addmyitem', async(req, res)=>{
            const newItem = req.body;
             const result = await user_collection.insertOne(newItem);
             res.send(result);
        })

        // user data collection

        app.get('/alluseritem', varifyjwt, async(req, res)=>{
            const decodedEmail = req.decoded?.email;
            const email = req.query.email;
            console.log('line 112', email,decodedEmail);
             if(email === decodedEmail){
                const query = {email: email};
                const cursor= user_collection.find(query);
                const item= await cursor.toArray();
                res.send(item)
            }else{
                res.status(403).send({message: 'forbidden access'})
            }
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

