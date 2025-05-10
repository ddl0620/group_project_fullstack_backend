import { sub } from 'date-fns';
import CronScheduleBuilder from './CronScheduleBuilder'; // Adjust path as needed

// Enum as provided
export enum NOTIFY_WHEN {
    ONE_HOUR_BEFORE = 'ONE_HOUR_BEFORE',
    ONE_DAY_BEFORE = 'ONE_DAY_BEFORE',
    ONE_WEEK_BEFORE = 'ONE_WEEK_BEFORE',
    TWELVE_HOURS_BEFORE = 'TWELVE_HOURS_BEFORE',
    THREE_HOURS_BEFORE = 'THREE_HOURS_BEFORE', // Corrected from THREE_DAY_BEFORE
    NONE = 'NONE',
}

// Utility function to convert date, time, and notifyWhen to a cron schedule
export const convertToCronSchedule = (
    eventDate: Date,
    time: string | null = null, // Optional, format: HH:mm (e.g., "14:30")
    notifyWhen: NOTIFY_WHEN,
): string => {
    // If notifyWhen is NONE, return empty string
    if (notifyWhen === NOTIFY_WHEN.NONE) {
        return '';
    }

    // Validate time if provided
    if (time) {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
        if (!timeRegex.test(time)) {
            throw new Error('Invalid time format. Use HH:mm (e.g., "14:30").');
        }
    }

    // Create a new Date object with the event date
    const baseDate = new Date(eventDate);

    // Set time if provided, otherwise default to midnight (00:00)
    let hours = 0;
    let minutes = 0;
    if (time) {
        [hours, minutes] = time.split(':').map(Number);
    }
    baseDate.setHours(hours, minutes, 0, 0);

    // Calculate the notification date based on NOTIFY_WHEN
    let scheduledDate: Date;
    switch (notifyWhen) {
        case NOTIFY_WHEN.ONE_HOUR_BEFORE:
            scheduledDate = sub(baseDate, { hours: 1 });
            break;
        case NOTIFY_WHEN.ONE_DAY_BEFORE:
            scheduledDate = sub(baseDate, { days: 1 });
            break;
        case NOTIFY_WHEN.ONE_WEEK_BEFORE:
            scheduledDate = sub(baseDate, { weeks: 1 });
            break;
        case NOTIFY_WHEN.TWELVE_HOURS_BEFORE:
            scheduledDate = sub(baseDate, { hours: 12 });
            break;
        case NOTIFY_WHEN.THREE_HOURS_BEFORE:
            scheduledDate = sub(baseDate, { hours: 3 });
            break;
        default:
            throw new Error(`Invalid NOTIFY_WHEN value: ${notifyWhen}`);
    }

    // Ensure the scheduled date is in the future
    // if (scheduledDate <= new Date()) {
    //     throw new Error('Scheduled notification time is in the past.');
    // }

    // Use CronScheduleBuilder to create the cron expression

    console.log('Hours: ', scheduledDate.getHours());
    console.log('Minutes: ', scheduledDate.getMinutes());
    console.log('Date: ', scheduledDate.getDate());
    console.log('Month: ', scheduledDate.getMonth() + 1); // Months are 0-11 in JS Date
    console.log('Year: ', scheduledDate.getFullYear());
    console.log('Scheduled Date: ', scheduledDate);

    // Months are 1-12 in cron
    return new CronScheduleBuilder()
        .minute(scheduledDate.getMinutes())
        .hour(scheduledDate.getHours())
        .dayOfMonth(scheduledDate.getDate())
        .month(scheduledDate.getMonth() + 1)
        .build();
};
