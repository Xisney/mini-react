// import { isStr, updateNode, isObj } from "./utils";
import { scheduleUpdateOnFiber } from "./ReactFiberWorkLoop";

// 实现对vnode的直接渲染，在react中host即是指原生相关的东西
// 实现普通的渲染,利用递归更新，这个时候如果组件树太庞大
// 在更新的过程中js持续占用渲染进程的主线程，会导致页面的交互卡顿
// 所以利用fiber来实现增量更新，实现优先级更新，提升用户体验
// 更新是可以被打断的，分为两个阶段，调和阶段，以及提交阶段
// fiber指的是组件上将要完成或已经完成的任务，可以有一个或多个
// 与组件进行绑定
// function render(vnode, container) {
//   const node = createNode(vnode);
//   container.appendChild(node);
// }

// function createNode(vnode) {
//   const { type, props } = vnode;
//   const node = document.createElement(type);
//   // 属性处理
//   updateNode(node, props);
//   reconcilerChildren(node, props?.children);
//   return node;
// }

// function reconcilerChildren(parentNode, children) {
//   children = Array.isArray(children) ? children : [children];
//   children.forEach((child) => {
//     if (isObj(child)) {
//       render(child, parentNode);
//     }
//   });
// }

// requestIdleCallback,传入两个参数，一个是回调，一个是options
// 回调将在浏览器具有空闲时间时调用，可以通过options设置超时时间，来执行
// 只是具有空闲时间时调用callback，具体的逻辑在函数内实现

// 利用fiber来实现更新，而不是直接操作节点
// 通过更改fiber的属性等来实现一个更新
// 在reconcile阶段，实际上就是构建fiber树，根据传入的wiproot，一层一层的构建
// 先构建，然后找出下个wip，深度优先，构建所有节点
// 构建完成之后进入提交阶段，commit时，从fiber上取出相关属性，进行更新
// 如stateNode、return获得实际父dom节点
function render(vnode, container) {
  // 创建应用根节点container的fiber，fiberRoot
  // fiber是和实际的节点、组件对应的，可以是dom，函数组件，类组件
  // 等等其他各种类型的react组件
  const fiberRoot = {
    type: container.nodeName.toLowerCase(),
    stateNode: container,
    props: { children: vnode },
  };

  scheduleUpdateOnFiber(fiberRoot);
}

const reactDOM = { render };

export default reactDOM;
