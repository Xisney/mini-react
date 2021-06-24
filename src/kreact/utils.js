export const NoFlags = /*                      */ 0b00000000000000000000;

export const Placement = /*                    */ 0b0000000000000000000010; // 2
export const Update = /*                       */ 0b0000000000000000000100; // 4
export const Deletion = /*                     */ 0b0000000000000000001000; // 8

// 工具函数
const toString = Object.prototype.toString;

function isStr(arg) {
  return typeof arg === "string";
}

function isNum(arg) {
  return typeof arg === "number";
}

function isStrOrNum(arg) {
  return isNum(arg) || isStr(arg);
}

function isObj(arg) {
  return toString.call(arg) === "[object Object]";
}

function isArr(arg) {
  return Array.isArray(arg);
}

function isFn(arg) {
  return toString.call(arg) === "[object Function]";
}

// 更新属性
function updateNode(node, oldProps, props) {
  if (!props) return;
  // 重置节点上的属性,如删除事件监听,相关的属性
  Object.keys(oldProps).forEach((k) => {
    if (k === "children") {
      if (isStrOrNum(oldProps[k])) {
        node.textContent = "";
      } else if (isArr(oldProps[k])) {
        oldProps[k].forEach((el) => {
          if (isStrOrNum(el)) {
            node.textContent = "";
          }
        });
      }
    } else if (k.startsWith("on")) {
      const eventName = k.slice(2).toLowerCase();
      // 若是函数组件,每次都会重新执行函数,回调实际上不一致
      node.removeEventListener(eventName, oldProps[k]);
    } else {
      node[k] = "";
    }
  });

  Object.keys(props).forEach((k) => {
    if (k === "children") {
      if (isStrOrNum(props[k])) {
        node.textContent += props[k] + "";
      } else if (isArr(props[k])) {
        props[k].forEach((el) => {
          if (isStrOrNum(el)) {
            node.textContent += el + "";
          }
        });
      }
    } else if (k.startsWith("on")) {
      const eventName = k.slice(2).toLowerCase();
      node.addEventListener(eventName, props[k]);
    } else {
      node[k] = props[k];
    }
  });
}

export { isStr, updateNode, isObj, isFn };
