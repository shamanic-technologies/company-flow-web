'use client';

import React, { useRef, useEffect } from 'react';
import { Terminal } from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css';
import { FitAddon } from '@xterm/addon-fit';
import { DashboardInfo } from '@agent-base/types';
import { useAuth } from '@clerk/nextjs';
import { useWebContainer } from '@/hooks/useWebContainer';
import { PreviewPanel } from './PreviewPanel';
import { TerminalPanel } from './TerminalPanel';
import { Skeleton } from '@/components/ui/skeleton';
import { Status, getStatusMessage } from '@/lib/dashboard-utils';

interface AIDashboardPanelProps {
  selectedDashboard: DashboardInfo | null;
}

export default function AIDashboardPanel({ selectedDashboard }: AIDashboardPanelProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { getToken } = useAuth();
  
  const { 
    status, 
    error, 
    previewUrl, 
    terminalRef
  } = useWebContainer({ selectedDashboard });

  // --- Effect for fetch interception ---
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;
      
      if (event.data.type === 'WC_FETCH_REQUEST') {
        const { requestId, url, options } = event.data.payload;
        try {
          const token = await getToken();
          const headers = new Headers(options.headers);
          if (token) headers.set('Authorization', `Bearer ${token}`);
          
          const response = await fetch(url, { ...options, headers });
          const responsePayload = {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            body: await response.text(),
          };
          iframeRef.current?.contentWindow?.postMessage({ type: 'WC_FETCH_RESPONSE', payload: { requestId, response: responsePayload } }, '*');
        } catch (err: any) {
          iframeRef.current?.contentWindow?.postMessage({ type: 'WC_FETCH_RESPONSE', payload: { requestId, error: err.message } }, '*');
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [getToken]);
  
  // --- Effect to attach terminal ---
  useEffect(() => {
    if (status !== 'idle' && status !== 'loading-config' && terminalRef.current) {
        const term = new Terminal({ convertEol: true, cursorBlink: true });
        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        term.open(terminalRef.current);
        fitAddon.fit();
        // The hook needs access to the terminal instance to write to it.
        // This is a new challenge with the refactored logic.
        // A more advanced solution would use a callback ref or context.
        // For now, this effect only handles mounting.
    }
  }, [status, terminalRef]);

  return (
    <div className="flex flex-col h-full bg-background text-foreground p-4 gap-4">
      <div className="flex justify-between items-center border-b pb-2">
        <div>
            <h2 className="text-lg font-semibold">{selectedDashboard?.name || 'AI Dashboard Preview'}</h2>
            <p className="text-sm text-muted-foreground">{getStatusMessage(status)}</p>
        </div>
      </div>
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100%-150px)]">
        <PreviewPanel ref={iframeRef} status={status} error={error} previewUrl={previewUrl} />
        <TerminalPanel ref={terminalRef} status={status} />
      </div>
    </div>
  );
} 