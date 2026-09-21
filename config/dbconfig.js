const mongoose = require("mongoose")
const db_url = process.env.DB_URL

const dbconfig = ()=>{
    mongoose.connect(db_url).then(()=>{

        console.log("DB connet");
        
    }).catch((error)=>{
        console.log("Service isn't connet : " + error);
        
    })
}

module.exports = dbconfig