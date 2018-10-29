'use babel';
/** @jsx etch.dom */

import coreProvider from './core-provider';
import pseudovariablesProvider from './pseudovariables-provider';
import transformationsProvider from './transformations-provider';
import selectsProvider from './selects-provider';
import {RoutesView} from './route-view'

const routeRegex = /^(?!.*[#|\/])(.*route.*)\[(.*)\]/gm

export default {
    getProvider() {
        return [coreProvider, pseudovariablesProvider, transformationsProvider, selectsProvider];
    }
};

function findRoutes() {
  let editor = atom.workspace.getActivePaneItem()
  let text = editor.getText()
  let buff = editor.getBuffer()
  var routes = []
  var r;
  while ((r = routeRegex.exec(text)) !== null) {
      routes.push({
          type: r[1],
          name: r[2],
          index: buff.positionForCharacterIndex(r.index)
      })
  }
  routes.sort((a,b) => (a.type < b.type) ? 1 : ((b.type < a.type) ? -1 : 0))
  console.log(routes);
  return routes
}

function onRouteItemClick(route) {
  let editor = atom.workspace.getActiveTextEditor()
  editor.setCursorBufferPosition(route.index, {autscroll: true})
  editor.moveToEndOfLine()
  atom.workspace.getCenter().activate()
}


export function activate() {

    const view = new RoutesView({
      routes: [],
      routeSelected: onRouteItemClick
    })

    const item = {
      element: view.element,
      getTitle: () => 'Routes',
      getURI: () => 'atom://kamailio-autocomplete/routes-view',
      getDefaultLocation: () => 'left'
    };

    atom.workspace.open(item);

    atom.commands.add('atom-workspace', {
        'autocomplete-kamailio:show-routes-view': () => {
            atom.workspace.toggle(item);
        }
    });

    atom.commands.add('atom-workspace', {
        'autocomplete-kamailio:refresh-routes-view': () => {
          view.update({routes: findRoutes()});
        }
    });
};
