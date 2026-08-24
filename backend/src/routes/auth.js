const router=require("express").Router(), bcrypt=require("bcryptjs"), jwt=require("jsonwebtoken");
const {User}=require("../models"), config=require("../config"), auth=require("../middleware/auth"), {userResponse}=require("../utils");
function tokenFor(id){return jwt.sign({sub:String(id),iat:Math.floor(Date.now()/1000)},config.jwtSecret,{algorithm:config.jwtAlgorithm,expiresIn:`${config.tokenMinutes}m`});}
router.post("/register",async(req,res,next)=>{try{
 const {email,password,full_name}=req.body||{};
 if(!email||!password||!full_name||password.length<8)return res.status(422).json({detail:"email, password (min 8), and full_name are required"});
 const e=email.toLowerCase().trim(); if(await User.findOne({where:{email:e}}))return res.status(409).json({detail:"A user with this email already exists"});
 const u=await User.create({email:e,passwordHash:await bcrypt.hash(password,12),fullName:full_name.trim()});
 res.status(201).json({user:userResponse(u),token:{access_token:tokenFor(u.id),token_type:"bearer"}});
}catch(e){next(e)}});
router.post("/login",async(req,res,next)=>{try{
 const {email,password}=req.body||{},u=await User.findOne({where:{email:(email||"").toLowerCase().trim()}});
 if(!u||!(await bcrypt.compare(password||"",u.passwordHash)))return res.status(401).json({detail:"Invalid email or password"});
 if(!u.isActive)return res.status(403).json({detail:"User account is inactive"});
 res.json({user:userResponse(u),token:{access_token:tokenFor(u.id),token_type:"bearer"}});
}catch(e){next(e)}});
router.get("/me",auth,(req,res)=>res.json(userResponse(req.user)));
module.exports=router;
