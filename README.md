Yes. Below is a **clean, submission-ready `README.md`** based on your actual project and the requirements you provided.

Save it as:

`~/Downloads/distributed-job-scheduler/README.md`

# Distributed Job Scheduler

A production-inspired **Distributed Job Scheduler** built to reliably execute asynchronous background jobs across multiple workers.

The system provides authentication, project and queue management, job scheduling, worker execution, retries, Dead Letter Queue (DLQ) handling, monitoring, metrics, and a web dashboard.

---

# 1. Project Overview

The Distributed Job Scheduler follows a distributed architecture where users submit jobs through a React dashboard and the Node.js backend stores and manages them in PostgreSQL. Independent worker processes poll for available jobs and execute them asynchronously.

### High-Level Flow

```text
User
  |
  v
React Frontend
  |
  | REST API / Axios
  v
Node.js + Express Backend
  |
  +----------------------+
  |                      |
  v                      v
PostgreSQL            Authentication
  |                      |
  |                      v
  |                    JWT
  |
  v
Job Queue
  |
  v
Worker Process
  |
  v
Job Execution
  |
  +------------------+
  |                  |
  v                  v
Completed          Failed
                     |
                     v
                   Retry
                     |
              +------+------+
              |             |
              v             v
           Success      Max Attempts
                            |
                            v
                          DLQ
```

---

# 2. Core Features

## Authentication

* User registration
* User login
* JWT-based authentication
* Protected API routes
* Password hashing using bcrypt
* Persistent frontend authentication
* Logout functionality

## Organizations and Projects

* Organization management
* Project creation
* Project ownership
* Project-based resource isolation
* Multiple queues per project

## Queue Management

* Create queues
* Configure queue priority
* Configure concurrency limits
* Configure retry policies
* Pause and resume queues
* Queue statistics
* Project-specific queues

## Job Management

* Create jobs
* Immediate job execution
* Delayed/scheduled execution
* Job priority
* Job payload
* Job status tracking
* Attempt tracking
* Execution history
* Job logs

## Distributed Workers

* Independent worker processes
* Worker registration
* Worker polling
* Concurrent job execution
* Worker heartbeat
* Worker status monitoring
* Worker concurrency configuration
* Project-specific workers
* Graceful worker shutdown

## Retry System

Supported retry strategies:

```text
FIXED
LINEAR
EXPONENTIAL
```

The retry system supports:

* Maximum attempts
* Retry delays
* Attempt tracking
* Failure recording
* Retry history
* Configurable retry policies

## Dead Letter Queue

Jobs that permanently fail after exhausting their retry attempts are moved to the Dead Letter Queue.

DLQ functionality includes:

* Failed job identification
* Failure reason
* Final error
* Failure timestamp
* Retry action
* Resolve action

## Scheduled Jobs

The scheduler supports future job execution and scheduled/recurring configuration.

Scheduled job information includes:

```text
run_at
cron_expression
timezone
is_recurring
next_run_at
```

## Monitoring and Metrics

The dashboard provides:

* Total jobs
* Queues
* Workers
* Completed jobs
* Failed jobs
* Queued jobs
* Scheduled jobs
* Running jobs
* Execution count
* Successful executions
* Failed executions
* Execution statistics
* Worker status

---

# 3. Technology Stack

## Frontend

| Technology | Purpose                         |
| ---------- | ------------------------------- |
| React.js   | User interface                  |
| Vite       | Frontend development/build tool |
| Axios      | REST API communication          |
| CSS        | Application styling             |

## Backend

| Technology | Purpose                   |
| ---------- | ------------------------- |
| Node.js    | Backend runtime           |
| Express.js | REST API framework        |
| Sequelize  | PostgreSQL ORM            |
| JWT        | Authentication            |
| bcryptjs   | Password hashing          |
| dotenv     | Environment configuration |

## Database

| Technology | Purpose                        |
| ---------- | ------------------------------ |
| PostgreSQL | Persistent relational database |

---

# 4. System Architecture

