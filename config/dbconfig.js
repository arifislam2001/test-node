const mongoose = require("mongoose")
const db_url = process.env.DB_URL

const dbconfig = ()=>{
    mongoose.connect(db_url).then(()=>{
  console.log("DB Connet");
  
}).catch((error)=>{
  console.log("Db error :" + error);
  
})
}

module.exports = dbconfig