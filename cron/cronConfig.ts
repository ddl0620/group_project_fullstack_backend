export const cronConfig = {
    defaultTimezone: 'Asia/Ho_Chi_Minh',
    schedules: {
      daily: '0 8 * * *', // 8:00 mỗi ngày
      weekly: '0 0 * * 0', // 00:00 Chủ nhật
      hourly: '0 * * * *', // Mỗi giờ
      everyMinute: '* * * * *', // Mỗi phút (cho test)
    },
};