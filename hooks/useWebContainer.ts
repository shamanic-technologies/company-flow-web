'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { WebContainer } from '@webcontainer/api';
import { Terminal } from '@xterm/xterm';
import { DashboardInfo, DashboardFileTree } from '@agent-base/types';
import { useDashboardContext } from '@/components/dashboard/context/DashboardProvider';
import { viteFiles, fetchInterceptorScript } from '@/lib/dashboard-container.config';
import { useAuth } from '@clerk/nextjs';
import { Status } from '@/lib/dashboard-utils';

// --- Singleton instance for WebContainer ---
let webcontainerInstance: WebContainer | null = null;

// This class is a workaround for a TypeScript configuration issue in this project.
// It provides a compatible stream for piping process output to the terminal.
class TerminalStream {
  constructor(private terminal: Terminal) {}
  write(data: string) {
    this.terminal.write(data);
  }
  close() {}
  abort() {}
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

  // This effect now handles the ENTIRE boot process when a dashboard is selected.
  useEffect(() => {
    // If a dashboard is selected, start the whole process.
    // The `boot` function will be called internally by this effect.
    if (selectedDashboard) {
      const loadAndBoot = async () => {
        // Prevent re-triggering if already running for the same dashboard
        if (webcontainerInstance) {
          // A simple teardown/reboot logic. Could be improved.
          console.log("Tearing down existing container to boot a new one.");
          teardown(); 
        }

        setStatus('loading-config');
        const config = await getDashboardConfig(selectedDashboard.id);

        if (config) {
          // Now that we have the config, we can proceed to boot.
          // We pass the config directly to avoid state update delays.
          boot(config);
        } else {
          setError(`Failed to load configuration for ${selectedDashboard.name}`);
          setStatus('error');
        }
      };

      loadAndBoot();
    } else {
      // If we go back to the "Welcome" dashboard, reset everything.
      teardown();
      setFilesToMount(viteFiles);
      setStatus('idle');
    }

    // The teardown logic for when the component unmounts
    return () => {
      teardown();
    }
  // We remove getDashboardConfig and boot from dependencies to control the flow manually
  // This effect should ONLY re-run when the selectedDashboard changes.
  }, [selectedDashboard]);
  
  const teardown = useCallback(() => {
    if (webcontainerInstance) {
        webcontainerInstance.teardown();
        webcontainerInstance = null;
    }
    setPreviewUrl('');
    setStatus('idle');
  }, []);

  // No longer needs to be a useCallback exposed to the component, it's now internal.
  const boot = async (files: DashboardFileTree, terminal?: Terminal) => {
    try {
      // The check is now done in the useEffect
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

      await wc.mount(files);

      // --- Manual Stream Piping ---
      const pipeStreamToTerminal = async (stream: ReadableStream<string>) => {
        const reader = stream.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          terminal?.write(value);
        }
      };

      setStatus('installing');
      terminal?.writeln('>>> npm install');
      const installProcess = await wc.spawn('npm', ['install']);
      pipeStreamToTerminal(installProcess.output); // Manually pipe the stream
      if ((await installProcess.exit) !== 0) throw new Error('Installation failed');

      setStatus('starting-server');
      terminal?.writeln('>>> npm run dev');
      const startProcess = await wc.spawn('npm', ['run', 'dev']);
      pipeStreamToTerminal(startProcess.output); // Manually pipe the stream

    } catch (err: any) {
      setError(err.message);
      setStatus('error');
    }
  };

  const restart = useCallback(async (terminal: Terminal) => {
    if (!webcontainerInstance) return;
    terminal.writeln('>>> Restarting server...');
    setStatus('starting-server');
    
    const pipeStreamToTerminal = async (stream: ReadableStream<string>) => {
      const reader = stream.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        terminal.write(value);
      }
    };
    
    const startProcess = await webcontainerInstance.spawn('npm', ['run', 'dev']);
    pipeStreamToTerminal(startProcess.output);
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

  return { 
    status, 
    error, 
    previewUrl, 
    terminalRef 
  };
}

// Dummy WritableStream for now, will be moved.
class WritableStream {
    constructor(obj: any) {}
} 