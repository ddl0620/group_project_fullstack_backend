import { DB_URI } from '../config/env';

export const cronConfig = {
    // Mặc định múi giờ cho các công việc
    defaultTimezone: 'Asia/Ho_Chi_Minh',

    // URL kết nối MongoDB cho Agenda
    mongoUri: (DB_URI as string) || 'mongodb://localhost:27017/agenda_db',

    // Tần suất Agenda kiểm tra công việc mới (mặc định 1 giây)
    processEvery: '1 second',

    // Số lượng công việc tối đa chạy đồng thời
    defaultConcurrency: 5,

    // Thời gian khóa tối đa cho một công việc (mặc định 10 phút)
    defaultLockLifetime: 600000, // 10 phút (tính bằng mili giây)

    // Các lịch trình mẫu (cron expressions)
    schedules: {
        daily: '0 8 * * *', // 8:00 mỗi ngày
        weekly: '0 0 * * 0', // 00:00 Chủ nhật
        hourly: '0 * * * *', // Mỗi giờ
        everyMinute: '* * * * *', // Mỗi phút (cho test)
    },
};
