export interface LotteryProps {
  prize?: string | number;
  activeclass?: string;
  type?: "wheel" | "grid";
  round?: number | string;
  class?: string;
}

type LotteryEventCallBack = (e: {
  /**奖品 */
  detail: string;
  [key: string]: any;
}) => void;

export interface LotteryEvents {
  /**event事件 
   * 抽奖动画结束时调用 
   * LotteryElement.addEventListener('ended', [fn]) 或 LotteryElement.onended = [fn] 方式调用
   */
  onended?: LotteryEventCallBack;
  /**event事件 
   * 抽奖动画开始时调用 
   * LotteryElement.addEventListener('play', [fn]) 或 LotteryElement.onplay = [fn] 方式调用
   */
  onplay?: LotteryEventCallBack;
  [key: string]: any;
}

window.addEventListener

export interface LotteryOpt extends HTMLElement {
  _size: number;
  _playing: boolean;
}

function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T {
  let lastCall = 0;
  return function (...args: Parameters<T>): ReturnType<T> {
    const now = Date.now();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    return func(...args);
  } as T;
}
export type LotteryType = "wheel" | "grid";

export class Lottery extends HTMLElement implements LotteryOpt {
  _size: number;
  _prizes_dom: HTMLElement;
  _prizes_dom_style: string;
  _prizes_child_dom_style: string[];

  _trigger_dom: HTMLElement;
  _playing: boolean;
  _old_position: number = 0;
  _old_dge: number = 0;
  _transitionDuration: number = 5000;
  _type: LotteryType = "wheel";
  _: string;
  _default_html: string;
  _prizes_grid_activeclass: string;
  _round: number = 6;

  constructor() {
    super();
  }

  #prizesObs: MutationObserver;
  #attrsObs: MutationObserver;
  #resizeObs: ResizeObserver;

  getRound() {
    this._round = Number(this.getAttribute("round")) || this._round;
  }

  getType() {
    const attrType = this.getAttribute("type") as LotteryType;
    this._type = ["wheel", "grid"].includes(attrType) ? attrType : "wheel";
  }

  getActiveclass() {
    this._prizes_grid_activeclass = this.getAttribute("activeclass");
  }

