
import {
  Menu,
  nativeImage,
  shell
} from 'electron';

import path from 'path';
import fs from 'fs';

// edit -> insert -> emoji -> submenu
const emojiDir = path.join(
  __dirname, 'ui/bower/emojify.js/dist/images/basic'
);
let emojiSubmenu = fs.readdirSync(emojiDir).map((file) => {
  let name = path.basename(file, path.extname(file));
  let buffer = fs.readFileSync(path.join(emojiDir, file));
  return {
    label: `:${name}:`,
    icon: nativeImage.createFromBuffer(buffer, 3),
    click: (item, focusedWindow) => {
      if (focusedWindow)
        focusedWindow.webContents.send('emoji', item.label);
    }
  }
});

// edit -> insert -> code block -> submenu
let codeBlockSubmenu = fs.readdirSync(
  path.join(__dirname, 'ui/bower/codemirror/mode')
).map((file) => {
  let basename = path.basename(file)
  return {
    label: basename,
    click: (item, focusedWindow) => {
      if (focusedWindow)
        focusedWindow.webContents.send('code_block', basename);
    }
  }
});

// view -> theme -> submenu
let currentTheme = 'default';
let themeSubmenu = [ 'default' ].concat(fs.readdirSync(path.join(
  path.join(__dirname, 'ui/bower/codemirror/theme')
))).map((file) => {
  let name = path.basename(file, path.extname(file));
  return {
    label: name,
    type: 'checkbox',
    checked: false
  };
});

// send command (uses `item.label`)
function send(item, focusedWindow) {
  if (focusedWindow)
    focusedWindow.webContents.send('command', item.label);
}

