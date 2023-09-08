var $=Object.defineProperty;var x=(s,e,t)=>e in s?$(s,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):s[e]=t;var h=(s,e,t)=>(x(s,typeof e!="symbol"?e+"":e,t),t),y=(s,e,t)=>{if(!e.has(s))throw TypeError("Cannot "+t)};var c=(s,e,t)=>(y(s,e,"read from private field"),t?t.call(s):e.get(s)),g=(s,e,t)=>{if(e.has(s))throw TypeError("Cannot add the same private member more than once");e instanceof WeakSet?e.add(s):e.set(s,t)},_=(s,e,t,r)=>(y(s,e,"write to private field"),r?r.call(s,t):e.set(s,t),t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))r(i);new MutationObserver(i=>{for(const o of i)if(o.type==="childList")for(const n of o.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&r(n)}).observe(document,{childList:!0,subtree:!0});function t(i){const o={};return i.integrity&&(o.integrity=i.integrity),i.referrerPolicy&&(o.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?o.credentials="include":i.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function r(i){if(i.ep)return;i.ep=!0;const o=t(i);fetch(i.href,o)}})();function b(s,e){let t=0;return function(...r){const i=Date.now();if(!(i-t<e))return t=i,s(...r)}}window.mythrottle=b;var u,f,p;class z extends HTMLElement{constructor(){super();h(this,"_size");h(this,"_prizes_dom");h(this,"_trigger_dom");h(this,"_playing");h(this,"_old_dge",0);h(this,"_transitionDuration",5e3);g(this,u,void 0);g(this,f,void 0);g(this,p,void 0);h(this,"roundTimer")}connectedCallback(){this.style.display="block",this.style.position="relative",this._size=Math.min(this.offsetWidth,this.offsetHeight),this._prizes_dom=this.querySelector('[title*="prizes"]'),this._trigger_dom=this.querySelector('[title*="trigger"]'),this.relayout(),_(this,p,new ResizeObserver(([t])=>{if(this._playing===!0)return;const r=t.target;this._size=Math.min(r.offsetWidth,this.offsetHeight),this._playing=!1,this.relayout()})),c(this,p).observe(this),_(this,u,new MutationObserver(t=>{this._playing!==!0&&t.forEach(r=>{r.type==="childList"&&this.relayout()})})),c(this,u).observe(this._prizes_dom,{attributes:!0,childList:!0,subtree:!0}),_(this,f,new MutationObserver(b(([t])=>{t.type==="attributes"&&this.handleAttributes(t.attributeName)},this._transitionDuration))),c(this,f).observe(this,{childList:!1,attributes:!0})}disconnectedCallback(){c(this,u).disconnect()}handleAttributes(t){if(this._playing===!0){console.log("正在抽奖"),console.log("抽奖还未结束请勿开始");return}else t==="prize"&&this.lotter()}handleEnded(t){this.dispatchEvent(new CustomEvent("ended",{bubbles:!0,composed:!0,detail:t}))}handlePlay(t){this.dispatchEvent(new CustomEvent("play",{bubbles:!0,composed:!0,detail:t}))}lotter(){const t=this.getAttribute("prize");if(t){console.log("开始"),this._playing=!0,this.handlePlay(t);const r=Array.from(this._prizes_dom.children);let i;if(r.some((v,w)=>{v.getAttribute("title")===t&&(i=w)}),i===void 0)return;const n=360/r.length,l=`${this._transitionDuration}ms`,d=6;let a=n*i*-1;a+=360*d,a=a+this._old_dge,this._old_dge=(a-a%360)%360,this._prizes_dom.style.transitionDuration=l,this._prizes_dom.style.transform=`rotate(${a}deg)`;const m=()=>{this._prizes_dom.style.transitionDuration="0s",this._prizes_dom.style.transform=`rotate(${a%360}deg)`,this.handleEnded(t),this._prizes_dom.removeEventListener("transitionend",m),this._playing=!1};this._prizes_dom.addEventListener("transitionend",m)}}relayout(){this.relayoutPrizes(),this.relayoutTrigger()}relayoutPrizes(){if(!this._prizes_dom)return;const t=this._prizes_dom.style;t.position="absolute",t.padding="0",t.margin="0",t.left="0",t.top="0",t.boxSizing="border-box",t.width="100%",t.height="100%",t.borderRadius=`${this._size}px`,t.overflow="hidden";const r=Array.from(this._prizes_dom.children);r.forEach((i,o)=>{const n=i,l=n.style,d=Math.min(n.offsetHeight,n.offsetWidth);l.position="absolute",l.width=`${d}px`,l.height=`${d}px`,l.left=`${this._size/2-d/2}px`,l.top=`${this._size/2-d/2}px`,l.transform=`translateY(${(this._size/2-d/2)*-1}px) rotate(${o*360/r.length}deg)`,l.transformOrigin=`${d/2}px ${this._size/2}px `})}relayoutTrigger(){if(!this._trigger_dom)return;const t=Math.min(this._trigger_dom.offsetHeight,this._trigger_dom.offsetWidth),r=this._trigger_dom.style;r.position="absolute",r.width=`${t}px`,r.height=`${t}px`,r.left=`${this._size/2-t/2}px`,r.top=`${this._size/2-t/2}px`}}u=new WeakMap,f=new WeakMap,p=new WeakMap,h(z,"default_props",Object.freeze({}));customElements.define("wc-wheel-lottery",z);
