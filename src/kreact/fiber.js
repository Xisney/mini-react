// fiber是一个组件，将要执行或已经执行的任务，是一个对象
// fiber使得react可以按优先级更新，更新可取消，增量更新，提升性能

import { Placement } from "./utils";

export function createFiber(vnode, returnFiber) {
  const fiber = {
    // string
    // function
    // class (typeof class => funtion
    type: vnode.type,
    // 当前层级下的唯一性
    key: vnode.key,
    props: vnode.props,

    // fiber树结构表示
    child: null,
    sibiling: null,
    return: returnFiber,

    // 标记当前层级的位置，渲染的一个顺序
    index: 0,
    // host dom
    // class
    stateNode: null,
    // 标记fiber的作用，插入，更新、删除
    flag: Placement,
    // 指向上一次的fiber
    alternate: null,
  };

  return fiber;
}
