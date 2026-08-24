const router=require("express").Router(),{Op}=require("sequelize");
const {Project,Queue,RetryPolicy}=require("../models"),auth=require("../middleware/auth"),{queueResponse}=require("../utils");
async function projectAccess(projectId,userId){return Project.findOne({where:{id:projectId,createdBy:userId,isActive:true}})}
async function queueAccess(id,userId){return Queue.findOne({where:{id},include:[{model:Project,where:{createdBy:userId,isActive:true},attributes:[]}]})}
router.post("/queues",auth,async(req,res,next)=>{try{
 const b=req.body||{},p=await projectAccess(b.project_id,req.user.id);if(!p)return res.status(404).json({detail:"Project not found"});
 if(await Queue.findOne({where:{projectId:b.project_id,name:b.name}}))return res.status(409).json({detail:"A queue with this name already exists in the project"});
 const rp=b.retry_policy||{};const r=await RetryPolicy.create({name:rp.name||"default-retry-policy",strategy:String(rp.strategy||"exponential").toUpperCase(),maxRetries:rp.max_retries??3,initialDelaySeconds:rp.initial_delay_seconds??5,maxDelaySeconds:rp.max_delay_seconds??300});
 const q=await Queue.create({projectId:b.project_id,retryPolicyId:r.id,name:b.name,priority:b.priority??0,concurrencyLimit:b.concurrency_limit??5,isPaused:false});
 q.retryPolicy=r;res.status(201).json(queueResponse(q,true));
}catch(e){next(e)}});
router.get("/queues",auth,async(req,res,next)=>{try{
 const where={};if(req.query.project_id)where.projectId=req.query.project_id;
 const rows=await Queue.findAll({where,include:[{model:Project,where:{createdBy:req.user.id,isActive:true},attributes:[]},{model:RetryPolicy,as:"retryPolicy"}],order:[["createdAt","DESC"]]});res.json(rows.map(q=>queueResponse(q,true)));
}catch(e){next(e)}});
router.get("/queues/:id",auth,async(req,res,next)=>{try{const q=await queueAccess(req.params.id,req.user.id);if(!q)return res.status(404).json({detail:"Queue not found"});await q.reload({include:[{model:RetryPolicy,as:"retryPolicy"}]});res.json(queueResponse(q,true));}catch(e){next(e)}});
router.put("/queues/:id",auth,async(req,res,next)=>{try{const q=await queueAccess(req.params.id,req.user.id);if(!q)return res.status(404).json({detail:"Queue not found"});const b=req.body||{};if(b.name!==undefined){const d=await Queue.findOne({where:{projectId:q.projectId,name:b.name,id:{[Op.ne]:q.id}}});if(d)return res.status(409).json({detail:"A queue with this name already exists in the project"});q.name=b.name;}if(b.priority!==undefined)q.priority=b.priority;if(b.concurrency_limit!==undefined)q.concurrencyLimit=b.concurrency_limit;if(b.retry_policy){let r=await RetryPolicy.findByPk(q.retryPolicyId);if(!r)r=await RetryPolicy.create({name:"default-retry-policy",strategy:"EXPONENTIAL"});Object.assign(r,{name:b.retry_policy.name??r.name,strategy:String(b.retry_policy.strategy??r.strategy).toUpperCase(),maxRetries:b.retry_policy.max_retries??r.maxRetries,initialDelaySeconds:b.retry_policy.initial_delay_seconds??r.initialDelaySeconds,maxDelaySeconds:b.retry_policy.max_delay_seconds??r.maxDelaySeconds});await r.save();q.retryPolicyId=r.id;}await q.save();await q.reload({include:[{model:RetryPolicy,as:"retryPolicy"}]});res.json(queueResponse(q,true));}catch(e){next(e)}});
router.post("/queues/:id/pause",auth,async(req,res,next)=>{try{const q=await queueAccess(req.params.id,req.user.id);if(!q)return res.status(404).json({detail:"Queue not found"});q.isPaused=true;await q.save();res.json(queueResponse(q));}catch(e){next(e)}});
router.post("/queues/:id/resume",auth,async(req,res,next)=>{try{const q=await queueAccess(req.params.id,req.user.id);if(!q)return res.status(404).json({detail:"Queue not found"});q.isPaused=false;await q.save();res.json(queueResponse(q));}catch(e){next(e)}});
router.get("/queues/:id/status",auth,async(req,res,next)=>{try{const q=await queueAccess(req.params.id,req.user.id);if(!q)return res.status(404).json({detail:"Queue not found"});res.json({id:q.id,name:q.name,is_paused:q.isPaused,status:q.isPaused?"paused":"active"});}catch(e){next(e)}});
module.exports=router;
