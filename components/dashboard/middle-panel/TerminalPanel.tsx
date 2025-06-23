'use client';

import React, { forwardRef } from 'react';
import { Status } from '@/lib/dashboard-utils';

interface TerminalPanelProps {
    status: Status;
}

export const TerminalPanel = forwardRef<HTMLDivElement, TerminalPanelProps>(
    ({ status }, ref) => {
        return (
            <div className="flex flex-col border rounded-md">
                <div className="p-2 border-b bg-muted text-sm font-medium">Terminal</div>
                <div ref={ref} className="flex-1 bg-black p-2 h-full overflow-hidden">
                    {status === 'idle' && (
                        <div className="w-full h-full flex items-center justify-center">
                            <p className="text-gray-500">Terminal output will appear here</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }
);

TerminalPanel.displayName = 'TerminalPanel'; 