import cron, { ScheduledTask } from 'node-cron';
import { cronConfig } from './cronConfig';
import cronJobs from './jobs';

/**
 * Options for configuring a cron job.
 */
export interface JobOptions {
    timezone?: string;
}

/**
 * Represents a cron job definition.
 */
export interface Job {
    name: string;
    schedule: string;
    action: () => Promise<void>;
    options?: JobOptions;
}

/**
 * Represents an instance of a running cron job.
 */
export interface JobInstance {
    task: ScheduledTask;
    schedule: string;
    action: () => Promise<void>;
    options?: JobOptions;
}

/**
 * Manages cron jobs using the node-cron library.
 * Provides methods to register, update, stop, and retrieve information about scheduled tasks.
 */
export class CronManager {
    private jobs: Map<string, JobInstance> = new Map();
    private static instance: CronManager;
    private constructor() {
        for (const job of cronJobs) {
            this.addJob(job.name, job.schedule, job.action, job.options);
        }
    }

    public static getInstance(): CronManager {
        if (!CronManager.instance) {
            CronManager.instance = new CronManager();
        }
        return CronManager.instance;
    }

    /**
     * Registers a new cron job or updates an existing one with the same name.
     * @param name - The unique name of the job.
     * @param schedule - The cron schedule string (e.g., '* * * * *' for every minute).
     * @param action - The asynchronous function to execute when the schedule triggers.
     * @param options - Optional configuration for the job, such as timezone.
     * @returns True if the job was successfully registered, false otherwise.
     */
    private addJob(
        name: string,
        schedule: string,
        action: () => Promise<void>,
        options: JobOptions = {},
    ): boolean {
        if (this.jobs.has(name)) {
            const existingJob = this.jobs.get(name);
            if (existingJob) {
                existingJob.task.stop();
            }
        }

        try {
            cron.validate(schedule);
        } catch (error) {
            return false;
        }

        const task = cron.schedule(
            schedule,
            async () => {
                try {
                    await action();
                } catch (error) {}
            },
            {
                scheduled: true,
                timezone: options.timezone || cronConfig.defaultTimezone,
            },
        );

        this.jobs.set(name, { task, schedule, action, options });
        return true;
    }

    /**
     * Registers a dynamic cron job with validation for the action.
     * @param name - The unique name of the job.
     * @param schedule - The cron schedule string.
     * @param action - The asynchronous function to execute.
     * @param options - Optional configuration for the job.
     * @returns True if the job was successfully registered, false if the action is invalid or registration fails.
     */
    public registerJob(
        name: string,
        schedule: string,
        action: () => Promise<void>,
        options: JobOptions = {},
    ): boolean {
        if (!action || typeof action !== 'function') {
            return false;
        }
        return this.addJob(name, schedule, action, options);
    }

    /**
     * Updates the schedule of an existing cron job.
     * @param name - The name of the job to update.
     * @param newSchedule - The new cron schedule string.
     * @returns True if the job's schedule was updated successfully, false if the job doesn't exist or the schedule is invalid.
     */
    public updateJobSchedule(name: string, newSchedule: string): boolean {
        if (!this.jobs.has(name)) {
            return false;
        }

        try {
            cron.validate(newSchedule);
        } catch (error) {
            return false;
        }

        const job = this.jobs.get(name)!;
        job.task.stop();

        const newTask = cron.schedule(
            newSchedule,
            async () => {
                try {
                    await job.action();
                } catch (error) {}
            },
            {
                scheduled: true,
                timezone: job.options?.timezone || cronConfig.defaultTimezone,
            },
        );

        this.jobs.set(name, { ...job, task: newTask, schedule: newSchedule });
        return true;
    }

    /**
     * Stops and removes a specific cron job.
     * @param name - The name of the job to stop.
     */
    public stopJob(name: string): void {
        if (this.jobs.has(name)) {
            const job = this.jobs.get(name);
            if (job) {
                job.task.stop();
            }
            this.jobs.delete(name);
        }
    }

    /**
     * Stops and removes all cron jobs.
     */
    public stopAllJobs(): void {
        for (const [name] of this.jobs) {
            this.stopJob(name);
        }
    }

    /**
     * Retrieves the names of all currently registered cron jobs.
     * @returns An array of job names.
     */
    public getJobs(): string[] {
        return Array.from(this.jobs.keys());
    }

    /**
     * Retrieves detailed information about a specific cron job.
     * @param name - The name of the job to query.
     * @returns The JobInstance object containing job details, or null if the job doesn't exist.
     */
    public getJobInfo(name: string): JobInstance | null {
        return this.jobs.get(name) || null;
    }
}
