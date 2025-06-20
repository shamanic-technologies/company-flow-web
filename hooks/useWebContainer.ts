'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { WebContainer } from '@webcontainer/api';
import { Terminal } from '@xterm/xterm';
import { DashboardInfo, DashboardFileTree } from '@agent-base/types';
import { useDashboardContext } from '@/components/dashboard/context/DashboardProvider';
import { viteFiles, fetchInterceptorScript } from '@/lib/dashboard-container.config';
import { useAuth } from '@clerk/nextjs';

// Define Status type locally for the hook
type Status = 'idle' | 'booting' | 'installing' | 'starting-server' | 'running' | 'error';

// --- Singleton instance for WebContainer ---
let webcontainerInstance: WebContainer | null = null;

class TerminalStream {
    constructor(private terminal: Terminal) {}
    write(chunk: string) {
        this.terminal.write(chunk);
    }
    // Add dummy methods to satisfy WritableStream<string> type
    close() {}
    abort() {}
    getWriter() { return this; }
    get locked() { return false; }
}

interface UseWebContainerProps {
  selectedDashboard: DashboardInfo | null;
}

export function useWebContainer({ selectedDashboard }: UseWebContainerProps) {
  const { getToken } = useAuth();
  const { getDashboardConfig } = useDashboardContext();
  const terminalRef = useRef<HTMLDivElement>(null);

  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [filesToMount, setFilesToMount] = useState<DashboardFileTree>(viteFiles);

  // --- Effect for loading dashboard config ---
  useEffect(() => {
    const loadDashboardConfig = async () => {
        if (selectedDashboard) {
            setStatus('booting');
            const config = await getDashboardConfig(selectedDashboard.id);
            if (config) {
                setFilesToMount(config);
            } else {
                setError(`Failed to load configuration for ${selectedDashboard.name}`);
                setStatus('error');
            }
        } else {
            setFilesToMount(viteFiles);
        }
    };
    loadDashboardConfig();
  }, [selectedDashboard, getDashboardConfig]);
  
  // --- Teardown Logic ---
  const teardown = useCallback(() => {
    if (webcontainerInstance) {
        webcontainerInstance.teardown();
        webcontainerInstance = null;
    }
    setPreviewUrl('');
    setStatus('idle');
  }, []);

  useEffect(() => {
    const handleUnload = () => teardown();
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [teardown]);
  
  // --- Main Boot Logic ---
  const boot = useCallback(async (terminal: Terminal) => {
    try {
      if (webcontainerInstance) {
        console.log("WebContainer instance is already running.");
        return;
      }
      setStatus('booting');
      
      const wc = await WebContainer.boot();
      webcontainerInstance = wc;

      // Inject fetch interceptor
      await wc.setPreviewScript(fetchInterceptorScript);
      
      wc.on('server-ready', (port, url) => {
        setPreviewUrl(url);
        setStatus('running');
      });

      wc.on('error', (err) => { setError(err.message); setStatus('error'); });

      await wc.mount(filesToMount);

      // Install dependencies
      setStatus('installing');
      terminal.writeln('>>> npm install');
      const installProcess = await wc.spawn('npm', ['install']);
      installProcess.output.pipeTo(new TerminalStream(terminal) as any);
      if ((await installProcess.exit) !== 0) throw new Error('Installation failed');

      // Start dev server
      setStatus('starting-server');
      terminal.writeln('>>> npm run dev');
      const startProcess = await wc.spawn('npm', ['run', 'dev']);
      startProcess.output.pipeTo(new TerminalStream(terminal) as any);

    } catch (err: any) {
      setError(err.message);
      setStatus('error');
    }
  }, [filesToMount]); // Re-run if files change

  const restart = useCallback(async (terminal: Terminal) => {
    if (!webcontainerInstance) {
        // boot(terminal); // This could be an option
        return;
    }
    terminal.writeln('>>> Restarting server...');
    setStatus('starting-server');
    const startProcess = await webcontainerInstance.spawn('npm', ['run', 'dev']);
    startProcess.output.pipeTo(new TerminalStream(terminal) as any);
  }, []);

  // --- PostMessage handler for fetch interception ---
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      // We don't have iframeRef here. This logic needs to be in the component.
      // Or we pass the ref in... let's move it for now.
    };
    // window.addEventListener('message', handleMessage);
    // return () => window.removeEventListener('message', handleMessage);
  }, [getToken]);

  return { status, error, previewUrl, terminalRef, boot, restart, teardown };
}

// Dummy WritableStream for now, will be moved.
class WritableStream {
    constructor(obj: any) {}
} 