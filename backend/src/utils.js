function lowerEnum(value) { return typeof value === "string" ? value.toLowerCase() : value; }
function userResponse(u) {
  return { id: u.id, email: u.email, full_name: u.fullName, is_active: u.isActive };
}
function orgResponse(o) { return { id:o.id, name:o.name, slug:o.slug }; }
function projectResponse(p) {
  return { id:p.id, organization_id:p.organizationId, created_by:p.createdBy, name:p.name, description:p.description, is_active:p.isActive };
}
function queueResponse(q, detail=false) {
  const r={id:q.id,project_id:q.projectId,retry_policy_id:q.retryPolicyId,name:q.name,priority:q.priority,concurrency_limit:q.concurrencyLimit,is_paused:q.isPaused,created_at:q.createdAt,updated_at:q.updatedAt};
  if(detail) r.retry_policy=q.retryPolicy ? {id:q.retryPolicy.id,name:q.retryPolicy.name,strategy:lowerEnum(q.retryPolicy.strategy),max_retries:q.retryPolicy.maxRetries,initial_delay_seconds:q.retryPolicy.initialDelaySeconds,max_delay_seconds:q.retryPolicy.maxDelaySeconds,created_at:q.retryPolicy.createdAt}:null;
  return r;
}
function jobResponse(j) {
 return {id:j.id,queue_id:j.queueId,job_type:j.jobType,payload:j.payload,status:lowerEnum(j.status),priority:j.priority,max_attempts:j.maxAttempts,attempt_count:j.attemptCount,scheduled_at:j.scheduledAt,claimed_at:j.claimedAt,started_at:j.startedAt,completed_at:j.completedAt,failed_at:j.failedAt,last_error:j.lastError,idempotency_key:j.idempotencyKey,created_at:j.createdAt,updated_at:j.updatedAt};
}
function workerResponse(w) { return {id:w.id,project_id:w.projectId,name:w.name,hostname:w.hostname,status:w.status,concurrency:w.concurrency,last_heartbeat_at:w.lastHeartbeatAt,started_at:w.startedAt,stopped_at:w.stoppedAt,created_at:w.createdAt}; }
function scheduledResponse(s) { return {id:s.id,job_id:s.jobId,run_at:s.runAt,cron_expression:s.cronExpression,timezone:s.timezone,is_recurring:s.isRecurring,next_run_at:s.nextRunAt,created_at:s.createdAt}; }
function dlqResponse(d) { return {id:d.id,job_id:d.jobId,reason:d.reason,final_error:d.finalError,failed_at:d.failedAt,resolved_at:d.resolvedAt,created_at:d.createdAt}; }
module.exports={lowerEnum,userResponse,orgResponse,projectResponse,queueResponse,jobResponse,workerResponse,scheduledResponse,dlqResponse};
