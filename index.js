const dns = require("node:dns")
require('dotenv').config()
console.log("DB_URL is:", process.env.DB_URL)
const express = require('express');
const authcontroller = require("./controller/authcontroller.js");
const middleware = require("./middleware/middleware.js");
const dbconfig = require("./config/dbconfig.js");

dns.setServers(["8.8.8.8" , "1.1.1.1"])
const app = express();
app.use(express.json())

const Port = process.env.PORT || 5000;


dbconfig()

app.get("/", (req, res) => {
  const data = [
      {
    "userId": 1,
    "id": 1,
    "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
    "body": "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto"
  },
  {
    "userId": 1,
    "id": 2,
    "title": "qui est esse",
    "body": "est rerum tempore vitae\nsequi sint nihil reprehenderit dolor beatae ea dolores neque\nfugiat blanditiis voluptate porro vel nihil molestiae ut reiciendis\nqui aperiam non debitis possimus qui neque nisi nulla"
  },
  {
    "userId": 1,
    "id": 3,
    "title": "ea molestias quasi exercitationem repellat qui ipsa sit aut",
    "body": "et iusto sed quo iure\nvoluptatem occaecati omnis eligendi aut ad\nvoluptatem doloribus vel accusantium quis pariatur\nmolestiae porro eius odio et labore et velit aut"
  },
  ]
  res.send(data)
  console.log(data);
  
})


app.get("/alluser" , authcontroller.getUserAll )
app.post("/registration" , authcontroller.registration)

app.listen(Port, ()=>{
    console.log(`server is running on Port : ${Port}`);
    
})
