'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, RotateCw, Trash2 } from 'lucide-react';

type Status = 'idle' | 'booting' | 'installing' | 'starting-server' | 'running' | 'error';

interface DashboardControlsProps {
    status: Status;
    onBoot: () => void;
    onRestart: () => void;
    onTeardown: () => void;
    dashboardName: string;
}

const getStatusMessage = (status: Status) => {
    switch (status) {
        case 'idle': return 'Ready to start';
        case 'booting': return 'Booting WebContainer...';
        case 'installing': return 'Installing dependencies...';
        case 'starting-server': return 'Starting dev server...';
        case 'running': return 'Dashboard is live!';
        case 'error': return 'An error occurred';
    }
};

export function DashboardControls({ status, onBoot, onRestart, onTeardown, dashboardName }: DashboardControlsProps) {
    return (
        <div className="flex justify-between items-center border-b pb-2">
            <div>
                <h2 className="text-lg font-semibold">{dashboardName}</h2>
                <p className="text-sm text-muted-foreground">{getStatusMessage(status)}</p>
            </div>
            <div className="flex items-center gap-2">
                <Button onClick={onBoot} disabled={status !== 'idle'} size="sm">
                    <Play className="h-4 w-4 mr-2"/> Start
                </Button>
                <Button onClick={onRestart} disabled={status !== 'running' && status !== 'error'} size="sm" variant="outline">
                    <RotateCw className="h-4 w-4 mr-2"/> Restart
                </Button>
                 <Button onClick={onTeardown} disabled={status === 'idle' || status === 'booting'} size="sm" variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2"/> Stop
                </Button>
            </div>
        </div>
    );
} 