import { app, BrowserWindow } from 'electron';
import path from 'path';
import url from 'url';
import express from 'express';

let win;

function createWindow() {
  win = new BrowserWindow({width: 800, height: 600})
  win.loadURL(url.format({
    pathname: path.join(__dirname, '..', 'index.html'),
    protocol: 'file:',
    slashes: true
  }))
  win.on('closed', () => { win = null });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  app.quit()
});

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
});

/**
 * Start express HTTP server and listen on the specified redirect URL
 */
export async function waitCallback(redirectUri, options = {}) {
  const { protocol, hostname, port, pathname } = url.parse(redirectUri);
  if (protocol !== 'http:' || hostname !== 'localhost') {
    throw new Error('redirectUri should be an http://localhost url');
  }
  return new Promise((resolve, reject) => {
    const app = express();
    app.get(pathname, async (req, res) => {
      resolve(req.query);
      res.send('<html><body><script>window.close()</script></body></html>');
      setTimeout(shutdown, 100)
    });
    const server = app.listen(port);
    const shutdown = (reason) => {
      server.close();
      if (reason) {
        reject(new Error(reason));
      }
    };
    if (options.timeout) {
      setTimeout(() => shutdown('timeout'), options.timeout);
    }
  });
}

export function focusWin() {
  if (win) { win.focus(); }
}
