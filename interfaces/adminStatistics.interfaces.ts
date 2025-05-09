/**
 * Represents comprehensive statistics for the application dashboard overview
 * 
 * Contains metrics for users, discussion posts, and events, including both
 * current totals and historical data from the previous week for comparison.
 */
export interface OverviewStats {
    totalUsers: number;
    activeUsers: number;
    totalDiscussionPosts: number;
    activeDiscussionPosts: number;
    totalEvents: number;
    deletedEvents: number;
    /** 
     * Statistics from the previous week period for trend comparison 
     */
    lastWeek: {
        totalUsers: number;
        activeUsers: number;
        totalDiscussionPosts: number;
        activeDiscussionPosts: number;
        totalEvents: number;
        deletedEvents: number;
    };
}
/**
 * Represents event creation data aggregated by date
 * 
 * Used for time-series charts showing event creation trends over time.
 */
export interface EventsByDate {
    date: string;
    count: number;
}
/**
 * Represents user registration data aggregated by date
 * 
 * Used for time-series charts showing user growth trends over time.
 */
export interface UsersByDate {
    date: string;
    count: number;
}
/**
 * Represents user deletion data aggregated by date
 * 
 * Used for time-series charts showing user churn trends over time.
 */
export interface DeletedUsersByDate {
    date: string;
    count: number;
}