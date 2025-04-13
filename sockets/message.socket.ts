import { Server, Socket } from "socket.io";
import MessageService from "../services/message.service";

export default function messageSocket(io: Server) {
    io.on("connection", (socket: Socket) => {
        console.log("User connected:", socket.id);

        // Tham gia phòng event
        socket.on("join_event", (event_id: string) => {
            socket.join(event_id);
            console.log(`Socket ${socket.id} joined event ${event_id}`);
        });

        // Rời phòng event
        socket.on("leave_event", (event_id: string) => {
            socket.leave(event_id);
            console.log(`Socket ${socket.id} left event ${event_id}`);
        });

        // Nhận và broadcast tin nhắn
        socket.on("send_message", async (data) => {
            const { content, event_id, sender_id } = data;

            const message = await MessageService.createMessage(content, event_id, sender_id);

            // Gửi tin nhắn đến tất cả client trong event đó
            io.to(event_id).emit("new_message", message);
        });

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });
}
