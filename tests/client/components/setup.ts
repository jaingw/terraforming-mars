const jsdom = require('jsdom');
const {JSDOM} = jsdom;

const dom = new JSDOM(`<!DOCTYPE html>`, {url: 'http://localhost'});

global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.window = dom.window;
global.localStorage = dom.window.localStorage;

global.Element = dom.window.Element;
global.HTMLBodyElement = dom.window.HTMLBodyElement;
global.MutationObserver = dom.window.MutationObserver;
global.Node = dom.window.Node;