  init() {
    this.disconnect();
    this.style.display = "block";
    this.style.position = "relative";
    this._size = Math.min(this.offsetWidth, this.offsetHeight);
    // 固定宽高
    this.style.width = `${this._size}px`;
    this.style.height = `${this._size}px`;
    this.style.color = `red`;
    this._prizes_dom = this.querySelector('[title*="prizes"]');
    this._trigger_dom = this.querySelector('[title*="trigger"]');
    this._prizes_dom_style = this._prizes_dom.getAttribute("style");
    this._prizes_child_dom_style = Array.from(this._prizes_dom.children).map(
      (el) => el.getAttribute("style")
    );

    this.getActiveclass();
    this.getRound();
    // 监听lotter大小变化
    // @ts-ignore
    this.#resizeObs = new ResizeObserver(([root]) => {
      if (this._playing === true) {
        return;
      }
      const element = root.target as HTMLElement;
      this._size = Math.min(element.offsetWidth, this.offsetHeight);
      this._playing = false;
      this.relayout();
    });
    this.#resizeObs.observe(this);

    // 创建奖品监听
    this.#prizesObs = new MutationObserver((mutationsList) => {
      if (this._playing === true) {
        return;
      }
      mutationsList.forEach((m) => {
        if (m.type === "childList") {
          this.relayout();
        }
      });
    });

    // 开始奖品监听
    this.#prizesObs.observe(this._prizes_dom, {
      attributes: true,
      childList: true,
      subtree: true,
    });

    // 监听属性变化
    this.#attrsObs = new MutationObserver(
      throttle(([ms]) => {
        if (ms.type === "attributes") {
          this.handleAttributes(ms.attributeName);
        }
      }, 200)
    );
    this.#attrsObs.observe(this, { childList: false, attributes: true });
  }

  disconnect() {
    this.#prizesObs?.disconnect();
    this.#attrsObs?.disconnect();
    this.#resizeObs?.disconnect();
  }

  connectedCallback() {
    this.init();
    this.getType();
    this.relayout();
    this.handleLoad();
  }

  disconnectedCallback() {
    this.disconnect();
  }

  handleAttributes(attributeName: string) {
    if (this._playing === true) {
      return;
    } else if (attributeName === "prize") {
      this.lotter();
    }

    if (attributeName === "type") {
      if (this._prizes_dom_style) {
        this._prizes_dom.setAttribute("style", this._prizes_dom_style);
      }

      if (this._prizes_child_dom_style) {
        Array.from(this._prizes_dom.children).map((el, index) =>
          el.setAttribute("style", this._prizes_child_dom_style[index])
        );
      }

      this.init();
      this.getType();
      this.relayout();
    }

    if (attributeName === "round") {
      this.getRound();
    }

    if (attributeName === "activeclass") {
      this.getActiveclass();
    }
  }

  handleEnded(prize: string) {
    this.dispatchEvent(
      new CustomEvent("ended", {
        bubbles: true,
        composed: true,
        detail: prize,
      })
    );
  }

  handlePlay(prize: string) {
    this.dispatchEvent(
      new CustomEvent("play", {
        bubbles: true,
        composed: true,
        detail: prize,
      })
    );
  }

  handleLoad() {
    this.dispatchEvent(
      new CustomEvent("load", {
        bubbles: true,
        composed: true,
      })
    );
  }

  wheelLotter({
    elements,
    prize,
    position,
  }: {
    elements: Element[];
    prize: string;
    position: number;
  }) {
    const length = elements.length;
    const eachDeg = 360 / length;
    const newtime = `${this._transitionDuration}ms`;

    const defaultRound = this._round;
    let newdeg = eachDeg * position * -1;
    newdeg += 360 * defaultRound; // 默认旋转几周
    newdeg = newdeg + this._old_dge;
    this._old_dge = (newdeg - (newdeg % 360)) % 360;
    this._prizes_dom.style.transitionDuration = newtime;
    this._prizes_dom.style.transform = `rotate(${newdeg}deg)`;

    const fn = () => {
      this._prizes_dom.style.transitionDuration = "0s";
      this._prizes_dom.style.transform = `rotate(${newdeg % 360}deg)`;
      this.handleEnded(prize);
      this._prizes_dom.removeEventListener("transitionend", fn);
      this._playing = false;
    };

    this._prizes_dom.addEventListener("transitionend", fn);
  }

  gridLotter({
    elements,
    prize,
    position,
  }: {
    elements: Element[];
    prize: string;
    position: number;
  }) {
    const prizeLength = elements.length;
    const defaultRound = this._round;
    let allLength = prizeLength * defaultRound + position; //可用次数
    let speed = 300; //转动速度
    let nowcount: number = this._old_position; //当前的变化位置
    this._old_position = position;

    const dong = () => {
      //利用递归模拟setinterval的实现
      if (nowcount >= allLength) {
        this._playing = false;
        this.handleEnded(prize);
        speed = 300;
      } else {
        if (nowcount < prizeLength * 2 + this._old_position) {
          if (speed > 30) {
            console.log(speed);
            speed -= 30;
          } else {
            speed = 30;
          }
        }

        if (nowcount > allLength - prizeLength * 2) {
          speed += 10;
        }

        nowcount += 1;
        elements.forEach((e) =>
          e.classList.remove(this._prizes_grid_activeclass)
        );
        elements[nowcount % elements.length].classList.add(
          this._prizes_grid_activeclass
        );
        setTimeout(dong, speed);
      }
    };
    dong();
  }

  lotter() {
    const prize = this.getAttribute("prize");
    if (prize) {
      this._playing = true;
      this.handlePlay(prize);
      const elements = Array.from(this._prizes_dom.children);
      let position: number | undefined;
      elements.some((el, ind) => {
        if (el.getAttribute("title") === prize) {
          position = ind;
        }
      });

      if (position === undefined) {
        this._playing = false;
        throw new Error("Unable to locate the prize element!");
      }

      if (this._type === "grid") {
        this.gridLotter({ elements, position, prize });
      }

      if (this._type === "wheel") {
        this.wheelLotter({ elements, position, prize });
      }
    }
  }

  // 重绘
  relayout() {
    this.relayoutPrizes();
    this.relayoutTrigger();
  }

  relayoutPrizes() {
    if (this._type === "wheel") {
      this.relayoutWheelPrizes();
    }
    if (this._type === "grid") {
      this.relayoutGridPrizes();
    }
  }

  // 重绘奖品
  relayoutGridPrizes() {
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
    rootStyle.overflow = "hidden";
    const childrens = Array.from(this._prizes_dom.children);
    // 计算每边最佳元素个数
    const eachedgNum = Math.ceil(childrens.length / 4);
    // 计算每边步值step
    const step = this._size / (eachedgNum + 1);
    childrens.forEach((el, index) => {
      const element = el as HTMLElement;
      const elementStyle = element.style;
      elementStyle.position = "absolute";
      elementStyle.width = `${step}px`;
      elementStyle.height = `${step}px`;
      elementStyle.boxSizing = "border-box";
      const edgNo = Math.ceil((index + 1) / eachedgNum);
      if (edgNo === 1) {
        elementStyle.top = `${0}px`;
        elementStyle.left = `${step * index}px`;
      }

      if (edgNo === 2) {
        elementStyle.top = `${step * (index % eachedgNum)}px`;
        elementStyle.left = `${step * eachedgNum}px`;
      }

      if (edgNo === 3) {
        elementStyle.left = `${
          this._size - step * ((index % eachedgNum) + 1)
        }px`;
        elementStyle.bottom = `${0}px`;
      }

      if (edgNo === 4) {
        elementStyle.bottom = `${step * (index % eachedgNum)}px`;
        elementStyle.left = `${0}px`;
      }
    });
  }

  // 重绘奖品
  relayoutWheelPrizes() {
    if (!this._prizes_dom) return;
    const rootStyle = this._prizes_dom.style;
    rootStyle.position = "absolute";
    rootStyle.padding = "0";
    rootStyle.margin = "0";
    rootStyle.left = "0";
    rootStyle.top = "0";
    rootStyle.boxSizing = "border-box";
    rootStyle.width = `${this._size}px`;
    rootStyle.height = `${this._size}px`;
    rootStyle.borderRadius = `${this._size}px`;
    rootStyle.overflow = "hidden";
    const childrens = Array.from(this._prizes_dom.children);
    const halfEachDeg = 360 / childrens.length / 2;
    this._prizes_dom.style.transform = `rotate(${halfEachDeg % 360}deg)`;
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