```text
                       +------------------+
                       |      User        |
                       +--------+---------+
                                |
                                v
                       +------------------+
                       | React Frontend   |
                       |      Vite        |
                       +--------+---------+
                                |
                           REST / Axios
                                |
                                v
                       +------------------+
                       | Express Backend  |
                       |    Port 8000     |
                       +--------+---------+
                                |
              +-----------------+-----------------+
              |                                   |
              v                                   v
      +---------------+                   +---------------+
      | Authentication|                   | API Routes    |
      |     JWT       |                   |               |
      +---------------+                   | Projects      |
                                          | Queues        |
                                          | Jobs          |
                                          | Workers       |
                                          | Scheduled     |
                                          | DLQ           |
                                          | Metrics       |
                                          +-------+-------+
                                                  |
                                                  v
                                          +---------------+
                                          |   Sequelize   |
                                          +-------+-------+
                                                  |
                                                  v
                                          +---------------+
                                          |  PostgreSQL   |
                                          +-------+-------+
                                                  |
                                                  |
                                                  v
                                          +---------------+
                                          |    Worker     |
                                          |   worker-1    |
                                          +-------+-------+
                                                  |
                                                  v
                                          +---------------+
                                          | Job Execution |
                                          +-------+-------+
```

---

# 5. Database Design

The application uses PostgreSQL as its primary relational database.

## Main Entities

### Users

Stores registered users.

```text
users
-----
id
email
password_hash
full_name
is_active
created_at
updated_at
```

### Organizations

Stores organizations.

```text
organizations
-------------
id
name
slug
created_at
```

### Organization Members

Associates users with organizations.

```text
organization_members
--------------------
id
organization_id
user_id
role
created_at
updated_at
```

### Projects

Stores scheduler projects.

```text
projects
--------
id
organization_id
created_by
name
description
is_active
created_at
updated_at
```

### Retry Policies

Stores retry configuration.

```text
retry_policies
--------------
id
name
strategy
max_retries
initial_delay_seconds
max_delay_seconds
created_at
updated_at
```

Supported strategies:

```text
FIXED
LINEAR
EXPONENTIAL
```

### Queues

Stores project-specific queues.

```text
queues
------
id
project_id
retry_policy_id
name
priority
concurrency_limit
is_paused
created_at
updated_at
```

### Workers

Stores worker information.

```text
workers
-------
id
project_id
name
hostname
status
concurrency
last_heartbeat_at
started_at
stopped_at
created_at
updated_at
```

### Worker Heartbeats

Stores worker heartbeat information.

```text
worker_heartbeats
-----------------
id
worker_id
recorded_at
active_jobs
metadata
```

### Jobs

Stores scheduled and executable jobs.

```text
jobs
----
id
queue_id
job_type
payload
status
priority
max_attempts
attempt_count
scheduled_at
claimed_at
started_at
completed_at
failed_at
last_error
idempotency_key
created_at
updated_at
```

### Job Executions

Stores every execution attempt.

```text
job_executions
--------------
id
job_id
worker_id
attempt_number
status
started_at
finished_at
duration_ms
error_message
result
created_at
updated_at
```

### Job Logs

Stores execution logs.

```text
job_logs
--------
id
job_id
execution_id
level
message
created_at
updated_at
```

### Scheduled Jobs

Stores scheduled and recurring job configuration.

```text
scheduled_jobs
--------------
id
job_id
run_at
cron_expression
timezone
is_recurring
next_run_at
created_at
```

### Dead Letter Queue

Stores permanently failed jobs.

```text
dead_letter_queue
-----------------
id
job_id
reason
final_error
failed_at
resolved_at
created_at
```

---

# 6. Database Relationships

```text
User
 |
 v
Organization Member
 |
 v
Organization
 |
 v
Project
 |
 +--------------------+
 |                    |
 v                    v
Queue               Worker
 |
 +----------------+
 |                |
 v                v
Retry Policy      Job
                   |
       +-----------+-----------+
       |           |           |
       v           v           v
 Job Execution   Job Log   Scheduled Job
       |
       v
    Worker

Job
 |
 v
Dead Letter Queue
```

---

# 7. Database Design Principles

## Primary Keys

Each major entity uses a UUID primary key.

UUIDs provide globally unique identifiers suitable for distributed systems.

## Foreign Keys

Relationships are maintained using foreign keys.

Examples:

```text
projects.organization_id
queues.project_id
jobs.queue_id
job_executions.job_id
job_executions.worker_id
```

## Indexes

Indexes are used on frequently queried fields such as:

