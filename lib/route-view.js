'use babel';
// my-component.js
/** @jsx etch.dom */

const etch = require('etch')

export class RoutesView {
  constructor (props, children) {
    this.routes = props.routes
    this.title = "Routes"
    this.routeSelected = props.routeSelected
    etch.initialize(this)
  }

  elementForRouteItem(route) {
      return <li class='list-item route-item' on={{ click: () => this.routeSelected(route) }}>
               <i class='icon icon-code'></i>
               <span class={`${route.type}-item-type`}>{route.type}</span>
               <span>:{route.name}</span>
             </li>
  }

  render () {
    var routeItems = []
    this.routes.forEach(r => routeItems.push(this.elementForRouteItem(r)))
    // <div class="panel-heading">{this.title}</div>
    return <atom-panel class='padded routes-view'>
               <div class="panel-body padded" style="overflow-y:auto;">
                  <ul class='list-group'>
                      {routeItems}
                  </ul>
               </div>
           </atom-panel>
  }

  update (props, children) {
    this.routes = props.routes
    return etch.update(this)
  }
}
