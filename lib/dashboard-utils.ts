export type Status = 'idle' | 'loading-config' | 'booting' | 'installing' | 'starting-server' | 'running' | 'error';

export const getStatusMessage = (status: Status): string => {
    switch (status) {
        case 'idle': return 'Select a dashboard to begin';
        case 'loading-config': return 'Loading dashboard configuration...';
        case 'booting': return 'Booting WebContainer...';
        case 'installing': return 'Installing dependencies...';
        case 'starting-server': return 'Starting dev server...';
        case 'running': return 'Dashboard is live!';
        case 'error': return 'An error occurred';
        default: return 'Unknown status';
    }
}; 