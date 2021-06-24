wip:当前正在工作的 fiber
host：原生
拆成 fiber 节点，对应 dom 节点，划分优先级，进行更新

复用：
同一层级-一个节点下,key 相同，类型相同
fiber 上保存 hook，利用单向链表
因为 hooks 没有名字，用顺序来标记每个 hook
如果不是最顶层，顺序就不具有稳定性，就无法控制 hook
