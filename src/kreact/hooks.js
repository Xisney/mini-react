// 函数组件对应一个fiber，在其上利用一个单链表
// 存放该函数组件的hooks
// 只能在最顶层使用hook，为的是保证hooks的顺序稳定性
// 利用顺序来标记每个hook

// 这也解释了为什么自定义hooks在不同的函数组件下使用,不会相互影响
// 实际上hooks都是绑定到当前函数式组件的fiber上的,每个函数组件的一次调用
// 就会生成不同的hooks,或创建,或返回,hook保存状态
// 调用后返回状态和操作状态的函数,所以不会相互影响,因为就根本操作的不是同一个地址空间

// hooks构成链表,每一个hook都是当前那个api状态的体现
// 函数调用那个就会返回状态和改变状态的函数
// 当调用改变状态的函数之后,改变hook的值
// 然后安排更新，之后就能获取到新的值并更新dom

import { scheduleUpdateOnFiber } from "./ReactFiberWorkLoop";
import { isFn } from "./utils";

// 单个hook的结构
// hook={
//   memorizedState 当前hook的状态
//   next 下一个hook
// }

// 这两个变量应该是所有的hook共用的
// 是针对于每个组件的
// 存放当前正在渲染的fiber
let currentlyRenderingFiber = null;
// 存放当前hook链的尾节点
let workInProggressHook = null;

// 初始化操作
export function renderHooks(wip) {
  currentlyRenderingFiber = wip;
  // 存放hooks链表的头节点
  currentlyRenderingFiber.memorizedState = null;
  workInProggressHook = null;
}

function updateWorkInProgressHook() {
  let hook;
  // 判断有无上次的节点来判断是更新阶段还是初次渲染
  const current = currentlyRenderingFiber.alternate;
  if (current) {
    // 更新阶段，即重新调用函数组件
    // 则此时会重新调用所有的hooks
    // 这里就体现了利用hooks的调用顺序来标记每个hooks
    // 在初始渲染阶段构建好hooks链表，每次调用就按顺序返回相应的hooks
    // 和hook的memorizedState
    // 传递头节点
    currentlyRenderingFiber.memorizedState = current.memorizedState;
    if (workInProggressHook) {
      // 上一个不是第0个
      hook = workInProggressHook = workInProggressHook.next;
    } else {
      // 是第0个
      hook = workInProggressHook = current.memorizedState;
    }
  } else {
    // 初次渲染
    hook = {
      memorizedState: null,
      next: null,
    };
    if (workInProggressHook) {
      // 不是第0个
      workInProggressHook = workInProggressHook.next = hook;
    } else {
      // 第0个
      currentlyRenderingFiber.memorizedState = workInProggressHook = hook;
    }
  }
  return hook;
}

export function useReducer(reducer, initalState, init) {
  const hook = updateWorkInProgressHook();

  // 初次渲染阶段赋予初始值
  if (!currentlyRenderingFiber.alternate) {
    if (init) {
      hook.memorizedState = init(initalState);
    } else {
      hook.memorizedState = initalState;
    }
  }

  const dispatch = (action) => {
    hook.memorizedState = reducer(hook.memorizedState, action);
    // 没有这一步，就是静态的，就是hooks调用不会重新渲染
    // 更新当前fiber对应的fiber树
    scheduleUpdateOnFiber(currentlyRenderingFiber);
  };
  return [hook.memorizedState, dispatch];
}

export function useState(initalState) {
  const hook = updateWorkInProgressHook();

  if (!currentlyRenderingFiber.alternate) {
    hook.memorizedState = initalState;
  }

  const setState = (arg) => {
    if (isFn(arg)) {
      hook.memorizedState = arg(hook.memorizedState);
    } else {
      hook.memorizedState = arg;
    }
    scheduleUpdateOnFiber(currentlyRenderingFiber);
  };

  return [hook.memorizedState, setState];
}
