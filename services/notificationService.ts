import { api } from './api';
import { API_ENDPOINTS } from '@/config/urls';

// Backend notification types
export interface Notification {
    _id: string;
    userId: string;
    title: string;
    message: string;
    type: 'challenge-received' | 'challenge-sent' | 'challenge-accepted' | 'challenge-rejected' | 'match-reminder' | 'general';
    relatedId?: string;
    read: boolean;
    createdAt: string;
    updatedAt: string;
    challengeDetails?: {
        isSingles: boolean;
        challengerId: string;
        challengerName: string;
        challengerPartnerId?: string;
        challengerPartnerName?: string;
    };
}

export const notificationService = {
    /**
     * Get all notifications for current user
     */
    getNotifications: async (): Promise<Notification[]> => {
        try {
            const response = await api.get<Notification[]>(
                API_ENDPOINTS.NOTIFICATION.LIST
            );
            return response.data;
        } catch (error) {
            console.error('Get notifications error:', error);
            throw error;
        }
    },

    /**
     * Mark a notification as read
     */
    markAsRead: async (notificationId: string): Promise<void> => {
        try {
            await api.put(API_ENDPOINTS.NOTIFICATION.MARK_READ(notificationId));
        } catch (error) {
            console.error('Mark notification as read error:', error);
            throw error;
        }
    },

    /**
     * Mark all notifications as read
     */
    markAllAsRead: async (): Promise<void> => {
        try {
            await api.put(API_ENDPOINTS.NOTIFICATION.MARK_ALL_READ);
        } catch (error) {
            console.error('Mark all notifications as read error:', error);
            throw error;
        }
    },
};
