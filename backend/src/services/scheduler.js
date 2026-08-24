const {Op}=require("sequelize");
const {Job,ScheduledJob}=require("../models");

async function processScheduledJobs(){
  const now=new Date();
  const rows=await ScheduledJob.findAll({where:{runAt:{[Op.lte]:now}},include:[{model:Job}]});
  let processed=0;
  for(const s of rows){
    const j=s.Job;if(!j){await s.destroy();continue;}
    if(!["SCHEDULED","QUEUED"].includes(j.status))continue;
    if(!s.isRecurring||!s.cronExpression){
      j.status="QUEUED";j.scheduledAt=s.runAt;await j.save();await s.destroy();processed++;continue;
    }
    // Keep recurring schedules safe: calculate the next occurrence using cron-parser.
    try{
      const {CronExpressionParser}=require("cron-parser");
      const next=CronExpressionParser.parse(s.cronExpression,{currentDate:s.runAt}).next().toDate();
      s.nextRunAt=next;s.runAt=next;await s.save();
      await Job.create({queueId:j.queueId,jobType:j.jobType,payload:j.payload,status:"SCHEDULED",priority:j.priority,maxAttempts:j.maxAttempts,attemptCount:0,scheduledAt:next});
      j.status="QUEUED";j.scheduledAt=now;await j.save();processed++;
    }catch{
      j.status="QUEUED";j.scheduledAt=s.runAt;await j.save();await s.destroy();processed++;
    }
  }
  return processed;
}
function startScheduler(){processScheduledJobs().catch(console.error);return setInterval(()=>processScheduledJobs().catch(console.error),5000);}
module.exports={processScheduledJobs,startScheduler};
