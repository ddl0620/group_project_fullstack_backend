export interface OverviewStats {
    totalUsers: number;
    activeUsers: number;
    totalDiscussionPosts: number;
    activeDiscussionPosts: number;
    totalEvents: number;
    deletedEvents: number;
    lastWeek: {
        totalUsers: number;
        activeUsers: number;
        totalDiscussionPosts: number;
        activeDiscussionPosts: number;
        totalEvents: number;
        deletedEvents: number;
    };
}

export interface EventsByDate {
    date: string;
    count: number;
}

export interface UsersByDate {
    date: string;
    count: number;
}

export interface DeletedUsersByDate {
    date: string;
    count: number;
}