# wc-lottery

The `wc-lottery` is a high-performance lottery webcomponent.

## 🎡 Demo

- [https://www.eightfeet.cn/wc-wheel-lottery/](https://www.eightfeet.cn/wc-wheel-lottery/)

## 📦 Installation

```shell
    npm i @eightfeet/wc-lottery
```

## Attribute

- **class** string

  > wc-lottery 的样式名

  > 请确保 wc-lottery 的样式属性 display 为 block, 组件以此来计算内部宽高，此属性默认为 block，但不排除被父级影响或覆盖；

  ```html
  <style>
    .yourclass {
      display: block;
    }
  </style>
  <wc-lottery class="your class"> ... </wc-lottery>
  ```

- **prize** string | number;
  > wc-lottery 的奖品 id，当外部修改此属性时，组件内部开始启用抽奖动画，值为 undefined 时不开启抽奖动画
  ```html
  <wc-lottery prize="your prize"> ... </wc-lottery>
  ```
- **activeclass** string;
  > wc-lottery 的奖品项目被激活的样式；此属性仅在 type="grid"九宫格抽奖时才起作用，最终奖品将以此样式高亮显示;
  ```html
  <style>
    .youractiveclass {
      display: block;
    }
  </style>
  <wc-lottery activeclass="youractiveclass"> ... </wc-lottery>
  ```
- **type** "wheel" | "grid";

  > 类型：wheel 转盘抽奖，grid 九宫格抽奖 默认为 wheel

  ```html
  <wc-lottery type="grid"> ... </wc-lottery>
  ```

- **round** number | string;
  > 旋转圈数, 默认 6 圈
  ```html
  <wc-lottery round="6"> ... </wc-lottery>
  ```

## Event

- **onplay**

  > 抽奖动画开始时调用

  ```javascript
  // 方法1
  LotteryElement.addEventListener("play", ({detail}) => {console.log('奖品': detail)});
  // 方法2
  LotteryElement.onplay = ({detail}) => {console.log('奖品': detail)};
  ```

- **onended**
  > 抽奖动画结束时调用
  ```javascript
  // 方法1
  LotteryElement.addEventListener("ended", ({detail}) => {console.log('奖品': detail)});
  // 方法2
  LotteryElement.onended = ({detail}) => {console.log('奖品': detail)};
  ```

## Usage

```js
import "@eightfeet/wc-lottery";
```

```html
<style>
  .lottery {
    width: 50vw;
    height: 50vw;
  }

  ul {
    list-style: none;
  }

  li {
    background-color: #ccc;
    padding-top: 5px;
    display: flex;
    justify-content: center;
  }

  .button {
    width: 50px;
    height: 50px;
    background-color: #aaa;
    display: flex;
    justify-content: center;
    align-items: center;
    line-height: 1;
    user-select: none;
  }
</style>
<wc-lottery prize="1" class="lottery">
  <ul title="prizes" style="background-color: #eee;">
    <li title="1">1</li>
    <li title="4">4</li>
    <li title="3">3</li>
    <li title="8">8</li>
    <li title="6">6</li>
    <li title="2">2</li>
    <li title="9">9</li>
    <li title="10">10</li>
    <li title="5">5</li>
    <li title="7">7</li>
  </ul>
  <div title="trigger" class="button">按钮</div>
</wc-lottery>

<script>
  document.querySelector(".button").onclick = () => {
    document
      .querySelector(".lottery")
      .setAttribute("prize", `${Math.floor(Math.random() * 10)}`);
  };

  document.querySelector(".lottery").onplay = (prize) => {
    console.log("开始动画", `中奖${prize.detail}`);
  };

  document.querySelector(".lottery").onended = (prize) => {
    console.log("抽奖结束", `中奖${prize.detail}`);
  };
</script>
```

### 在 React + Typescript 中使用

```typescript
import { LotteryProps } from "@eightfeet/wc-lottery";
import { useState, DOMAttributes } from "react";

type LotteryElement<T> = Partial<
  T &
    DOMAttributes<T> & {
      children: any;
      ref: React.MutableRefObject<LotteryEvents | undefined>;
    }
>;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ["wc-lottery"]: LotteryElement<LotteryProps>;
    }
  }
}
```

```javascript
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import '@eightfeet/wc-lottery';
import { LotteryEvents } from "@eightfeet/wc-lottery";


const Lottery: React.FC<Props> = () => {
  const data = useMemo(() => ['1', '2', '3', '4'], [])
  const [prize, setPrize] = useState<string>();
  const lotteryRef = useRef<LotteryEvents>();

  // 抽奖
  const handleLottery = useCallback(
    async () => {
      const prize = await Promise.resolve('1');
      setPrize(prize);
    },
    [],
  );

  // 抽奖结束
  const handleLotteryEnded = useCallback(
    ({ detail }: { detail: string }) => {
      console.log('抽中', detail);
      setPrize(undefined)
    },
    [],
  );

  // 事件挂载
  useEffect(() => {
    if (lotteryRef.current) {
      lotteryRef.current.onended = handleLotteryEnded
    }
  }, [handleLotteryEnded])


  return <wc-lottery prize={prize} class={s.lt} ref={lotteryRef} activeclass={s.act} type="wheel" round={5}>
    <div title="prizes">
      {
        data.map(item => <div style={{ background: "red", borderRadius: 100 }} key={item} title={item}>{item}</div>)
      }
    </div>
    <button title="trigger" onClick={handleLottery}>
      抽奖
    </button>
  </wc-lottery>
};

```