```text
users.email
organizations.slug
jobs.status
jobs.queue_id
jobs.scheduled_at
jobs.created_at
workers.project_id
workers.status
```

These indexes improve job polling, filtering, authentication, and dashboard queries.

## Normalization

The database separates users, organizations, projects, queues, jobs, executions, logs, workers, and retry policies into independent tables to reduce data duplication and maintain consistency.

---

# 8. Job Lifecycle

A normal job follows this lifecycle:

```text
QUEUED
   |
   v
CLAIMED
   |
   v
RUNNING
   |
   v
COMPLETED
```

If execution fails:

```text
RUNNING
   |
   v
FAILED
   |
   v
RETRY
   |
   v
RUNNING
```

If the job reaches its maximum attempts:

```text
FAILED
   |
   v
DEAD LETTER QUEUE
```

---

# 9. Atomic Job Claiming

Workers must prevent multiple workers from executing the same job.

The worker claims an available job before execution.

Conceptually:

```text
Worker 1 ----+
             |
             v
         Available Job
             |
             v
        Atomic Claim
             |
       +-----+-----+
       |           |
       v           v
   Worker 1      Worker 2
    CLAIMED      Cannot claim
```

This prevents duplicate execution when multiple workers poll the same queue.

---

# 10. Worker Execution

Workers continuously poll PostgreSQL for available jobs.

Example:

```text
Worker
  |
  v
Poll Queue
  |
  v
Find Available Job
  |
  v
Atomically Claim Job
  |
  v
Execute Job
  |
  +----------------+
  |                |
  v                v
Success          Failure
  |                |
  v                v
Completed        Retry/DLQ
```

Worker configuration:

```env
WORKER_PROJECT_ID=YOUR_PROJECT_ID
WORKER_NAME=worker-1
WORKER_CONCURRENCY=2
WORKER_POLL_INTERVAL=1000
```

Example worker output:

```text
[WORKER] PostgreSQL connected
[WORKER] Existing worker started: worker-1

==============================================
 DISTRIBUTED JOB SCHEDULER WORKER
==============================================

Worker: worker-1
Concurrency: 2
Poll interval: 1000 ms
==============================================

[WORKER] Heartbeat | active jobs=0
```

---

# 11. Worker Heartbeats

Workers periodically update their heartbeat.

Example:

```text
[WORKER] Heartbeat | active jobs=0
```

The heartbeat allows the dashboard to monitor worker health.

Worker information includes:

```text
Worker ID
Worker Name
Project
Status
Concurrency
Last Heartbeat
```

---

# 12. Retry Strategies

The scheduler supports three retry strategies.

## Fixed Backoff

Each retry waits for the same delay.

```text
Failure
  |
  +--> wait 5 seconds
  |
 Retry
  |
  +--> wait 5 seconds
  |
 Retry
```

## Linear Backoff

The delay increases linearly.

```text
Retry 1 -> 5 seconds
Retry 2 -> 10 seconds
Retry 3 -> 15 seconds
```

## Exponential Backoff

The delay increases exponentially.

```text
Retry 1 -> 5 seconds
Retry 2 -> 10 seconds
Retry 3 -> 20 seconds
Retry 4 -> 40 seconds
```

---

# 13. Dead Letter Queue

When a job exceeds its maximum number of attempts, it is moved to the DLQ.

```text
Job
 |
 v
RUNNING
 |
 v
FAILED
 |
 v
Retry
 |
 v
FAILED
 |
 v
Maximum Attempts
 |
 v
DLQ
```

DLQ actions include:

### Retry

```text
DLQ
 |
 v
Retry
 |
 v
QUEUED
 |
 v
WORKER
```

### Resolve

```text
DLQ
 |
 v
Resolve
 |
 v
Resolved
```

---

# 14. Scheduled Jobs

Scheduled jobs allow execution at a future time.

```text
Create Scheduled Job
        |
        v
 scheduled_jobs
        |
        v
 Wait Until run_at
        |
        v
      QUEUED
        |
        v
      WORKER
        |
        v
    EXECUTION
```

Scheduled jobs may contain:

```text
run_at
cron_expression
timezone
is_recurring
next_run_at
```

---

# 15. REST API

The backend runs on:

```text
http://localhost:8000
```

## Health

### GET `/health`

