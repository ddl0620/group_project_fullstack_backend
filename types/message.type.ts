export interface SendMessageInput {
    content: string;
    event_id: string;
    sender_id: string;
}

// Kiểu dữ liệu cho dữ liệu đầu vào khi đánh dấu tin nhắn đã xem
export interface MarkMessageAsSeenInput {
    message_id: string;
    user_id: string;
}

// Kiểu dữ liệu cho phản hồi của markMessageAsSeen
export interface MarkMessageAsSeenResponse {
    seenUsers: any[];
    eventId: string;
}