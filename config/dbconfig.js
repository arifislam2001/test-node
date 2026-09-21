const mongoose = require("mongoose")
<<<<<<< HEAD

=======
>>>>>>> 8ff4119c7a8b12d1d72d5bccaed7d971df4dfc2e
const db_url = process.env.DB_URL

const dbconfig = ()=>{
    mongoose.connect(db_url).then(()=>{
<<<<<<< HEAD
        console.log("DB connet");
        
    }).catch((error)=>{
        console.log("Service isn't connet : " + error);
        
    })
}

module.exports = dbconfig 
=======
     console.log("DB Connet");
  
}).catch((error)=>{
  console.log("Db error :" + error);
  
})
}

module.exports = dbconfig
>>>>>>> 8ff4119c7a8b12d1d72d5bccaed7d971df4dfc2e