Checks backend availability.

Example:

```json
{
  "status": "healthy"
}
```

---

## Authentication

### POST `/auth/register`

Registers a new user.

### POST `/auth/login`

Authenticates a user and returns a JWT access token.

Example:

```json
{
  "email": "scheduler@test.com",
  "password": "YOUR_PASSWORD"
}
```

---

## Projects

### GET `/projects`

Returns projects available to the authenticated user.

### POST `/projects`

Creates a project.

### GET `/projects/:id`

Returns project information.

### PUT `/projects/:id`

Updates a project.

### DELETE `/projects/:id`

Deletes or deactivates a project.

---

## Queues

### GET `/queues`

Lists queues.

### POST `/queues`

Creates a queue.

### PUT `/queues/:id`

Updates queue configuration.

### DELETE `/queues/:id`

Deletes a queue.

Queue configuration includes:

```text
priority
concurrency_limit
retry_policy
pause/resume
```

---

## Jobs

### GET `/jobs`

Lists jobs.

### POST `/jobs`

Creates a job.

Example:

```json
{
  "queue_id": "QUEUE_ID",
  "job_type": "process_job",
  "payload": {
    "message": "Hello Scheduler"
  },
  "priority": 10,
  "max_attempts": 3
}
```

### GET `/jobs/:id`

Returns job details.

---

## Workers

### GET `/workers`

Lists workers.

Worker information includes:

```text
name
status
concurrency
last heartbeat
project
```

---

## Scheduled Jobs

### GET `/scheduled-jobs`

Lists scheduled jobs.

### POST `/scheduled-jobs`

Creates a scheduled job.

---

## Dead Letter Queue

### GET `/dlq`

Lists DLQ entries.

### GET `/dlq/:id`

Returns a DLQ entry.

### POST `/dlq/:id/retry`

Retries a failed DLQ job.

### POST `/dlq/:id/resolve`

Resolves a DLQ entry.

---

## Metrics

### GET `/metrics/overview`

Returns scheduler overview metrics.

Example:

```json
{
  "total_projects": 1,
  "total_queues": 1,
  "total_jobs": 4,
  "queued_jobs": 0,
  "scheduled_jobs": 0,
  "claimed_jobs": 0,
  "running_jobs": 0,
  "completed_jobs": 3,
  "failed_jobs": 1,
  "total_workers": 0
}
```

---

# 16. API Design

The API follows REST principles and uses:

* HTTP methods
* JSON request/response bodies
* JWT authentication
* HTTP status codes
* Protected resources
* Validation
* Error responses
* Project-level authorization
* Filtering and pagination where supported

Authentication is sent using:

```text
Authorization: Bearer <JWT_TOKEN>
```

---

# 17. Environment Configuration

Backend configuration is stored in:

```text
backend/.env
```

Example:

```env
APP_NAME=Distributed Job Scheduler
APP_VERSION=1.0.0
PORT=8000
NODE_ENV=development

DATABASE_URL=postgres://scheduler_user:scheduler_password@127.0.0.1:5432/distributed_scheduler

JWT_SECRET_KEY=change-this-secret-key-before-submission
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

WORKER_PROJECT_ID=YOUR_PROJECT_ID
WORKER_NAME=worker-1
WORKER_CONCURRENCY=2
WORKER_POLL_INTERVAL=1000
```

> **Security:** Never commit real database passwords, JWT secrets, or other credentials to a public repository.

---

# 18. Installation

## Prerequisites

Install:

* Node.js
* npm
* PostgreSQL
* Git

Verify:

```bash
node --version
npm --version
psql --version
```

---

# 19. Backend Setup

Navigate to the backend:

```bash
cd ~/Downloads/distributed-job-scheduler/backend
```

Install dependencies:

```bash
npm install
```

Make sure PostgreSQL is running.

Verify the `.env` configuration.

Start the backend:

```bash
npm start
```

Backend:

```text
http://localhost:8000
```

Test:

```bash
curl http://localhost:8000/health
```

Expected:

```json
{
  "status": "healthy"
}
```

---

# 20. Start the Worker

Open a separate terminal:

```bash
cd ~/Downloads/distributed-job-scheduler/backend
npm run worker
```

Expected output:

