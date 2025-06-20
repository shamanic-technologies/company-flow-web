'use client';

import React, { forwardRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

type Status = 'idle' | 'booting' | 'installing' | 'starting-server' | 'running' | 'error';

interface PreviewPanelProps {
    status: Status;
    previewUrl: string;
    error: string | null;
}

export const PreviewPanel = forwardRef<HTMLIFrameElement, PreviewPanelProps>(
    ({ status, previewUrl, error }, ref) => {
        return (
            <div className="flex flex-col border rounded-md">
                <div className="p-2 border-b bg-muted text-sm font-medium">Preview</div>
                <div className="flex-1 bg-white relative">
                    {(status === 'booting' || status === 'installing' || status === 'starting-server') && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/50">
                            <Skeleton className="w-[80%] h-[80%]"/>
                        </div>
                    )}
                    {status === 'running' && previewUrl ? (
                        <iframe
                            ref={ref}
                            src={previewUrl}
                            className="w-full h-full border-0"
                            title="AI Generated Dashboard Preview"
                        />
                    ) : status !== 'error' && (
                         <div className="absolute inset-0 flex items-center justify-center">
                            <p className="text-muted-foreground">Click Start to launch the preview</p>
                        </div>
                    )}
                     {status === 'error' && (
                         <div className="absolute inset-0 flex flex-col items-center justify-center text-red-500">
                            <p className="font-bold">Error</p>
                            <p className="text-xs">{error}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }
);

PreviewPanel.displayName = 'PreviewPanel'; 