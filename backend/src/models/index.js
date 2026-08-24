const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const uuid = {
  type: DataTypes.UUID,
  defaultValue: DataTypes.UUIDV4,
  primaryKey: true,
};

const User = sequelize.define(
  "User",
  {
    id: uuid,

    email: {
      type: DataTypes.STRING(320),
      unique: true,
      allowNull: false,
    },

    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "password_hash",
    },

    fullName: {
      type: DataTypes.STRING(150),
      allowNull: false,
      field: "full_name",
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: "is_active",
    },
  },
  {
    tableName: "users",
  }
);

const Organization = sequelize.define(
  "Organization",
  {
    id: uuid,

    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },

    slug: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false,
    },
  },
  {
    tableName: "organizations",
    updatedAt: false,
  }
);

const OrganizationMember = sequelize.define(
  "OrganizationMember",
  {
    id: uuid,

    organizationId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "organization_id",
    },

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "user_id",
    },

    role: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "member",
    },
  },
  {
    tableName: "organization_members",
    updatedAt: false,
    indexes: [
      {
        unique: true,
        fields: ["organization_id", "user_id"],
      },
    ],
  }
);

const Project = sequelize.define(
  "Project",
  {
    id: uuid,

    organizationId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "organization_id",
    },

    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "created_by",
    },

    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: "is_active",
    },
  },
  {
    tableName: "projects",
  }
);

const RetryPolicy = sequelize.define(
  "RetryPolicy",
  {
    id: uuid,

    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    strategy: {
      type: DataTypes.ENUM("FIXED", "LINEAR", "EXPONENTIAL"),
      allowNull: false,
    },

    maxRetries: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3,
      field: "max_retries",
    },

    initialDelaySeconds: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
      field: "initial_delay_seconds",
    },

    maxDelaySeconds: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3600,
      field: "max_delay_seconds",
    },
  },
  {
    tableName: "retry_policies",
  }
);

const Queue = sequelize.define(
  "Queue",
  {
    id: uuid,

    projectId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "project_id",
    },

    retryPolicyId: {
      type: DataTypes.UUID,
      field: "retry_policy_id",
    },

    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    priority: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    concurrencyLimit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      field: "concurrency_limit",
    },

    isPaused: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "is_paused",
    },
  },
  {
    tableName: "queues",
    indexes: [
      {
        unique: true,
        fields: ["project_id", "name"],
      },
    ],
  }
);

const Worker = sequelize.define(
  "Worker",
  {
    id: uuid,

    projectId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "project_id",
    },

    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    hostname: {
      type: DataTypes.STRING(255),
    },

    status: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: "offline",
    },

    concurrency: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },

    lastHeartbeatAt: {
      type: DataTypes.DATE,
      field: "last_heartbeat_at",
    },

    startedAt: {
      type: DataTypes.DATE,
      field: "started_at",
    },

    stoppedAt: {
      type: DataTypes.DATE,
      field: "stopped_at",
    },
  },
  {
    tableName: "workers",
    updatedAt: false,
  }
);

const WorkerHeartbeat = sequelize.define(
  "WorkerHeartbeat",
  {
    id: uuid,

    workerId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "worker_id",
    },

    recordedAt: {
      type: DataTypes.DATE,
      field: "recorded_at",
      defaultValue: DataTypes.NOW,
    },

    activeJobs: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "active_jobs",
    },

    metadata: {
      type: DataTypes.JSONB,
      field: "metadata",
    },
  },
  {
    tableName: "worker_heartbeats",
    createdAt: false,
    updatedAt: false,
  }
);

const Job = sequelize.define(
  "Job",
  {
    id: uuid,

    queueId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "queue_id",
    },

    jobType: {
      type: DataTypes.STRING(150),
      allowNull: false,
      field: "job_type",
    },

    payload: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },

    status: {
      type: DataTypes.ENUM(
        "QUEUED",
        "SCHEDULED",
        "CLAIMED",
        "RUNNING",
        "COMPLETED",
        "FAILED"
      ),
      allowNull: false,
      defaultValue: "QUEUED",
    },

    priority: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    maxAttempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3,
      field: "max_attempts",
    },

    attemptCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "attempt_count",
    },

    scheduledAt: {
      type: DataTypes.DATE,
      field: "scheduled_at",
    },

    claimedAt: {
      type: DataTypes.DATE,
      field: "claimed_at",
    },

    startedAt: {
      type: DataTypes.DATE,
      field: "started_at",
    },

    completedAt: {
      type: DataTypes.DATE,
      field: "completed_at",
    },

    failedAt: {
      type: DataTypes.DATE,
      field: "failed_at",
    },

    lastError: {
      type: DataTypes.TEXT,
      field: "last_error",
    },

    idempotencyKey: {
      type: DataTypes.STRING(255),
      field: "idempotency_key",
    },
  },
  {
    tableName: "jobs",
    indexes: [
      {
        fields: ["queue_id", "status", "scheduled_at", "priority"],
      },
    ],
  }
);