```text
[WORKER] PostgreSQL connected
[WORKER] Existing worker started: worker-1

==============================================
 DISTRIBUTED JOB SCHEDULER WORKER
==============================================

Worker: worker-1
Concurrency: 2
Poll interval: 1000 ms
==============================================

[WORKER] Heartbeat | active jobs=0
```

When a job executes:

```text
[WORKER] Job <JOB_ID> is RUNNING
[WORKER] Executing job <JOB_ID>
[WORKER] Job <JOB_ID> COMPLETED
```

---

# 21. Frontend Setup

Open another terminal:

```bash
cd ~/Downloads/distributed-job-scheduler/frontend
```

Install dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

The frontend normally runs on:

```text
http://localhost:5173
```

Open the URL in a browser.

---

# 22. Running the Complete System

Three terminals are recommended.

### Terminal 1 — Backend

```bash
cd ~/Downloads/distributed-job-scheduler/backend
npm start
```

### Terminal 2 — Worker

```bash
cd ~/Downloads/distributed-job-scheduler/backend
npm run worker
```

### Terminal 3 — Frontend

```bash
cd ~/Downloads/distributed-job-scheduler/frontend
npm run dev
```

Then open:

```text
http://localhost:5173
```

---

# 23. Dashboard

The React dashboard provides scheduler monitoring.

The dashboard displays information such as:

```text
Total Jobs
Completed Jobs
Failed Jobs
Queues
Workers
Execution Metrics
```

Execution summary:

```text
Queued
Scheduled
Running
Completed
Failed
```

The Metrics page provides:

```text
Total Executions
Successful
Failed
Total Jobs
Completed Jobs
Failed Jobs
Workers
Queues
```

---

# 24. Security

The system includes:

* JWT authentication
* bcrypt password hashing
* Protected API routes
* Authentication middleware
* CORS configuration
* Environment-based configuration
* Project-based resource access

For production deployment, additional security improvements can include:

* HTTPS
* Strong JWT secrets
* Rate limiting
* Request validation
* Secure cookies
* Database backups
* Production logging

---

# 25. Testing Checklist

Before submission, verify:

```text
[ ] Backend starts successfully
[ ] PostgreSQL connection works
[ ] /health returns healthy
[ ] User registration works
[ ] User login works
[ ] JWT authentication works
[ ] Dashboard loads
[ ] Projects load
[ ] Queues load
[ ] Jobs load
[ ] Worker starts
[ ] Worker heartbeat works
[ ] Normal job completes
[ ] Scheduled job executes
[ ] Failed job retries
[ ] Maximum retry limit works
[ ] Failed job enters DLQ
[ ] DLQ displays failed jobs
[ ] DLQ Retry works
[ ] DLQ Resolve works
[ ] Metrics load
[ ] Logout works
```

---

# 26. Project Structure

```text
distributed-job-scheduler/
|
├── backend/
│   ├── src/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── dlq.js
│   │   │   ├── jobs.js
│   │   │   ├── metrics.js
│   │   │   ├── projects.js
│   │   │   ├── queues.js
│   │   │   ├── scheduledJobs.js
│   │   │   └── workers.js
│   │   ├── utils/
│   │   ├── app.js
│   │   └── db.js
│   │
│   ├── worker.js
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api.js
│   │   └── App.jsx
│   │
│   └── package.json
│
├── README.md
├── architecture-diagram.png
├── er-diagram.png
├── API-DOCUMENTATION.md
└── DESIGN-DECISIONS.md
```

---

# 27. Architecture Diagram

The project architecture diagram shows:

```text
React Frontend
      |
      v
Express REST API
      |
      +------ JWT Authentication
      |
      v
PostgreSQL
      |
      v
Worker Processes
      |
      v
Job Execution
      |
   +--+--+
   |     |
Success Failure
   |     |
   v     v
Done   Retry
          |
          v
         DLQ
```

A detailed architecture diagram is provided separately as:

```text
architecture-diagram.png
```

---

# 28. ER Diagram

The ER diagram represents the relationships between:

```text
Users
Organizations
Organization Members
Projects
Queues
Retry Policies
Jobs
Job Executions
Job Logs
Workers
Worker Heartbeats
Scheduled Jobs
Dead Letter Queue
```

The detailed ER diagram is provided separately as:

```text
er-diagram.png
```

