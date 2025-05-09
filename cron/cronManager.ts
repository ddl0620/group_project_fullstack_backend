import cron, { ScheduledTask } from 'node-cron';
// import logger from '../utils/logger';
import { cronConfig } from './cronConfig';
import cronJobs from './jobs';

export interface JobOptions {
  timezone?: string;
}

export interface Job {
  name: string;
  schedule: string;
  action: () => Promise<void>;
  options?: JobOptions;
}

export interface JobInstance {
  task: ScheduledTask;
  schedule: string;
  action: () => Promise<void>;
  options?: JobOptions;
}

class CronManager {
  private jobs: Map<string, JobInstance> = new Map();

  // Đăng ký một CRON job (tĩnh hoặc động)
  public registerJob(name: string, schedule: string, action: () => Promise<void>, options: JobOptions = {}): boolean {
    if (this.jobs.has(name)) {
      // logger.warn(`Job ${name} already exists. Overwriting...`);
      const existingJob = this.jobs.get(name);
      if (existingJob) {
        (existingJob.task as any).destroy(); // Type assertion tạm thời
      }
    }

    try {
      cron.validate(schedule); // Kiểm tra định dạng schedule
    } catch (error) {
      // logger.error(`Invalid schedule for job ${name}: ${schedule}`);
      return false;
    }

    const task = cron.schedule(
      schedule,
      async () => {
        try {
          // logger.info(`Running job: ${name} at ${new Date().toISOString()}`);
          await action();
        } catch (error) {
          // logger.error(`Error in job ${name}: ${(error as Error).message}`);
        }
      },
      {
        scheduled: true,
        timezone: options.timezone || cronConfig.defaultTimezone,
      }
    );

    this.jobs.set(name, { task, schedule, action, options });
    // logger.info(`Registered job: ${name} with schedule ${schedule}`);
    return true;
  }

  // Đăng ký job động (gọi trực tiếp bằng hàm)
  public registerDynamicJob(name: string, schedule: string, action: () => Promise<void>, options: JobOptions = {}): boolean {
    if (!action || typeof action !== 'function') {
      // logger.error(`Invalid action for job ${name}`);
      return false;
    }
    return this.registerJob(name, schedule, action, options);
  }

  // Cập nhật schedule của một job
  public updateJobSchedule(name: string, newSchedule: string): boolean {
    if (!this.jobs.has(name)) {
      // logger.error(`Job ${name} does not exist.`);
      return false;
    }

    try {
      cron.validate(newSchedule); // Kiểm tra định dạng schedule
    } catch (error) {
      // logger.error(`Invalid new schedule for job ${name}: ${newSchedule}`);
      return false;
    }

    const job = this.jobs.get(name)!;
    (job.task as any).destroy(); // Type assertion tạm thời

    const newTask = cron.schedule(
      newSchedule,
      async () => {
        try {
          // logger.info(`Running job: ${name} at ${new Date().toISOString()}`);
          await job.action();
        } catch (error) {
          // logger.error(`Error in job ${name}: ${(error as Error).message}`);
        }
      },
      {
        scheduled: true,
        timezone: job.options?.timezone || cronConfig.defaultTimezone,
      }
    );

    this.jobs.set(name, { ...job, task: newTask, schedule: newSchedule });
    // logger.info(`Updated schedule for job ${name} to ${newSchedule}`);
    return true;
  }

  // Dừng một job
  public stopJob(name: string): void {
    if (this.jobs.has(name)) {
      const job = this.jobs.get(name);
      if (job) {
        (job.task as any).destroy(); // Type assertion tạm thời
      }
      this.jobs.delete(name);
      // logger.info(`Stopped job: ${name}`);
    }
  }

  // Dừng tất cả jobs
  public stopAllJobs(): void {
    for (const [name] of this.jobs) {
      this.stopJob(name);
    }
  }

  // Lấy danh sách jobs
  public getJobs(): string[] {
    return Array.from(this.jobs.keys());
  }

  // Lấy thông tin job
  public getJobInfo(name: string): JobInstance | null {
    return this.jobs.get(name) || null;
  }

  // Khởi động jobs từ cấu hình tĩnh
  public init(): void {
    for (const job of cronJobs) {
      this.registerJob(job.name, job.schedule, job.action, job.options);
    }
  }
}

export default new CronManager();