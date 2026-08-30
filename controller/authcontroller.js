const authcontroller =  (req, res)=>{
  const balance = 1000
//   res.send(req.body);
// const { username , email, password} = req.body
// console.log(username , email , password);
  
// if(!username){
//     res.send("usernamelagbe")
// }else if (!password) {
//     res.send("password lagbe")
// }else if (!email) {
//     res.send("email lagbe")
// }else{
//     console.log(username , email, password);
    
// }


res.send(balance)
  
  
}
module.exports = authcontroller