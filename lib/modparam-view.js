'use babel';
// my-component.js
/** @jsx etch.dom */


const etch = require('etch')

export class ModparamsView {
  constructor (props, children) {
    this.modparams = props.modparams
    this.modparamSelected = props.modparamSelected
    etch.initialize(this)
  }

  toggleCollapseItem(event) {
      let nested = event.target.parentElement.parentElement
      nested.classList.toggle("expanded")
      nested.classList.toggle("collapsed")
      nested.classList.toggle("selected")
  }

  getValueTypeClass(value) {
     var classes = [
         "numeric-value",
         "boolean-value",
         "quoted-string-value",
         "unquoted-string-value"
     ]
     var patterns = [
         /^\d+$/gm,
         /^(true|false|yes|no)$/gm,
         /^["'].*["']$/gm,
         /^["']{0}.*["']{0}$/gm
     ]

     for(var i=0; i<4; i++) {
         if (patterns[i].exec) {
             return classes[i]
         }
     }

     return ""
  }

  render () {

    modparamsTree = []
    for (var mod in this.modparams){
        let params = this.modparams[mod].params.map(function(p) {
            return <li class='list-item'>
                        <span class='icon icon-settings'>{p.param} = </span>
                        <span class={this.getValueTypeClass(p.value)}>{p.value}</span>
                    </li>
        })
        modparamsTree.push(<li class='list-nested-item collapsed'>
               <div class={'list-item module-item block ' + mod}>
                   <span class='icon icon-plug text-highlight'  on={{click: this.toggleCollapseItem}}>{mod}</span>
                   <span class='badge' style="margin-left: 1em;">{params.length}</span>
               </div>
               <ul class='list-tree'>
                 {params}
               </ul>
            </li>
        )
    }

    return <atom-panel class='padded modparams-view' style="overflow-y:auto;">
               <ul class='list-tree has-collapsable-children'>
                    {modparamsTree}
               </ul>
           </atom-panel>
  }

  update (props, children) {
    this.modparams = props.modparams
    return etch.update(this)
  }
}
