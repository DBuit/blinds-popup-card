import { LitElement, html, css, svg } from 'lit-element';
import { classMap } from "lit-html/directives/class-map";
import { closePopUp } from 'card-tools/src/popup';
import { computeStateDisplay, computeStateName } from 'custom-card-helpers';

class BlindsPopupCard extends LitElement {
  config: any;
  hass: any;
  shadowRoot: any;

  static get properties() {
    return {
      hass: {},
      config: {},
      active: {}
    };
  }
  
  constructor() {
    super();
  }
  
  render() {
    var states = [
      {
          "icon": "mdi:blinds",
          "name": "dicht"
      },
      {
          "icon": "mdi:blinds-open",
          "name": "half open"
      },
      {
          "icon": "mdi:blinds-open",
          "name": "open"
      }
    ];
    var entities = this.config.entities;
    var fullscreen = "fullscreen" in this.config ? this.config.fullscreen : true;
    var switchWidth = this.config.switchWidth ? this.config.switchWidth : "180px";
    var value = 0;
    for(let i = 0; i< 3;i++) {
      let active = true;
      for(let j in entities) {
          let state = parseInt(this.hass.states[entities[j].entity].state);
          let position = parseInt(entities[j].positions[i]);
          if(state < (position -5) || state > (position + 5)) {
              active = false;
          }
      }

      if(active) {
          value = i;
      }
    }
    
    var count = -1;
    return html`
      <div class="${fullscreen === true ? 'popup-wrapper':''}">
        <div class="popup-inner" @click="${e => this._close(e)}">
      
          <div class="icon on${fullscreen === true ? ' fullscreen':''}">
            <ha-icon icon="${states[value].icon}"></ha-icon>
          </div>

          <h4>${states[value].name}</h4>

          <ul class="multi-switch" style="--switch-width:${switchWidth}">
            ${states.map(state => {
              count++;
              return html`<li @click="${e => this._switch(e)}" data-value="${count}" class="${count == value ? 'active' : ''}"><ha-icon icon="${state.icon}"></ha-icon>${state.name}</li>`
            })}
          </ul>
        </div>
      </div>
    `;
  }
  
  updated() { }

  _switch(e) {
    var value = e.path[0].dataset.value;
    for(var entity of this.config.entities) {
      this.hass.callService("input_number", "set_value", {
        entity_id: entity.entity,
        value: entity.positions[value]
      });
    }
  }

  _close(event) {
      if(event && event.target.className.includes('popup-inner')) {
          closePopUp();
      }
  }

  setConfig(config) {
    if (!config.entities) {
      throw new Error("You need to define entities");
    }
    this.config = config;
  }

  getCardSize() {
    return this.config.entities.length + 1;
  }
  
  static get styles() {
    return css`
        :host {

        }
        .popup-wrapper {
          margin-top:64px;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }
        .popup-inner {
          height: 100%;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
        }
        .fullscreen {
          margin-top:-64px;
        }
        .icon {
          text-align:center;
          display:block;
          height: 40px;
          width: 40px;
          color: rgba(255,255,255,0.3);
          font-size: 30px;
          padding-top:5px;
        }
        .icon ha-icon {
            width:30px;
            height:30px;
        }
        .icon.on ha-icon {
            fill: #f7d959;
        }
        h4 {
            color: #FFF;
            display: block;
            font-weight: 300;
            margin-bottom: 30px;
            text-align: center;
            font-size:20px;
            margin-top:0;
            text-transform: capitalize;
        }

        .multi-switch {
          width: var(--switch-width);
          background-color: rgba(255, 255, 255, 0.4);
          list-style: none;
          margin: 0;
          padding: 0;
          color: #000;
          font-weight: 400;
          border-radius: 12px;
          overflow: hidden;
        }
        .multi-switch li {
          padding: 25px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          cursor: pointer;
          font-weight:500;
          align-items: center;
          justify-content: center;
          display: flex;
          flex-direction: column;
          text-transform: capitalize;
        }
        .multi-switch li.active {
          background-color: #FFF;
        }
        .multi-switch li.active:hover {
          background-color: #FFF;
        }
        .multi-switch li:last-child {
          border-bottom: 0;
        }
        .multi-switch li ha-icon {
          display: block;
          font-size: 25px;
          margin-bottom: 5px;
          fill:#000;
          pointer-events: none;
        }
        .multi-switch li:hover {
          background-color: rgba(255, 255, 255, 0.5);
        }
        
    `;
  }
}
customElements.define("blinds-popup-card", BlindsPopupCard);