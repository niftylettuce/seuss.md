
import {
  app,
  BrowserWindow,
  Tray,
  shell,
  ipcMain,
  screen
} from 'electron';

import path from 'path';
import fs from 'fs';
import electronDebug from 'electron-debug';
import spellchecker from 'spellchecker';

import MenuBuilder from './menu-builder';

const icon = path.join(__dirname, 'img', 'IconTemplate.png');

let tray;

// TODO: https://github.com/pksunkara/octonode
// TODO: print to pdf
// #webcontentsprinttopdfoptions-callback
// github.com/electron/docs/api/web-contents.md

// TODO: add multiple languages per this issue
// <https://github.com/atom/electron/issues/2484>
// TODO: currently webFrame doesn't work per:
// <https://github.com/atom/electron/issues/4167>
//webFrame.setSpellCheckProvider('en-US', true, {
//  spellCheck: text => !(spellchecker.isMisspelled(text))
//});

app.on('ready', () => {

  tray = new Tray(icon);

  //let size = screen.getPrimaryDisplay().workAreaSize;

  let win = new BrowserWindow({
    title: 'Untitled',
    width: 1200,
    height: 600
  });

  // initialize menu builder
  let menu = new MenuBuilder({
    win: win
  });
  menu.buildMenu();

  // when window loads, check if user has a default theme
  ipcMain.on('set_theme', (ev, theme) => {
    menu.setTheme(theme);
  })

  win.loadURL('file://' + __dirname + '/ui/index.html');

  //win.setRepresentedFilename('foobaz.md');
  //win.setDocumentEdited(true);

  win.webContents.on('will-navigate', (ev, url) => {
    ev.preventDefault();
    shell.openExternal(url);
  });

});