---

# 29. API Documentation

Detailed API documentation is provided separately in:

```text
API-DOCUMENTATION.md
```

It contains:

* Endpoint descriptions
* HTTP methods
* Authentication requirements
* Request parameters
* Request bodies
* Response formats
* Error responses
* Example API calls

---

# 30. Design Decisions

Major design decisions are documented separately in:

```text
DESIGN-DECISIONS.md
```

The document explains:

* Why PostgreSQL was selected
* Why Node.js and Express were selected
* Why Sequelize was used
* JWT authentication
* Worker architecture
* Atomic job claiming
* Retry strategy
* Dead Letter Queue
* Database normalization
* Indexing
* Concurrency handling
* Reliability considerations
* Trade-offs

---

# 31. Evaluation Requirement Mapping

| Evaluation Area           | Implementation                                |
| ------------------------- | --------------------------------------------- |
| System Architecture       | React + Express + PostgreSQL + Workers        |
| Database Design           | Normalized PostgreSQL relational schema       |
| Backend Engineering       | Node.js + Express REST APIs                   |
| Reliability & Concurrency | Worker claiming, retries, heartbeats, DLQ     |
| Frontend & UX             | React dashboard                               |
| API Design                | REST + JWT + JSON                             |
| Documentation             | README + API documentation + design decisions |
| Testing                   | Critical functionality testing                |

---

# 32. Bonus Features

The architecture can be extended with:

* Workflow dependencies
* Rate limiting
* Distributed locking
* Queue sharding
* Event-driven execution
* WebSocket live updates
* Role-based access control
* AI-generated failure summaries

These are considered optional enhancements and are not required for the core scheduler implementation.

---

# 33. Recommended Demonstration

For a project demonstration:

### Step 1 — Login

Login using a registered scheduler user.

### Step 2 — Dashboard

Show:

```text
Total Jobs
Queues
Workers
Completed Jobs
Failed Jobs
Metrics
```

### Step 3 — Project

Open the scheduler project.

### Step 4 — Queue

Show queue configuration.

### Step 5 — Worker

Start the worker and show heartbeat messages.

### Step 6 — Create Job

Create a normal job.

### Step 7 — Worker Execution

Show:

```text
QUEUED
   |
   v
CLAIMED
   |
   v
RUNNING
   |
   v
COMPLETED
```

### Step 8 — Scheduled Job

Create a scheduled job and show its execution.

### Step 9 — Failure

Create a controlled failing job.

Show:

```text
FAILED
   |
   v
RETRY
   |
   v
FAILED
   |
   v
RETRY
```

### Step 10 — DLQ

Show that the permanently failed job enters the Dead Letter Queue.

### Step 11 — DLQ Action

Demonstrate:

```text
Retry
```

or:

```text
Resolve
```

### Step 12 — Metrics

Return to Metrics and show updated execution statistics.

---

# 34. Future Improvements

Possible production enhancements include:

* Multiple worker nodes
* Redis-based distributed locking
* Kafka event streaming
* WebSocket real-time updates
* Docker containerization
* Kubernetes deployment
* Horizontal worker scaling
* Advanced cron scheduling
* Job dependency graphs
* Rate limiting
* Prometheus/Grafana monitoring
* Role-based access control
* Audit logging
* Distributed tracing
* Cloud deployment

---

# 35. Conclusion

The Distributed Job Scheduler demonstrates the core engineering concepts required for a reliable distributed task-processing platform.

The system combines:

```text
Authentication
      |
      v
Organizations
      |
      v
Projects
      |
      v
Queues
      |
      v
Jobs
      |
      v
Workers
      |
      v
Execution
      |
      v
Retry
      |
      v
Dead Letter Queue
      |
      v
Monitoring & Metrics
```

The project demonstrates:

* Distributed systems
* Backend engineering
* Relational database design
* REST API development
* Asynchronous job processing
* Worker concurrency
* Job scheduling
* Retry mechanisms
* Fault handling
* Dead Letter Queue management
* Monitoring and observability
* Full-stack development

---

# Author

**Distributed Job Scheduler Project**

Developed as an internship/engineering assignment demonstrating distributed job scheduling, reliable asynchronous execution, database design, backend engineering, concurrency, fault tolerance, monitoring, and full-stack development.
