import { useState, useEffect } from 'react';
import { isDevelopment } from '@/lib/environment';

interface DevModeNoticeProps {
  title?: string;
}

const DevModeNotice: React.FC<DevModeNoticeProps> = ({ title = 'Development Mode Active' }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  // Only show in development mode
  if (!isDevelopment()) {
    return null;
  }

  // Intercept console.log to capture verification codes
  useEffect(() => {
    const originalConsoleLog = console.log;
    
    console.log = (...args) => {
      originalConsoleLog(...args);
      
      // Check if this log contains a verification code
      const logString = args.join(' ');
      if (logString.includes('[DEV MODE]') || logString.includes('[DEV FALLBACK]') || 
          logString.includes('Verification code for') || logString.includes('verification code')) {
        setLogs(prev => [...prev, logString]);
      }
    };
    
    // Cleanup
    return () => {
      console.log = originalConsoleLog;
    };
  }, []);

  // Only keep last 5 logs
  useEffect(() => {
    if (logs.length > 5) {
      setLogs(prev => prev.slice(-5));
    }
  }, [logs]);

  if (!isVisible) {
    return (
      <button 
        onClick={() => setIsVisible(true)}
        className="fixed bottom-2 right-2 bg-blue-600 text-white px-4 py-2 rounded shadow-md z-50"
      >
        Show Dev Tools
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-md bg-gray-800 text-white p-4 rounded-lg shadow-lg z-50 border border-gray-700">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-lg">{title}</h3>
        <div className="flex space-x-2">
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-gray-300 hover:text-white"
          >
            {isMinimized ? 'Expand' : 'Minimize'}
          </button>
          <button 
            onClick={() => setIsVisible(false)}
            className="text-gray-300 hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
      
      {!isMinimized && (
        <>
          <div className="text-sm text-gray-400 mb-2">
            This panel only appears in development mode.
          </div>
          
          <div className="bg-gray-900 p-3 rounded overflow-auto max-h-60 text-sm font-mono">
            {logs.length > 0 ? (
              logs.map((log, index) => {
                // Extract verification code from log if present
                const codeMatch = log.match(/code for .+?: (\d{6})/);
                const code = codeMatch?.[1];
                
                return (
                  <div key={index} className="mb-1">
                    {code ? (
                      <div>
                        <span className="text-green-400">Verification Code: </span>
                        <span className="bg-gray-800 px-2 py-1 rounded font-bold text-yellow-300 tracking-wide">
                          {code}
                        </span>
                        <button 
                          onClick={() => navigator.clipboard.writeText(code)}
                          className="ml-2 text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
                          title="Copy to clipboard"
                        >
                          Copy
                        </button>
                      </div>
                    ) : (
                      <div className="text-gray-400">{log}</div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-gray-500">No verification codes logged yet.</div>
            )}
          </div>
          
          <div className="mt-3 text-xs text-gray-500">
            ⓘ For production, upgrade to Firebase Blaze plan to enable actual email sending.
          </div>
        </>
      )}
    </div>
  );
};

export default DevModeNotice; 