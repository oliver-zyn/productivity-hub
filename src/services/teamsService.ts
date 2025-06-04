import { PublicClientApplication, AccountInfo } from '@azure/msal-browser';
import type { Meeting, GraphAPIEvent, APIResponse } from '../types';
import { CONFIG, APP_CONSTANTS, isTeamsConfigured } from '../config';

class TeamsService {
  private msalInstance: PublicClientApplication | null = null;
  private accessToken: string | null = null;
  private account: AccountInfo | null = null;

  constructor() {
    if (isTeamsConfigured() && typeof window !== 'undefined') {
      this.initializeMSAL();
    }
  }

  // ===================================
  // MSAL Initialization
  // ===================================
  private initializeMSAL() {
    try {
      this.msalInstance = new PublicClientApplication({
        auth: {
          clientId: CONFIG.TEAMS.CLIENT_ID,
          authority: `https://login.microsoftonline.com/${CONFIG.TEAMS.TENANT_ID}`,
          redirectUri: CONFIG.TEAMS.REDIRECT_URI,
        },
        cache: {
          cacheLocation: 'localStorage',
          storeAuthStateInCookie: false,
        },
      });
    } catch (error) {
      console.error('Failed to initialize MSAL:', error);
    }
  }

  // ===================================
  // Authentication
  // ===================================
  async authenticate(): Promise<APIResponse<boolean>> {
    if (!this.msalInstance) {
      return {
        success: false,
        error: 'MSAL not initialized. Please configure Teams credentials.',
      };
    }

    try {
      // Try silent authentication first
      const accounts = this.msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        this.account = accounts[0];
        
        try {
          const response = await this.msalInstance.acquireTokenSilent({
            scopes: CONFIG.TEAMS.SCOPES,
            account: this.account,
          });
          
          this.accessToken = response.accessToken;
          return { success: true, data: true };
        } catch (silentError) {
          // Silent auth failed, continue to popup
          console.error('Silent authentication failed:', silentError);
        }
      }

      // Use popup for interactive authentication
      const response = await this.msalInstance.acquireTokenPopup({
        scopes: CONFIG.TEAMS.SCOPES,
      });

      this.accessToken = response.accessToken;
      this.account = response.account;

      return { success: true, data: true };
    } catch (error) {
      console.error('Authentication failed:', error);
      return {
        success: false,
        error: (error as Error).message || 'Authentication failed',
      };
    }
  }

  // ===================================
  // Get Meetings
  // ===================================
  async getMeetings(): Promise<APIResponse<Meeting[]>> {
    if (!this.accessToken) {
      return {
        success: false,
        error: 'Not authenticated. Please log in first.',
      };
    }

    try {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const startDateTime = today.toISOString().split('T')[0] + 'T00:00:00';
      const endDateTime = tomorrow.toISOString().split('T')[0] + 'T23:59:59';

      const url = `${APP_CONSTANTS.GRAPH_API.BASE_URL}${APP_CONSTANTS.GRAPH_API.ENDPOINTS.CALENDAR_VIEW}?startDateTime=${startDateTime}&endDateTime=${endDateTime}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Graph API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const meetings = data.value.map(this.mapGraphEventToMeeting);

      return { success: true, data: meetings };
    } catch (error) {
      console.error('Failed to get meetings:', error);
      return {
        success: false,
        error: (error as Error).message || 'Failed to fetch meetings',
      };
    }
  }

  // ===================================
  // Create Meeting
  // ===================================
  async createMeeting(
    title: string,
    startTime: Date,
    endTime: Date,
    description?: string
  ): Promise<APIResponse<Meeting>> {
    if (!this.accessToken) {
      return {
        success: false,
        error: 'Not authenticated. Please log in first.',
      };
    }

    try {
      const meetingData = {
        subject: title,
        body: {
          contentType: 'HTML',
          content: description || '',
        },
        start: {
          dateTime: startTime.toISOString(),
          timeZone: 'America/Sao_Paulo',
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: 'America/Sao_Paulo',
        },
        isOnlineMeeting: true,
      };

      const response = await fetch(
        `${APP_CONSTANTS.GRAPH_API.BASE_URL}${APP_CONSTANTS.GRAPH_API.ENDPOINTS.EVENTS}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(meetingData),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to create meeting: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const meeting = this.mapGraphEventToMeeting(data);

      return { success: true, data: meeting };
    } catch (error) {
      console.error('Failed to create meeting:', error);
      return {
        success: false,
        error: (error as Error).message || 'Failed to create meeting',
      };
    }
  }

  // ===================================
  // Utility Functions
  // ===================================
  private mapGraphEventToMeeting(event: GraphAPIEvent): Meeting {
    const startTime = new Date(event.start.dateTime);
    const endTime = new Date(event.end.dateTime);

    return {
      id: event.id,
      title: event.subject,
      time: this.formatMeetingTime(startTime, endTime),
      attendees: event.attendees?.length || 1,
      link: event.onlineMeeting?.joinUrl || event.webLink,
      type: event.recurrence ? 'recorrente' : 'unica',
      startTime,
      endTime,
    };
  }

  private formatMeetingTime(startTime: Date, endTime: Date): string {
    const startFormatted = startTime.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const endFormatted = endTime.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${startFormatted} - ${endFormatted}`;
  }

  // ===================================
  // Status Methods
  // ===================================
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  getCurrentAccount(): AccountInfo | null {
    return this.account;
  }

  // ===================================
  // Logout
  // ===================================
  async logout(): Promise<void> {
    if (this.msalInstance && this.account) {
      await this.msalInstance.logoutPopup({
        account: this.account,
      });
    }
    
    this.accessToken = null;
    this.account = null;
  }
}

// Export singleton instance
export const teamsService = new TeamsService();