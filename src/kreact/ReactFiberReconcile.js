import { isStr, Update, updateNode } from "./utils";
import { createFiber } from "./fiber";
import { renderHooks } from "./hooks";

export function updateHostComponent(wip) {
  // 更新节点自身
  if (!wip.stateNode) {
    wip.stateNode = createNode(wip);
  }

  reconcileChildren(wip, wip.props.children);
}

// vnode(host)->node
function createNode(vnode) {
  const { type, props } = vnode;
  const node = document.createElement(type);

  updateNode(node, {}, props);

  return node;
}

export function updateFunctionComponent(wip) {
  // 函数式组件单独提出来更新
  // type为一个函数
  // 初始化调度hook相关的参数
  // 下一次更新时，下面调用函数，直接就可获取所有hooks
  renderHooks(wip);
  const { type, props } = wip;
  // 返回jsx，函数式组件没有自己的dom
  // 通过调用函数返回子节点的vnode，然后作为上一级的fiber的child
  // 之后再提交更新
  let children = null;
  try {
    children = type(props);
  } catch (e) {
    // 命中此逻辑说明是构造函数
    children = new type().render();
  }

  reconcileChildren(wip, children);
}

// 构建wip及其子节点的fiber树
function reconcileChildren(wip, children) {
  if (isStr(children)) {
    return;
  }

  children = Array.isArray(children) ? children : [children];
  let preNewFiber = null;

  // 获取到上一次的fiber,就是还没更新前的fiber进行对比
  let oldFiber = wip.alternate?.child;

  children.forEach((child) => {
    if (child === null) return;
    const newFiber = createFiber(child, wip);

    if (isSameNode(newFiber, oldFiber)) {
      Object.assign(newFiber, {
        // 复用dom节点
        stateNode: oldFiber.stateNode,
        alternate: oldFiber,
        // 当前fiber状态设置为更新
        flag: Update,
      });
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibiling;
    }

    if (preNewFiber === null) {
      wip.child = newFiber;
    } else {
      preNewFiber.sibiling = newFiber;
    }
    preNewFiber = newFiber;
  });
}

// 这里的diff,没有考虑同一fiber层级下,顺序的变化
// 1 2 3 4
// 2 3 4 1
// 这样的变化,统一节点下还是不能复用
function isSameNode(a, b) {
  return !!(a && b && a.key === b.key && a.type === b.type);
}
