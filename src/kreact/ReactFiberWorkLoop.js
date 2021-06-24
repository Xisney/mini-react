import {
  updateFunctionComponent,
  updateHostComponent,
} from "./ReactFiberReconcile";
import { isStr, isFn, Placement, Update, updateNode } from "./utils";

// work in progress: wip 当前正在工作中的

let wipRoot = null;
// 下一个工作单元
let nextUnitOfWork = null;

// 调用scheduleUpdateOnFiber,就初始化好nextUnitOfWork,wipRoot
// 之后的调度监听参数的存在与否来决定是否更新fiber
// 相当于是设置一个任务的调度,等到有空闲时间时再去更新
export function scheduleUpdateOnFiber(fiber) {
  // 保存上一次的fiber
  fiber.alternate = { ...fiber };
  wipRoot = fiber;
  wipRoot.sibiling = null;
  nextUnitOfWork = wipRoot;
}

// 更新当前fiber，并返回下一个要处理的fiber
function performUnitOfWork(wip) {
  // 更新当前fiber
  const { type } = wip;
  if (isStr(type)) {
    updateHostComponent(wip);
  } else if (isFn(type)) {
    updateFunctionComponent(wip);
  }
  // 返回下一个任务
  // 深度优先
  if (wip.child) {
    return wip.child;
  }

  let next = wip;
  while (next) {
    if (next.sibiling) {
      return next.sibiling;
    }
    next = next.return;
  }
  return null;
}

// 定义传入requestIdleCallback的回调
// requestIdleCallback，传入的回调将在浏览器空闲时调用
// 属于低优先级任务
// 回调接收参数用于判断当前剩余空闲时间，以及是否超时
function workLoop(IdleDeadline) {
  while (IdleDeadline.timeRemaining() > 0 && nextUnitOfWork) {
    // 构建fiber树
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
  }

  // 设置下一次空闲时间的回调,为的是处理更新,只要程序运行
  // 就会不停处理
  requestIdleCallback(workLoop);

  if (!nextUnitOfWork && wipRoot) {
    // 没有下个任务直接提交
    commitRoot();
  }
}

// 回调仅调用一次，但是可以在有空闲时间的时候循环执行
requestIdleCallback(workLoop);

function commitRoot() {
  // 当前传入的为container的fiber，则直接从子节点的fiber更新
  commitWorker(wipRoot.child);
  // 防止每次workLoop时,都进行提交
  wipRoot = null;
}

// 提交最终dom更新
function commitWorker(wip) {
  if (!wip) {
    return;
  }

  // fiber不一定有dom节点
  // 得到parent dom并插入
  const { stateNode, props } = wip;
  let parentNode = getParentNode(wip.return);

  // 判断是否为初次渲染阶段
  // 利用位运算,快速判断flag
  if (wip.flag & Placement && stateNode) {
    parentNode.appendChild(stateNode);
  }

  // 判断是否为更新阶段
  if (wip.flag & Update && stateNode) {
    updateNode(stateNode, wip.alternate.props, props);
  }

  commitWorker(wip.child);
  commitWorker(wip.sibiling);
}

function getParentNode(wip) {
  let tem = wip;
  while (tem) {
    // dom最终一定存在
    if (tem.stateNode) {
      return tem.stateNode;
    }
    tem = tem.return;
  }
}
