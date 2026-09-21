const middleware = (req, res, next)=>{
   const password = "1234"
   const {pass} = req.body
   if(password === pass){
    next()
   }else{
    res.send("password vul  dico")
   }

}

module.exports = middleware