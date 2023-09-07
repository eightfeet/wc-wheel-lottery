export interface LotteryOpt extends HTMLElement {
  _size: number;
  _playing: boolean;
}

export class Lottery extends HTMLElement implements LotteryOpt {
  _size: number;
  _prizes_dom: HTMLElement;
  _trigger_dom: HTMLElement;
  _playing: boolean;
  _old_dge: number = 0;

  constructor() {
    super();
  }

  static default_props = Object.freeze<{
    prize?: string;
  }>({
    // state: "end"
  });

  #prizesObs: MutationObserver;
  #triggerObs: MutationObserver;
  #attrsObs: MutationObserver;
  #resizeObs: ResizeObserver;

  connectedCallback() {
    // 处理size
    this.style.display = "block";
    this.style.position = "relative";
    this._size = Math.min(this.offsetWidth, this.offsetHeight);
    this._prizes_dom = this.querySelector('[title*="prizes"]');
    this._trigger_dom = this.querySelector('[title*="trigger"]');
    this.relayout();

    // 监听lotter大小变化
    // @ts-ignore
    this.#resizeObs = new ResizeObserver(([root]) => {
      const element = root.target as HTMLElement;
      this._size = Math.min(element.offsetWidth, this.offsetHeight);
      this.relayout()
    })
    this.#resizeObs.observe(this)

    // 创建奖品监听
    this.#prizesObs = new MutationObserver((mutationsList) => {
      mutationsList.forEach((m) => {
        if (m.type === "childList") {
          console.log("子节点发生变更");
        }
      });
    });

    // 开始奖品监听
    this.#prizesObs.observe(this._prizes_dom, {
      attributes: true,
      childList: true,
      subtree: true,
    });

    // 创建触发监听
    this.#triggerObs = new MutationObserver((mutationsList) => {
      mutationsList.forEach((m) => {
        if (m.type === "childList") {
          console.log("子节点发生变更");
        }
      });
    });
    // 触发监听
    this.#triggerObs.observe(this._trigger_dom, {
      attributes: true,
      childList: true,
      subtree: true,
    });

    // 监听属性变化
    this.#attrsObs = new MutationObserver(([ms]) => {
      if (ms.type === "attributes") {
        this.handleAttributes(ms.attributeName);
      }
    });
    this.#attrsObs.observe(this, { childList: false, attributes: true });
  }

  disconnectedCallback() {
    this.#prizesObs.disconnect();
    this.#triggerObs.disconnect();
  }

  handleAttributes(attributeName: string) {
    if (attributeName === "prize" && this._playing !== true) {
      this.lotter();
    }
  }

  roundTimer: number = undefined;

  handleEnded(prize: string) {
    this._playing = false;
    this.dispatchEvent(
      new CustomEvent('ended', {
        bubbles: true,
        composed: true,
        detail: prize
      })
    )
  }

  handlePlay(prize: string) {
    this._playing = true;
    this.dispatchEvent(
      new CustomEvent('play', {
        bubbles: true,
        composed: true,
        detail: prize
      })
    )
  }

  lotter() {
    const prize = this.getAttribute("prize");
    if (prize) {
      this.handlePlay(prize)
      const elements = Array.from(this._prizes_dom.children);
      let position: number | undefined;
      elements.some((el, ind) => {
        if (el.getAttribute("title") === prize) {
          position = ind;
        }
      });
      if (position === undefined) return;
      const length = elements.length;
      const eachDeg = 360 / length;
      const newtime = 5;
      const defaultRound = 6;
      let newdeg = eachDeg * position * -1;
      newdeg += 360 * defaultRound; // 默认旋转几周
      newdeg = newdeg + this._old_dge;
      this._old_dge = (newdeg - (newdeg % 360)) % 360;
      this._prizes_dom.style.transitionDuration = `${newtime}s`;
      this._prizes_dom.style.transform = `rotate(${newdeg}deg)`;
      //
      window.clearTimeout(this.roundTimer);
      this.roundTimer = setTimeout(() => {
        this._prizes_dom.style.transitionDuration = "0s";
        this._prizes_dom.style.transform = `rotate(${newdeg % 360}deg)`;
        this.handleEnded(prize);
      }, newtime * 1000 + 100);
    }
  }

  // 重绘
  relayout() {
    this.relayoutPrizes();
    this.relayoutTrigger();
  }

  // 重绘奖品
  relayoutPrizes() {
    if (!this._prizes_dom) return;
    const rootStyle = this._prizes_dom.style;
    rootStyle.position = "absolute";
    rootStyle.padding = "0";
    rootStyle.margin = "0";
    rootStyle.left = "0";
    rootStyle.top = "0";
    rootStyle.boxSizing = "border-box";
    rootStyle.width = "100%";
    rootStyle.height = "100%";
    rootStyle.borderRadius = `${this._size}px`;
    rootStyle.overflow = "hidden";
    const childrens = Array.from(this._prizes_dom.children);
    childrens.forEach((el, index) => {
      const element = el as HTMLElement;
      const elementStyle = element.style;
      const elementSize = Math.min(element.offsetHeight, element.offsetWidth);
      elementStyle.position = "absolute";
      elementStyle.width = `${elementSize}px`;
      elementStyle.height = `${elementSize}px`;
      elementStyle.left = `${this._size / 2 - elementSize / 2}px`;
      elementStyle.top = `${this._size / 2 - elementSize / 2}px`;
      elementStyle.transform = `translateY(${
        (this._size / 2 - elementSize / 2) * -1
      }px) rotate(${(index * 360) / childrens.length}deg)`;
      elementStyle.transformOrigin = `${elementSize / 2}px ${
        this._size / 2
      }px `;
    });
  }

  // 重绘抽奖按钮
  relayoutTrigger() {
    if (!this._trigger_dom) return;
    const triggerDomSize = Math.min(
      this._trigger_dom.offsetHeight,
      this._trigger_dom.offsetWidth
    );
    const triggerStyle = this._trigger_dom.style;
    triggerStyle.position = "absolute";
    triggerStyle.width = `${triggerDomSize}px`;
    triggerStyle.height = `${triggerDomSize}px`;
    triggerStyle.left = `${this._size / 2 - triggerDomSize / 2}px`;
    triggerStyle.top = `${this._size / 2 - triggerDomSize / 2}px`;
  }
}
