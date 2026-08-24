const router=require("express").Router(), {Organization,OrganizationMember,Project}=require("../models"),auth=require("../middleware/auth"),{orgResponse,projectResponse}=require("../utils");
function slugify(s){return s.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"organization";}
async function orgAccess(userId,id){return Organization.findOne({include:[{model:require("../models").User,where:{id:userId},attributes:[],through:{attributes:[]}}],where:{id}})}
router.post("/organizations",auth,async(req,res,next)=>{try{
 const name=(req.body.name||"").trim(); if(name.length<2)return res.status(422).json({detail:"name is required"});
 let base=slugify(name),slug=base,c=1; while(await Organization.findOne({where:{slug}})){slug=`${base}-${++c}`;}
 const o=await Organization.create({name,slug}); await OrganizationMember.create({organizationId:o.id,userId:req.user.id,role:"owner"}); res.status(201).json(orgResponse(o));
}catch(e){next(e)}});
router.get("/organizations",auth,async(req,res,next)=>{try{const rows=await Organization.findAll({include:[{model:require("../models").User,where:{id:req.user.id},attributes:[],through:{attributes:[]}}],order:[["createdAt","DESC"]]});res.json(rows.map(orgResponse));}catch(e){next(e)}});
router.post("/projects",auth,async(req,res,next)=>{try{
 const {organization_id,name,description}=req.body||{},o=await orgAccess(req.user.id,organization_id);
 if(!o)return res.status(403).json({detail:"You do not have access to this organization"});
 const n=(name||"").trim(); if(!n)return res.status(422).json({detail:"name is required"});
 if(await Project.findOne({where:{organizationId:organization_id,name:n}}))return res.status(409).json({detail:"A project with this name already exists in the organization"});
 const p=await Project.create({organizationId:organization_id,createdBy:req.user.id,name:n,description:description??null});res.status(201).json(projectResponse(p));
}catch(e){next(e)}});
router.get("/projects",auth,async(req,res,next)=>{try{
 const rows=await Project.findAll({include:[{model:Organization,include:[{model:require("../models").User,where:{id:req.user.id},attributes:[],through:{attributes:[]}}],attributes:[]}],order:[["createdAt","DESC"]]});res.json(rows.map(projectResponse));
}catch(e){next(e)}});
router.get("/projects/:id",auth,async(req,res,next)=>{try{const p=await Project.findByPk(req.params.id,{include:[{model:Organization,include:[{model:require("../models").User,where:{id:req.user.id},attributes:[],through:{attributes:[]}}],attributes:[]}]});if(!p)return res.status(404).json({detail:"Project not found"});res.json(projectResponse(p));}catch(e){next(e)}});
router.put("/projects/:id",auth,async(req,res,next)=>{try{const p=await Project.findByPk(req.params.id,{include:[{model:Organization,include:[{model:require("../models").User,where:{id:req.user.id},attributes:[],through:{attributes:[]}}],attributes:[]}]});if(!p)return res.status(404).json({detail:"Project not found"});const {name,description,is_active}=req.body||{};if(name!==undefined){const n=name.trim();if(await Project.findOne({where:{organizationId:p.organizationId,name:n,id:{[require("sequelize").Op.ne]:p.id}}}))return res.status(409).json({detail:"A project with this name already exists"});p.name=n;}if(description!==undefined)p.description=description;if(is_active!==undefined)p.isActive=is_active;await p.save();res.json(projectResponse(p));}catch(e){next(e)}});
router.delete("/projects/:id",auth,async(req,res,next)=>{try{const p=await Project.findByPk(req.params.id,{include:[{model:Organization,include:[{model:require("../models").User,where:{id:req.user.id},attributes:[],through:{attributes:[]}}],attributes:[]}]});if(!p)return res.status(404).json({detail:"Project not found"});await p.destroy();res.status(204).send();}catch(e){next(e)}});
module.exports=router;
