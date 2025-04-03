export interface ExamInterface extends Document {
    examId: string; // Mã đề
    content: string; // Đường dẫn đến file PDF
    answers: {
        [questionId: string]: string
    }; // Đáp án để chấm điểm
    createdAt: Date;
}