const JobExecution = sequelize.define(
  "JobExecution",
  {
    id: uuid,

    jobId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "job_id",
    },

    workerId: {
      type: DataTypes.UUID,
      field: "worker_id",
    },

    attemptNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "attempt_number",
    },

    status: {
      type: DataTypes.ENUM(
        "CLAIMED",
        "RUNNING",
        "COMPLETED",
        "FAILED"
      ),
      allowNull: false,
    },

    startedAt: {
      type: DataTypes.DATE,
      field: "started_at",
    },

    finishedAt: {
      type: DataTypes.DATE,
      field: "finished_at",
    },

    durationMs: {
      type: DataTypes.INTEGER,
      field: "duration_ms",
    },

    errorMessage: {
      type: DataTypes.TEXT,
      field: "error_message",
    },

    result: {
      type: DataTypes.JSONB,
    },
  },
  {
    tableName: "job_executions",
  }
);

const JobLog = sequelize.define(
  "JobLog",
  {
    id: uuid,

    jobId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "job_id",
    },

    executionId: {
      type: DataTypes.UUID,
      field: "execution_id",
    },

    level: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "INFO",
    },

    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "job_logs",
  }
);

const ScheduledJob = sequelize.define(
  "ScheduledJob",
  {
    id: uuid,

    jobId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      field: "job_id",
    },

    runAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "run_at",
    },

    cronExpression: {
      type: DataTypes.STRING(150),
      field: "cron_expression",
    },

    timezone: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: "UTC",
    },

    isRecurring: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "is_recurring",
    },

    nextRunAt: {
      type: DataTypes.DATE,
      field: "next_run_at",
    },
  },
  {
    tableName: "scheduled_jobs",
    updatedAt: false,
  }
);

const DeadLetterQueue = sequelize.define(
  "DeadLetterQueue",
  {
    id: uuid,

    jobId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      field: "job_id",
    },

    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    finalError: {
      type: DataTypes.TEXT,
      field: "final_error",
    },

    failedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "failed_at",
    },

    resolvedAt: {
      type: DataTypes.DATE,
      field: "resolved_at",
    },
  },
  {
    tableName: "dead_letter_queue",

    // IMPORTANT:
    // The database table does not contain updated_at.
    // Therefore Sequelize must not expect it.
    updatedAt: false,
  }
);

// ============================================================
// ASSOCIATIONS
// ============================================================

User.belongsToMany(Organization, {
  through: OrganizationMember,
  foreignKey: "userId",
  otherKey: "organizationId",
});

Organization.belongsToMany(User, {
  through: OrganizationMember,
  foreignKey: "organizationId",
  otherKey: "userId",
});

OrganizationMember.belongsTo(User, {
  foreignKey: "userId",
});

OrganizationMember.belongsTo(Organization, {
  foreignKey: "organizationId",
});

Organization.hasMany(Project, {
  foreignKey: "organizationId",
});

Project.belongsTo(Organization, {
  foreignKey: "organizationId",
});

Project.belongsTo(User, {
  as: "creator",
  foreignKey: "createdBy",
});

Project.hasMany(Queue, {
  foreignKey: "projectId",
});

Project.hasMany(Worker, {
  foreignKey: "projectId",
});

Queue.belongsTo(Project, {
  foreignKey: "projectId",
});

Queue.belongsTo(RetryPolicy, {
  foreignKey: "retryPolicyId",
  as: "retryPolicy",
});

Queue.hasMany(Job, {
  foreignKey: "queueId",
});

RetryPolicy.hasMany(Queue, {
  foreignKey: "retryPolicyId",
});

Worker.belongsTo(Project, {
  foreignKey: "projectId",
});

Worker.hasMany(WorkerHeartbeat, {
  foreignKey: "workerId",
});

Worker.hasMany(JobExecution, {
  foreignKey: "workerId",
});

WorkerHeartbeat.belongsTo(Worker, {
  foreignKey: "workerId",
});

Job.belongsTo(Queue, {
  foreignKey: "queueId",
});

Job.hasMany(JobExecution, {
  foreignKey: "jobId",
});

Job.hasMany(JobLog, {
  foreignKey: "jobId",
});

JobExecution.belongsTo(Job, {
  foreignKey: "jobId",
});

JobExecution.belongsTo(Worker, {
  foreignKey: "workerId",
});

JobLog.belongsTo(Job, {
  foreignKey: "jobId",
});

Job.belongsTo(ScheduledJob, {
  foreignKey: "jobId",
  as: "scheduledJob",
});

ScheduledJob.belongsTo(Job, {
  foreignKey: "jobId",
});

Job.belongsTo(DeadLetterQueue, {
  foreignKey: "jobId",
  as: "deadLetterEntry",
});

DeadLetterQueue.belongsTo(Job, {
  foreignKey: "jobId",
});

module.exports = {
  sequelize,
  User,
  Organization,
  OrganizationMember,
  Project,
  RetryPolicy,
  Queue,
  Worker,
  WorkerHeartbeat,
  Job,
  JobExecution,
  JobLog,
  ScheduledJob,
  DeadLetterQueue,
};