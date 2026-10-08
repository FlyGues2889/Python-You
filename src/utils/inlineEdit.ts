// 内联编辑输入框（文件树的重命名 / 新建）共用的聚焦与「抢焦」防护。
//
// 右键菜单（m3e-menu，Teleport 到 body）的菜单项被点击后会关闭自己，并在关闭过程中
// 把焦点还原到菜单打开前的元素；刚挂载并 autofocus 的输入框会被抢焦一次，blur 随即
// 触发「失焦即提交」。空名字提交等于取消，输入框瞬间消失 —— 表现为「点了重命名没反应」。
// 还原时机跟着菜单关闭动画走，固定毫秒窗口兜底会随动画时长变化而失效（旧实现 250ms）。
// 改为记录「用户操作序号」：输入框出现后用户还没按过键 / 点过任何地方，这次 blur 就一定是
// 浮层副作用，抢回焦点继续编辑；用户真按了键或点了别处，序号已变，正常按提交处理。
let userActionSeq = 0;
const bumpUserAction = () => {
  userActionSeq++;
};

// 捕获阶段：不论事件落在哪个组件或浮层里都能记到
document.addEventListener('pointerdown', bumpUserAction, true);
document.addEventListener('keydown', bumpUserAction, true);

interface GuardedInput extends HTMLElement {
  __inlineEditSeqAtMount?: number;
}

/** 聚焦内联输入框并全选；同时记下当前用户操作序号（isOverlayCloseBlur 据此判断） */
export const focusInlineInput = (el: HTMLElement) => {
  (el as GuardedInput).__inlineEditSeqAtMount = userActionSeq;
  el.focus();
  if (el instanceof HTMLInputElement) el.select();
};

/** 这次 blur 是否是浮层关闭时的焦点还原：是则抢回焦点，不作为「失焦提交」 */
export const isOverlayCloseBlur = (el: HTMLElement): boolean =>
  (el as GuardedInput).__inlineEditSeqAtMount === userActionSeq;

/** 内联输入框共用指令：挂载即聚焦全选（原 FileTree / FileTreeNode 各自重复定义，已合并） */
export const vAutofocus = {
  mounted: (el: HTMLElement) => focusInlineInput(el)
};
