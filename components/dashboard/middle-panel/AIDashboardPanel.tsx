'use client';

import React, { useRef, useEffect } from 'react';
import { Terminal } from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css';
import { FitAddon } from '@xterm/addon-fit';
import { DashboardInfo } from '@agent-base/types';
import { useAuth } from '@clerk/nextjs';
import { useWebContainer } from '@/hooks/useWebContainer';
import { DashboardControls } from './DashboardControls';
import { PreviewPanel } from './PreviewPanel';
import { TerminalPanel } from './TerminalPanel';

interface AIDashboardPanelProps {
  selectedDashboard: DashboardInfo | null;
}

export default function AIDashboardPanel({ selectedDashboard }: AIDashboardPanelProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const terminalInstance = useRef<Terminal | null>(null);
  const fitAddon = useRef(new FitAddon());
  const { getToken } = useAuth();
  
  const { 
    status, 
    error, 
    previewUrl, 
    boot, 
    restart, 
    teardown,
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
  
  // --- Terminal Setup and Boot Call ---
  const handleBoot = () => {
      if (terminalRef.current && !terminalInstance.current) {
        const term = new Terminal({ convertEol: true, cursorBlink: true });
        term.loadAddon(fitAddon.current);
        term.open(terminalRef.current);
        fitAddon.current.fit();
        terminalInstance.current = term;
      }
      if (terminalInstance.current) {
        boot(terminalInstance.current);
      }
  };

  const handleRestart = () => {
    if (terminalInstance.current) {
      restart(terminalInstance.current);
    }
  };
  
  return (
    <div className="flex flex-col h-full bg-background text-foreground p-4 gap-4">
      <DashboardControls 
        status={status}
        onBoot={handleBoot} 
        onRestart={handleRestart} 
        onTeardown={teardown}
        dashboardName={selectedDashboard?.name || 'AI Dashboard Preview'}
      />
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100%-150px)]">
        <PreviewPanel ref={iframeRef} status={status} error={error} previewUrl={previewUrl} />
        <TerminalPanel ref={terminalRef} status={status} />
      </div>
    </div>
  );
} 