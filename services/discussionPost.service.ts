import { DiscussionPostInterface } from "../interfaces/discussionPost.interface";
import { DiscussionPostModel } from "../models/discussionPost.model";

export class DiscussionPostService{
    static async createPost(data: DiscussionPostInterface): Promise<DiscussionPostInterface>{
        return await DiscussionPostModel.create(data);
    }

    /*
    Hàm getPosts sử dụng phân trang (pagination) để trả về danh sách bài viết (DiscussionPost) thuộc một sự kiện (event_id). Dưới đây là giải thích chi tiết về cách hoạt động của tham số page và logic trong hàm:

    1. Tham Số page Là Gì?
    page: Là số thứ tự của trang mà bạn muốn lấy dữ liệu.

    Ví dụ:
    page = 1: Lấy dữ liệu của trang đầu tiên.
    page = 2: Lấy dữ liệu của trang thứ hai.
    limit: Là số lượng bài viết tối đa mà bạn muốn trả về trong một trang.

    Ví dụ:
    limit = 10: Mỗi trang sẽ chứa tối đa 10 bài viết.

    2. Cách Hoạt Động của Phân Trang
    Phân trang được thực hiện bằng cách sử dụng hai tham số:

    skip: Bỏ qua một số lượng bài viết đầu tiên (tính từ đầu danh sách).

    Công thức:
    page = 1: skip = (1 - 1) * limit = 0 (không bỏ qua bài viết nào, lấy từ bài viết đầu tiên).
    page = 2: skip = (2 - 1) * limit = limit (bỏ qua limit bài viết đầu tiên, bắt đầu từ bài viết thứ limit + 1).
    limit: Giới hạn số lượng bài viết trả về.

    MongoDB sẽ chỉ trả về tối đa limit bài viết sau khi đã bỏ qua skip bài viết đầu tiên.
    */
    static async getPosts(event_id: string, page: number, limit: number): Promise<DiscussionPostInterface[]> {
        const skip = (page - 1) * limit;
        return await DiscussionPostModel.find({ event_id })
            .populate("creator_id", "username")
            .skip(skip)
            .limit(limit)
            .sort({ created_at: -1 });
    }

    static async getPostById(post_id: string): Promise<DiscussionPostInterface | null> {
        return await DiscussionPostModel.findById(post_id).populate("creator_id", "username");
    }

    static async updatePost(
        post_id: string,
        updateData: Partial<DiscussionPostInterface>
    ): Promise<DiscussionPostInterface | null> {
        return await DiscussionPostModel.findByIdAndUpdate(post_id, updateData, { new: true, runValidators: true });
    }

    static async deletePost(post_id: string): Promise<DiscussionPostInterface | null> {
        return await DiscussionPostModel.findByIdAndDelete(post_id);
    }
}