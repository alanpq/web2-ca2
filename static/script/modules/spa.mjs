'use strict';
/**
 * @typedef Page
 * @type {object}
 * @property {string} id The id of this page.
 * @property {Element} el The element that contains this page.
 * @property {Element} link The anchor that opens this page.
 */

/**
 * @typedef PageEvent
 * @type {"open" | "close"}
 */

/**
 * @typedef PageListeners
 * @type {object}
 * @property {Function[]} open Listeners for page open
 * @property {Function[]} close Listeners for page close
 */
/** @type {{[id: string]: PageListeners}} */

/**
 * @typedef SPAState
 * @type {object}
 * @property {Element} nav
 * @property {Element} root
 * 
 * @property {string} curPage
 * @property {{[id: string]: Page}} pages
 * @property {{[id: string]: PageListeners}} listeners
 */

/** @type {SPAState} */
const spa = {
  curPage: null,
  pages: {},
  listeners: {},
}

/**
 * Listens to page event
 * @param {string} page Name of page to listen to
 * @param {PageEvent} event Name of event to listen for
 * @param {Function} cb Listener callback.
 */
export const addEventListener = (page, event, cb) => {
  if(!(page in spa.listeners)) return;
  spa.listeners[page][event].push(cb);
}

const emitClose = (id) => {
  if(!(id in spa.listeners)) return console.error(id, "not found in listeners!", spa.listeners);
  spa.listeners[id].close.forEach((fn) => {
    fn(id);
  })
}

/**
 * Execute all page open event listeners and wait for them to finish.
 * @param {string} id Page ID
 */
const awaitOpen = async (id) => {
  if(!(id in spa.listeners)) return console.error(id,"not found in listeners!", spa.listeners);
  const a = Promise.allSettled(spa.listeners[id].open.map((fn) => {
    return fn(id);
  }))
  await a;
}

/**
 * Opens specified page.
 * @param {string} href Page to go to.
 */
export const goto = async (href) => {
  if(!(href in spa.pages)) return console.error("Could not find page to go to!");
  spa.root.className = "loading";
  console.debug(`Opening page '${href}'...`);

  if(spa.curPage) {
    spa.pages[spa.curPage].el.className = "hide";
    emitClose(spa.curPage);
  }
  spa.curPage = href;

  
  await awaitOpen(href); // wait for all open listeners to resolve
  
  spa.pages[href].el.className = "";
  spa.root.className = "";
}

/**
 * 
 * @param {Element} nav The nav link container.
 * @param {Element} root The parent element of all pages.
 */
export const initSPA = (nav, root) => {
  if(!nav) return console.error("No nav supplied for SPA!");
  if(!root) return console.error("No root supplied for SPA!");

  console.info("Initialised SPA.");
  spa.nav = nav;
  spa.root = root;
  
  
  if (root.childElementCount != nav.childElementCount) {
    console.warn("Mismatch of links in the nav and pages in root element!", "nav:", nav.childElementCount, "root:", root.childElementCount);
  }

  let children = root.children;
  for(let i = 0; i < children.length; i++) {
    const el = children[i];
    spa.pages[el.id] = {
      id: el.id,
      el,
      link: null,
    };
    spa.listeners[el.id] = {
      open: [],
      close: [],
    }
  }

  children = nav.children;
  for(let i = 0; i < children.length; i++) {
    const el = children[i];
    const id = el.getAttribute("data-href");
    if (!(id in spa.pages)) {
      console.error("Nav link found with no corresponding page!");
      continue;
    }
    el.addEventListener("click", (e) => {
      e.preventDefault();
      goto(id);
    })
    spa.pages[id].link = el;
  }
}