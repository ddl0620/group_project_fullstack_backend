import { Agenda } from 'agenda';
import { cronConfig } from './cronConfig';
import cronJobs from './jobs';
import { notifyUpcommingEvent } from './action/commonActions';

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
    action: (...args: any[]) => Promise<void>;
    options?: JobOptions;
}

/**
 * Represents an instance of a running cron job.
 */
export interface JobInstance {
    schedule: string | undefined;
    action: (...args: any[]) => Promise<void>;
    options?: JobOptions;
    data?: any;
}

/**
 * Manages cron jobs using the Agenda library.
 * Provides methods to register, update, stop, and retrieve information about scheduled tasks.
 */
export class CronManager {
    private jobs: Map<string, JobInstance> = new Map();
    private agenda: Agenda;
    private static instance: CronManager;
    private isReady: boolean = false;
    private actionMap: Map<string, (...args: any[]) => Promise<void>> = new Map();

    private constructor() {
        this.agenda = new Agenda({
            db: { address: cronConfig.mongoUri, collection: 'jobs' },
            processEvery: cronConfig.processEvery,
            defaultConcurrency: cronConfig.defaultConcurrency,
            defaultLockLifetime: cronConfig.defaultLockLifetime,
        });

        this.agenda.on('ready', async () => {
            console.log('Agenda đã kết nối thành công đến MongoDB!');
            this.isReady = true;

            // Điền actionMap từ cronJobs
            for (const job of cronJobs) {
                this.actionMap.set(job.name, job.action);
            }

            // Tải các công việc đã lưu trong database
            const existingJobs = await this.agenda.jobs({});
            for (const job of existingJobs) {
                const name = job.attrs.name;
                const schedule = job.attrs.repeatInterval || job.attrs.nextRunAt?.toISOString();
                const data = job.attrs.data || {};

                // Lấy action từ actionMap hoặc ánh xạ động
                let action: (...args: any[]) => Promise<void>;
                if (this.actionMap.has(name)) {
                    action = this.actionMap.get(name)!;
                } else if (name.startsWith('event-')) {
                    // Ánh xạ action cho các công việc event-...
                    action = notifyUpcommingEvent;
                    this.actionMap.set(name, action);
                } else {
                    action = async (data: any) => {
                        console.log(`Thực thi công việc đã lưu ${name} với dữ liệu:`, data);
                    };
                }

                // Định nghĩa lại công việc để Agenda có thể thực thi
                this.agenda.define(name, { priority: 0, concurrency: 1 }, async (job: any) => {
                    try {
                        await action(job.attrs.data);
                    } catch (error) {
                        console.error(`Lỗi khi thực thi công việc ${name}:`, error);
                    }
                });

                this.jobs.set(name, {
                    schedule,
                    action: () => action(data),
                    options: { timezone: cronConfig.defaultTimezone },
                    data,
                });
                console.log(`Đã tải công việc từ database: ${name}, lịch trình: ${schedule}`);
            }

            // Đăng ký các công việc từ cronJobs (nếu chưa tồn tại)
            for (const job of cronJobs) {
                if (!this.jobs.has(job.name)) {
                    await this.addJob(job.name, job.schedule, job.action, job.options);
                }
            }

            await this.agenda.start();
            console.log('Agenda đã khởi động!');
        });

        this.agenda.on('error', err => {
            console.error('Lỗi kết nối MongoDB:', err);
            this.isReady = false;
            throw new Error('Không thể kết nối đến MongoDB. Vui lòng kiểm tra URI và mạng.');
        });

        this.agenda.on('fail', (err, job) => {
            console.error(`Công việc ${job.attrs.name} thất bại:`, err);
        });

        this.agenda.on('start', job => {
            console.log(`Công việc ${job.attrs.name} bắt đầu chạy vào ${new Date()}`);
        });

        this.agenda.on('complete', job => {
            console.log(`Công việc ${job.attrs.name} đã hoàn thành vào ${new Date()}`);
        });
    }

    public static getInstance(): CronManager {
        if (!CronManager.instance) {
            CronManager.instance = new CronManager();
        }
        return CronManager.instance;
    }

    private async waitForReady(): Promise<void> {
        if (this.isReady) return;
        return new Promise((resolve, reject) => {
            this.agenda.on('ready', () => {
                this.isReady = true;
                resolve();
            });
            this.agenda.on('error', err => {
                reject(new Error(`Agenda không sẵn sàng: ${err.message}`));
            });
        });
    }

    private async addJob(
        name: string,
        schedule: string,
        action: (...args: any[]) => Promise<void>,
        options: JobOptions = {},
        data: any = {},
    ): Promise<boolean> {
        await this.waitForReady();

        this.actionMap.set(name, action);

        this.agenda.define(name, { priority: 0, concurrency: 1 }, async (job: any) => {
            try {
                await action(job.attrs.data);
            } catch (error) {
                console.error(`Lỗi khi thực thi công việc ${name}:`, error);
            }
        });

        try {
            await this.agenda.every(schedule, name, data, {
                timezone: options.timezone || cronConfig.defaultTimezone,
            });
            this.jobs.set(name, { schedule, action: () => action(data), options, data });
            return true;
        } catch (error) {
            console.error(`Lỗi khi lập lịch công việc ${name}:`, error);
            return false;
        }
    }

    public async registerJob(
        name: string,
        schedule: string,
        action: (...args: any[]) => Promise<void>,
        options: JobOptions = {},
        data: any = {},
    ): Promise<boolean> {
        if (!action || typeof action !== 'function') {
            return false;
        }
        return this.addJob(name, schedule, action, options, data);
    }

    public async updateJobSchedule(name: string, newSchedule: string): Promise<boolean> {
        await this.waitForReady();

        if (!this.jobs.has(name)) {
            return false;
        }

        const job = this.jobs.get(name)!;
        const data = job.data;

        await this.agenda.cancel({ name });

        const action =
            this.actionMap.get(name) ||
            (async (data: any) => {
                console.log(`Thực thi công việc ${name} với dữ liệu:`, data);
            });

        this.agenda.define(name, { priority: 0, concurrency: 1 }, async (job: any) => {
            try {
                await action(job.attrs.data);
            } catch (error) {
                console.error(`Lỗi khi thực thi công việc ${name}:`, error);
            }
        });

        try {
            await this.agenda.every(newSchedule, name, data, {
                timezone: job.options?.timezone || cronConfig.defaultTimezone,
            });
            this.jobs.set(name, {
                schedule: newSchedule,
                action: () => action(data),
                options: job.options,
                data,
            });
            return true;
        } catch (error) {
            console.error(`Lỗi khi cập nhật lịch công việc ${name}:`, error);
            return false;
        }
    }

    public async stopJob(name: string): Promise<void> {
        if (this.jobs.has(name)) {
            await this.agenda.cancel({ name });
            this.jobs.delete(name);
            this.actionMap.delete(name);
        }
    }

    public async stopAllJobs(): Promise<void> {
        for (const name of this.jobs.keys()) {
            await this.stopJob(name);
        }
    }

    public getJobs(): string[] {
        return Array.from(this.jobs.keys());
    }

    public getJobInfo(name: string): JobInstance | null {
        return this.jobs.get(name) || null;
    }

    public async shutdown(): Promise<void> {
        await this.agenda.stop();
        await this.agenda.close();
    }
}