let menu = {
  main: {
    label: 'Seuss.md',
    submenu: [
      {
        label: 'About Seuss.md',
        role: 'about',
      },
      {
        type: 'separator'
      },
      {
        label: 'Services',
        role: 'services'
      },
      {
        type: 'separator'
      },
      {
        label: 'Hide Seuss.md',
        accelerator: 'CmdOrCtrl+H',
        role: 'hide'
      },
      {
        label: 'Hide Others',
        accelerator: 'CmdOrCtrl+Shift+H',
        role: 'hideothers',
      },
      {
        label: 'Show All',
        role: 'unhide'
      },
      {
        type: 'separator'
      },
      {
        label: 'Quit',
        accelerator: 'CmdOrCtrl+Q',
        // click: quitApp
      }
    ]
  },
  file: {
    label: 'File',
    submenu: [
      {
        label: 'New',
        accelerator: 'CmdOrCtrl+N',
        // click: newFile
      },
      {
        label: 'Open...',
        accelerator: 'CmdOrCtrl+O',
        // click: openFile
      },
      {
        label: 'Open Recent',
        submenu: [
          { label: 'Readme.md' },
          { label: 'Foo.md' },
          { label: 'Proposal.md' }
        ]
      },
      {
        type: 'separator'
      },
      {
        label: 'Save',
        accelerator: 'CmdOrCtrl+S',
        // click: saveFile
      },
      {
        label: 'Save as...',
        accelerator: 'CmdOrCtrl+Shift+S',
        // click: saveFile
      },
      {
       label: 'Rename...'
      },
      {
        label: 'Revert To',
        submenu: [
          { label: 'Wed Jan 13 7:47 PM' },
          { label: 'Wed Jan 13 7:42 PM' },
          { label: 'Wed Jan 13 7:40 PM' }
        ]
      },
      {
        type: 'separator'
      },
      {
        label: 'Export as PDF...',
        accelerator: 'CmdOrCtrl+P'
      }
    ]
  },
  edit: {
    label: 'Edit',
    submenu: [
      {
        label: 'Undo',
        accelerator: 'CmdOrCtrl+Z',
        role: 'undo'
      },
      {
        label: 'Redo',
        accelerator: 'Shift+CmdOrCtrl+Z',
        role: 'redo'
      },
      {
        type: 'separator'
      },
      {
        label: 'Cut',
        accelerator: 'CmdOrCtrl+X',
        role: 'cut'
      },
      {
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy'
      },
      {
        label: 'Paste',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste'
      },
      {
        label: 'Select All',
        accelerator: 'CmdOrCtrl+A',
        role: 'selectall'
      },
      {
        type: 'separator'
      },
      {
        label: 'Insert',
        submenu: [
          {
            label: 'Emoji',
            submenu: emojiSubmenu
          },
          {
            label: 'Link',
            click: send
          },
          {
            label: 'Header',
            submenu: [
              { label: 'h1', click: send },
              { label: 'h2', click: send },
              { label: 'h3', click: send },
              { label: 'h4', click: send },
              { label: 'h5', click: send },
              { label: 'h6', click: send }
            ]
          },
          {
            label: 'Code Sample',
            click: send
          },
          {
            label: 'Code Block',
            submenu: codeBlockSubmenu
          },
          {
            label: 'Horizontal Rule',
            click: send
          },
          {
            label: 'Image',
            click: send
          },
          {
            label: 'List',
            click: send
          },
          {
            label: 'Table',
            click: send
          },
          {
            label: 'Blockquote',
            click: send
          }
        ]
      }
    ]
  },
  format: {
    label: 'Format',
    submenu: [
      {
        label: 'Font',
        submenu: [
          {
            label: 'Bold',
            accelerator: 'CmdOrCtrl+B',
            click: send
          },
          {
            label: 'Italic',
            accelerator: 'CmdOrCtrl+I',
            click: send
          },
          {
            label: 'Underline',
            accelerator: 'CmdOrCtrl+U',
            click: send
          },
          {
            label: 'Strikethrough',
            click: send
          },
          {
            type: 'separator'
          },
          {
            label: 'Baseline',
            submenu: [
              {
                label: 'Use Default',
                click: send
              },
              {
                label: 'Superscript',
                click: send
              },
              {
                label: 'Subscript',
                click: send
              }
            ]
          }
        ]
      }
    ]
  },
  view: {
    label: 'View',
    submenu: [
      {
        label: 'Actual Size',
        accelerator: 'CmdOrCtrl+0'
      },
      {
        label: 'Zoom In',
        accelerator: 'CmdOrCtrl+='
        // <https://github.com/atom/electron/issues/1507>
        //accelerator: 'CmdOrCtrl+Plus'
      },
      {
        label: 'Zoom Out',
        accelerator: 'CmdOrCtrl+-'
      },
      {
        type: 'separator'
      },
      {
        label: 'Theme',
        submenu: themeSubmenu
      }
    ]
  },
  _window: {
    label: 'Window',
    role: 'window',
    submenu: [
      {
        label: 'Minimize',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize'
      },
      {
        label: 'Close',
        accelerator: 'CmdOrCtrl+W',
        role: 'close'
      }
    ]
  },
  develop: {
    label: 'Develop',
    submenu: [
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click: (item, focusedWindow) => {
          if (focusedWindow)
            focusedWindow.reload();
        },
      },
      {
        label: 'Toggle DevTools',
        accelerator: 'Alt+CmdOrCtrl+I',
        click: (item, focusedWindow) => {
          if (focusedWindow)
            focusedWindow.toggleDevTools();
        }
      }
    ]
  },
  help: {
    label: 'Help',
    role: 'help',
    submenu: [
      {
        label: 'GitHub',
        click: () => shell
          .openExternal('https://github.com/niftylettuce/seuss.md')
      },
      {
        label: 'Donate',
        click: () => shell.openExternal('https://paypal.me/niftylettuce')
      },
      {
        label: 'Twitter',
        click: () => shell.openExternal('https://twitter.com/niftylettuce')
      },
      {
        label: 'Email',
        click: () =>  shell.openExternal('mailto:niftylettuce@gmail.com')
      }
    ]
  }
}

export default class MenuBuilder {

  constructor(opts) {
    opts = opts || {};
    opts.theme = opts.theme || 'default';
    // TODO: validate theme from the theme list
    if (!opts.win)
      throw new Error('`win` option is not defined');
    this.theme = opts.theme;
    this.win = opts.win;
  }

  setTheme(theme) {
    this.theme = theme;
    this.buildMenu();
  }

  buildMenu() {

    let appMenu = Menu.buildFromTemplate([
      menu.main,
      menu.file,
      menu.edit,
      menu.format,
      menu.view,
      menu._window,
      menu.develop,
      menu.help
    ]);

    Menu.setApplicationMenu(appMenu);

    // zoom in and zoom out
    appMenu.items[4].submenu.items[0].click = () => {
      this.win.webContents.send('set_zoom', 0);
    }
    appMenu.items[4].submenu.items[1].click = () => {
      this.win.webContents.send('set_zoom', 0.125);
    }
    appMenu.items[4].submenu.items[2].click = () => {
      this.win.webContents.send('set_zoom', -0.125);
    }

    let submenu = appMenu.items[4].submenu.items[4].submenu.items;

    submenu.map((item) => {
      let set = this.theme === item.label;
      item.enabled = !set;
      item.checked = set;
      item.click = () => {
        this.theme = item.label;
        this.win.webContents.send('set_theme', this.theme);
        this.buildMenu();
      }
      return item;
    });

  }
};
