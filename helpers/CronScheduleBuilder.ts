import cron from 'node-cron';

export class CronScheduleBuilder {
    private _minute: string = '*';
    private _hour: string = '*';
    private _dayOfMonth: string = '*';
    private _month: string = '*';
    private _dayOfWeek: string = '*';

    // Set minute (0-59) or interval (e.g., every 5 minutes)
    public minute(value: number | 'every' | number): CronScheduleBuilder {
        if (value === 'every') {
            this._minute = '*/1';
        } else if (typeof value === 'number') {
            if (value < 0 || value > 59) {
                throw new Error(`Minute must be between 0 and 59, got ${value}`);
            }
            this._minute = value.toString();
        } else {
            throw new Error(`Invalid minute value: ${value}`);
        }
        return this;
    }

    // Set minute interval (e.g., every 5 minutes)
    public everyMinute(interval: number): CronScheduleBuilder {
        if (interval < 1 || interval > 59) {
            throw new Error(`Minute interval must be between 1 and 59, got ${interval}`);
        }
        this._minute = `*/${interval}`;
        return this;
    }

    // Set hour (0-23) or interval
    public hour(value: number | 'every'): CronScheduleBuilder {
        if (value === 'every') {
            this._hour = '*/1';
        } else if (typeof value === 'number') {
            if (value < 0 || value > 23) {
                throw new Error(`Hour must be between 0 and 23, got ${value}`);
            }
            this._hour = value.toString();
        } else {
            throw new Error(`Invalid hour value: ${value}`);
        }
        return this;
    }

    // Set hour interval
    public everyHour(interval: number): CronScheduleBuilder {
        if (interval < 1 || interval > 23) {
            throw new Error(`Hour interval must be between 1 and 23, got ${interval}`);
        }
        this._hour = `*/${interval}`;
        return this;
    }

    // Set day of month (1-31)
    public dayOfMonth(value: number | 'every'): CronScheduleBuilder {
        if (value === 'every') {
            this._dayOfMonth = '*';
        } else if (typeof value === 'number') {
            if (value < 1 || value > 31) {
                throw new Error(`Day of month must be between 1 and 31, got ${value}`);
            }
            this._dayOfMonth = value.toString();
        } else {
            throw new Error(`Invalid day of month value: ${value}`);
        }
        return this;
    }

    // Set month (1-12)
    public month(value: number | 'every'): CronScheduleBuilder {
        if (value === 'every') {
            this._month = '*';
        } else if (typeof value === 'number') {
            if (value < 1 || value > 12) {
                throw new Error(`Month must be between 1 and 12, got ${value}`);
            }
            this._month = value.toString();
        } else {
            throw new Error(`Invalid month value: ${value}`);
        }
        return this;
    }

    // Set day of week (0-7, where 0 and 7 are Sunday)
    public dayOfWeek(value: number | 'every'): CronScheduleBuilder {
        if (value === 'every') {
            this._dayOfWeek = '*';
        } else if (typeof value === 'number') {
            if (value < 0 || value > 7) {
                throw new Error(`Day of week must be between 0 and 7, got ${value}`);
            }
            this._dayOfWeek = value.toString();
        } else {
            throw new Error(`Invalid day of week value: ${value}`);
        }
        return this;
    }

    // Build the cron schedule string
    public build(): string {
        const cronString = `${this._minute} ${this._hour} ${this._dayOfMonth} ${this._month} ${this._dayOfWeek}`;

        // Validate using node-cron
        try {
            cron.validate(cronString);
            return cronString;
        } catch (error) {
            throw new Error(`Invalid cron schedule: ${cronString}. Error: ${error}`);
        }
    }
}

export default CronScheduleBuilder;
