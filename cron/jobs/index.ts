import {Job} from "../cronManager";
import { cronConfig } from '../cronConfig';

// Job tĩnh: Gửi email hàng ngày
const sendDailyEmail = async (): Promise<void> => {
  console.log('Sending daily email...');
  // Logic gửi email
};

// Job tĩnh: Xóa log mỗi tuần
const cleanOldLogs = async (): Promise<void> => {
    console.log('Cleaning old logs...');
  // Logic xóa log
};

const cronJobs: Job[] = [
  {
    name: 'sendDailyEmail',
    schedule: cronConfig.schedules.daily,
    action: sendDailyEmail,
    options: { timezone: cronConfig.defaultTimezone },
  },
  {
    name: 'cleanOldLogs',
    schedule: cronConfig.schedules.weekly,
    action: cleanOldLogs,
    options: { timezone: cronConfig.defaultTimezone },
  },
];

export default cronJobs;