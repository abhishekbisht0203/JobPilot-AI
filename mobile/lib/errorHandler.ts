import { Platform } from 'react-native';

if (Platform.OS === 'web' && typeof window !== 'undefined') {
  const origConsoleError = console.error;
  const origConsoleTrace = console.trace;

  let errorPanel: HTMLDivElement | null = null;

  function createErrorPanel(): HTMLDivElement {
    const existing = document.getElementById('__console_errors');
    if (existing) return existing as HTMLDivElement;

    const panel = document.createElement('div');
    panel.id = '__console_errors';
    panel.setAttribute(
      'style',
      'position:fixed;bottom:0;left:0;right:0;z-index:99999;max-height:40vh;overflow-y:auto;background:rgba(0,0,0,0.92);color:#f87171;font-family:monospace;font-size:12px;padding:8px 12px;white-space:pre-wrap;word-break:break-all;border-top:2px solid #ef4444;display:none;'
    );
    const header = document.createElement('div');
    header.setAttribute(
      'style',
      'display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;'
    );
    const title = document.createElement('span');
    title.setAttribute('style', 'font-weight:700;color:#fca5a5;');
    title.textContent = 'Runtime Errors';
    const toggle = document.createElement('button');
    toggle.setAttribute(
      'style',
      'background:transparent;border:1px solid #ef4444;color:#fca5a5;border-radius:4px;cursor:pointer;font-size:11px;padding:2px 8px;'
    );
    toggle.textContent = 'Hide';
    toggle.onclick = () => {
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
      toggle.textContent = panel.style.display === 'none' ? 'Show' : 'Hide';
    };
    header.appendChild(title);
    header.appendChild(toggle);
    panel.appendChild(header);
    document.body.appendChild(panel);
    return panel;
  }

  function formatArgs(args: unknown[]): string {
    return args
      .map((a) => {
        if (a instanceof Error) {
          return `${a.name}: ${a.message}\n${(a.stack || '').split('\n').slice(0, 6).join('\n')}`;
        }
        if (typeof a === 'object' && a !== null) {
          try {
            return JSON.stringify(a, null, 2);
          } catch {
            return String(a);
          }
        }
        return String(a);
      })
      .join(' ');
  }

  function logError(...args: unknown[]) {
    const text = `[${new Date().toISOString()}] ${formatArgs(args)}`;
    if (!errorPanel) errorPanel = createErrorPanel();
    const body = document.createElement('div');
    body.textContent = text;
    body.setAttribute('style', 'padding:2px 0;border-bottom:1px solid rgba(239,68,68,0.2);');
    errorPanel.appendChild(body);
    errorPanel.scrollTop = errorPanel.scrollHeight;
    errorPanel.style.display = 'block';
  }

  console.error = (...args: unknown[]) => {
    origConsoleError.apply(console, args);
    logError(...args);
  };

  console.trace = (...args: unknown[]) => {
    origConsoleTrace.apply(console, args);
    logError('TRACE:', ...args);
  };

  window.onerror = (msg, url, line, col, error) => {
    origConsoleError('GLOBAL ERROR:', msg, `at ${url}:${line}:${col}`, error?.stack);
    logError('GLOBAL ERROR:', msg, `at ${url}:${line}:${col}`, error?.stack || '');
    return false;
  };

  window.addEventListener('unhandledrejection', (event) => {
    origConsoleError('UNHANDLED PROMISE REJECTION:', event.reason);
    logError('UNHANDLED PROMISE REJECTION:', event.reason);
  });
}
