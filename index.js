const express = require("express");
const cors = require("cors");

const app = express();
const port = process.env.PORT ||3000;

app.use(cors());
app.use(express.json());

app.get("/", async(res,req)=>{
    res.json({
        message : "Server Is Connected"
    })
})

app.listen(port, ()=>{
    console.log("server is Running On PORT", port);
})