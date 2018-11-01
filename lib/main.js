'use babel';
/** @jsx etch.dom */

import coreProvider from './core-provider';
import pseudovariablesProvider from './pseudovariables-provider';
import transformationsProvider from './transformations-provider';
import selectsProvider from './selects-provider';
import {RoutesView} from './route-view'
import {ModparamsView} from './modparam-view'

const routeRegex = /^(?!.*[#|\/])(.*route.*)\[(.*)\]/gm
const modparamRegex = /^modparam\(.(.*).,\W.(.*).,.(.*)\)/gm

export function getProvider() {
    return [coreProvider, pseudovariablesProvider, transformationsProvider, selectsProvider];
};

function findModparams() {
    var editor = atom.workspace.getActivePaneItem()
    var text = editor.getText()
    var buff = editor.getBuffer()
    var modparams = {}
    var r;
    while ((r = modparamRegex.exec(text)) !== null) {

        let module = r[1]
        if (modparams[module] === undefined) {
            modparams[module] = { params: [ ] }
        }
        modparams[module].pos = buff.positionForCharacterIndex(r.index)
        modparams[module].params.push({
            param: r[2],
            value: r[3]
        })
    }
    console.log(modparams)
    return modparams;
}

function findRoutes() {
    var editor = atom.workspace.getActivePaneItem()
    var text = editor.getText()
    var buff = editor.getBuffer()
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


    const routesView = new RoutesView({
      routes: [],
      routeSelected: onRouteItemClick
    })

    const modparamsView = new ModparamsView({ modparams: [] })

    const routesItem = {
      element: routesView.element,
      getTitle: () => 'Routing Blocks',
      getURI: () => 'atom://kamailio-autocomplete/routes-view',
      getDefaultLocation: () => 'left'
    };

    const modparamsItem = {
      element: modparamsView.element,
      getTitle: () => 'ModParams',
      getURI: () => 'atom://kamailio-autocomplete/modparams-view',
      getDefaultLocation: () => 'left'
    };

    atom.workspace.open(modparamsItem);
    atom.workspace.open(routesItem);

    atom.commands.add('atom-workspace', {
        'autocomplete-kamailio:show-routes-view': () => {
            atom.workspace.toggle(item);
        }
    });

    atom.commands.add('atom-workspace', {
        'autocomplete-kamailio:refresh-routes-view': () => {
          routesView.update({routes: findRoutes()});
          modparamsView.update({modparams: findModparams()})
        }
    });
};
