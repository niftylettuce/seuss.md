
import { webFrame, ipcRenderer } from 'electron';
import gemoji from 'gemoji';
import _ from 'lodash';
import spellchecker from 'spellchecker';
import remote from 'remote';
import Dialogs from 'dialogs';

const dialogs = new Dialogs();
const dialog = remote.require('dialog');
const EMOJI_LIST = _.map(gemoji.name, 'name');

// TODO: add multiple languages per this issue
// <https://github.com/atom/electron/issues/2484>
// TODO: currently webFrame doesn't work per:
// <https://github.com/atom/electron/issues/4167>
webFrame.setSpellCheckProvider('en-US', true, {
  spellCheck: text => !(spellchecker.isMisspelled(text))
});

/*globals swal, CodeMirror */

// <https://github.com/atom/electron/issues/2301>
window.onbeforeunload = (ev) => {
  let choice = dialog.showMessageBox(remote.getCurrentWindow(), {
      type: 'question',
      buttons: ['Yes', 'No'],
      title: 'Confirm',
      message: 'Are you sure you want to quit?'
  });
  return choice === 0;
};

(() => {

  let $code = window.document.getElementById('code');
  let $output = window.document.getElementById('output');

  const languageOverrides = {
    js: 'javascript',
    html: 'xml'
  };

  window.emojify
    .setConfig({ img_dir: 'bower/emojify.js/dist/images/basic/' });

  // TODO: rewrite this and use this as inspiration
  // then open source it on GitHub as codemirror-emoji-helper-autocomplete
  // github.com/atom/autocomplete-emojis/blob/master/lib/emojis-provider.coffee
  // for json/keywords, we can use github.com/github/gemoji
  CodeMirror.registerHelper('hint', 'emoji', function(cm, options) {

    // Find the token at the cursor
    let cursor = cm.getCursor();
    let token = cm.getTokenAt(cursor);

    if (token.string !== ':')
      return [];

    function getCompletions() {
      return EMOJI_LIST;
    }

    return {
      // TODO: CodeMirror.Pos(cur.line, token.start),
      from: cursor,
      // TODO: CodeMirror.Pos(cur.line, token.end),
      to: cursor,
      // TODO: getCompletions(token)
      list: getCompletions()
    };

  });

  let md = window.markdownit({
    html: true,
    breaks: true,
    linkify: true,
    highlight: function(code, lang) {
      if (languageOverrides[lang]) lang = languageOverrides[lang];
      if (lang && window.hljs.getLanguage(lang)) {
        try {
          return window.hljs.highlight(lang, code).value;
        } catch (e) { }
      }
      return '';
    }
  })
  .use(window.markdownitFootnote)
  .use(window.markdownitCheckbox);

  let head = document.getElementsByTagName('head')[0];

  let theme = localStorage.getItem('theme');
  if (typeof theme !== 'string')
    theme = 'default';
  else
    loadTheme(theme);
  ipcRenderer.send('set_theme', theme);

  let zoom = parseFloat(localStorage.getItem('zoom'), 10);
  console.log('zoom', zoom, typeof zoom);
  if (typeof zoom !== 'number')
    zoom = 1;

  let cm = CodeMirror.fromTextArea($code, {
    mode: 'gfm',
    theme: theme,
    lineNumbers: true,
    lineWrapping: true,
    matchBrackets: true,
    extraKeys: { 'Enter': 'newlineAndIndentContinueMarkdownList' },
    showTrailingSpace: true,
    continueComments: true,
    autoRefresh: true,
    tabSize: 2
  });

  /*
  // autocompletion of emojis
  let timeout;

  cm.on('inputRead', function(cm) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(function() {
      if (!cm.state.completionActive)
        CodeMirror.showHint(cm, CodeMirror.hint.emoji, {
          completeSingle: false
        });
    }, 150);
  });

  cm.on('keyup', function(cm, ev) {
    let keyCode = ev.keyCode || ev.which;
    if (keyCode !== 8 && keyCode !== 46) return;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(function() {
      if (!cm.state.completionActive)
        CodeMirror.showHint(cm, CodeMirror.hint.emoji, {
          completeSingle: false
        });
    }, 150);
  });
  */

  // TODO: custom fonts not working yet
  // https://github.com/codemirror/CodeMirror/issues/3764
  //cm.getWrapperElement().style.fontSize = (zoom * 18) + 'px';
  //cm.refresh();

  // TODO: add top panel <https://codemirror.net/demo/panel.html>

  function loadTheme(theme) {
    if (theme === 'default') return;
    let link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = 'bower/codemirror/theme/' + theme + '.css';
    head.appendChild(link);
  }

  ipcRenderer.on('set_theme', (ev, theme) => {
    loadTheme(theme);
    localStorage.setItem('theme', theme);
    cm.setOption('theme', theme);
    cm.refresh();
  });

  ipcRenderer.on('set_zoom', (ev, value) => {
    value = value === 0 ? 1 : zoom + value;
    if (value <= 0.5 || value >= 2) return;
    console.log('setItem', value);
    zoom = value;
    localStorage.setItem('zoom', zoom);
    cm.getWrapperElement().style.fontSize = (zoom * 18) + 'px';
    cm.refresh();
  });

  ipcRenderer.on('emoji', (ev, emoji) => {
    // we only want to insert a space before
    // and after an emoji if there is not already one
    // (otherwise if we don't, emoji's won't render)
    let cursor = cm.getDoc().getCursor();
    let before = cm.getDoc().getLine(cursor.line).substr(cursor.ch - 1, 1);
    let after = cm.getDoc().getLine(cursor.line).substr(cursor.ch, 1);
    if (before !== ' ')
      emoji = ' ' + emoji;
    if (after !== ' ')
      emoji += ' ';
    cm.getDoc().replaceSelection(`${emoji}`);
  });

  ipcRenderer.on('code_block', (ev, value) => {

  });

  ipcRenderer.on('command', (ev, value) => {
    console.log('value', value);
    let selection = cm.getDoc().getSelection();
    console.log('selection', selection);
    let r = ''; // replacement
    switch (value) {
    case 'Link':
      let text = '';
// let text = selection === '' ? dialogs.prompt('Displayed Text') : selection;
      let url = dialogs.prompt('URL', function(ok) {
        console.log('prompt', ok);
      });
      r = `<a href="${url}">${text}</a>`;
      break;
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
      r = new Array(parseInt(value.replace('h', ''), 10) + 1).join('#');
      r = `\n\n${r} ${selection}`;
      break;
    case 'CodeSample':
      r = `<code>${selection}</code>`;
      break;
    case 'Horizontal Rule':
      r = `foo ${r} bar`;
      break;
    case 'Image':
    case 'List':
    case 'Table':
    case 'Blockquote':
    case 'Bold':
    case 'Italic':
    case 'Underline':
    case 'Strikethrough':
    case 'Use Default':
    case 'Superscript':
    case 'Subscript':
      r = `<sup>${selection}</sup>`;
      break;
    }
    cm.getDoc().replaceSelection(r);
  });

  // remove textarea
  $code.parentNode.removeChild($code);

  let title = 'Unsaved';

  cm.on('change', change);

  function change() {
    // update title
    window.document.title = title + ' — Edited';
    $output.innerHTML = md.render(cm.getValue());
    window.emojify.run($output);
  }

  // render on page load
  $output.innerHTML = md.render(cm.getValue());
  window.emojify.run($output);

  // TODO: on the hotkey CMD+S, or when user hits file save
  // then we need to ensure the file is saved to GitHub as a gist
  // and upon success, make the title not have an "* " asterisk prefix

  // call splittr to allow resizing
  window.document.addEventListener(
    'DOMContentLoaded',
    window.splittr.init,
    false
  );

})();
