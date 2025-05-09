// import logger from '../../utils/logger';

// Danh sách các action có sẵn
const predefinedActions: Record<string, () => Promise<void>> = {
    sendEmail: async () => {
    // logger.info('Executing sendEmail action');
    console.log('Sending email...');
    // Thêm logic gửi email (ví dụ: nodemailer)
  },
  cleanLogs: async () => {
    // logger.info('Executing cleanLogs action');
    console.log('Cleaning old logs...');
    // Thêm logic xóa log
  },
  sendNotification: async () => {
    // logger.info('Executing sendNotification action');
    console.log('Sending notification...');
    // Thêm logic gửi thông báo
  },
};

// Lấy action theo tên
export const getActionByName = (actionName: string): (() => Promise<void>) | null => {
  return predefinedActions[actionName] || null;
};

// Lấy danh sách tên action
export const getAvailableActions = (): string[] => {
    return Object.keys(predefinedActions);
};