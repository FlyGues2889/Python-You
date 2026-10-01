// 分栏布局（HANDOFF 提示词 6 批次 1）：从 App.vue 搬出，行为不变。
// 工作区栏（外层 split 的 start 面板）折叠采用临界阻尼模型（死区 + overshoot 阻尼 + 距离/时间双门控）；
// 终端面板（内层 split）采用固定像素高度模型（窗口高度改变时终端保持像素高度不变）。
import { onMounted, ref } from 'vue';

export function useSplitLayout() {
  // 工作区栏(外层 split 的 start 面板)折叠——临界阻尼模型:
  // 0–220px 为死区,面板不允许停留其中。临界处复刻 m3e-split-pane 内建的 overshoot 阻尼
  // (与终端手柄一致的手感,overshootLimit=4):拖过临界时面板被压缩在锚点附近,拖得越远
  // 阻力越重;越过临界后继续拖过一段距离(180px)且至少按住 250ms 即切换状态,无需松手:
  // - 展开态拖过 220px 临界继续左拉 → 阻尼 → 再拖 180px → 折叠到 0
  // - 折叠态(0px)继续右拉 → 阻尼 → 再拖 180px → 展开到 220px
  // 时间门控保证快速拖动时面板也在临界处被按住可感知的时间,而非瞬间跳变切换
  // 切换后拖动继续生效(折叠后右拉可再次展开,展开后左拉可再次折叠),当前状态由
  // workspaceCollapsed 记录——不能用 value 判断,阻尼期间的压缩值会污染状态判定。
  // 不用组件 min/max(其松手 snap 有 250ms 回弹动画会延迟切换):直接覆写 el.value 模拟压缩,
  // input 事件在每个 mousemove 内同步触发,覆写在 paint 前完成 → 无中间态、无过渡动画。
  // 文件树最小展开宽度(px):面板低于该宽度进入死区(阻尼区)
  const WORKSPACE_MIN_EXPAND_PX = 220;
  // 手柄容器实际宽度 8px(m3eStyle.css 全局覆盖,m3e 默认 24px),flex-basis 减半 4px
  const WORKSPACE_HANDLE_HALF = 4;
  // 阻尼压缩上限(px),与组件 overshootLimit 默认 4(%)的手感一致
  const WORKSPACE_OVERSHOOT_LIMIT_PX = 4;
  // 越过临界后继续拖动超过此距离(px)立即切换折叠/展开状态。
  // 阈值即阻尼区间的长度:180px 几乎覆盖整个 220px 死区,面板在临界处被钉住,
  // 手指需持续拖过 180px(慢速拖约 0.6s)才会触发切换——阻尼感持续最久
  const WORKSPACE_DRAG_SWITCH_PX = 180;
  // 进入死区后至少保持该时长(ms)的阻尼才允许切换:快速拖动时帧间距离大,
  // 距离阈值 1~2 帧即达标,面板只"卡住"几十毫秒感知不到;时间门控保证
  // 面板在临界处被按住的时间可感知(慢速拖动距离先达标时时间早已满足,不受影响)
  const WORKSPACE_DRAG_MIN_HOLD_MS = 250;
  // 受控值:拖拽/折叠/展开后的真实 value(替换原写死的 :value="20",避免 Vue 重渲染重置面板)
  const workspaceSplitValue = ref(20);
  // 当前折叠状态(阻尼压缩值 >0 会污染 value 判定,须单独记录)
  let workspaceCollapsed = false;
  // 本次拖拽进入死区时的面板宽度起点(px):阻尼距离从该点起算,负值表示未进入死区
  let workspaceCollapsedEntryPx = -1;
  let workspaceExpandedEntryPx = -1;
  // 本次进入死区的时间戳(ms):距离达标后还需经过最小保持时长才能切换
  let workspaceDeadzoneEnteredAt = 0;

  const onWorkspaceSplitPointerDown = (e: Event) => {
    const el = e.currentTarget as HTMLElement & { value: number };
    workspaceCollapsed = (Number(el.value) || 0) <= 0;
    workspaceCollapsedEntryPx = -1;
    workspaceExpandedEntryPx = -1;
  };

  const handleWorkspaceSplitInput = (e: Event) => {
    const el = e.currentTarget as HTMLElement & { value: number };
    // 同 onInnerSplitInput：内层分栏与各种输入框的 input 事件都会冒泡到这里
    if (e.target !== el) return;
    const hostWidth = el.clientWidth;
    if (hostWidth <= 0) return;
    const raw = Number(el.value) || 0;
    const panePx = (raw / 100) * hostWidth - WORKSPACE_HANDLE_HALF;
    let value = raw;
    if (workspaceCollapsed) {
      // 折叠态:右拉进入死区 → 阻尼锚 0;越过临界继续拉过阈值 → 立即展开
      if (panePx > 0) {
        if (workspaceCollapsedEntryPx < 0) {
          workspaceCollapsedEntryPx = panePx;
          workspaceDeadzoneEnteredAt = Date.now();
        }
        if (
          panePx - workspaceCollapsedEntryPx >= WORKSPACE_DRAG_SWITCH_PX &&
          Date.now() - workspaceDeadzoneEnteredAt >= WORKSPACE_DRAG_MIN_HOLD_MS
        ) {
          // 切换时两个距离起点全部重置:否则旧起点会让切换后下一帧立即再次触发(抽搐)
          workspaceCollapsed = false;
          workspaceCollapsedEntryPx = -1;
          workspaceExpandedEntryPx = -1;
          value = ((WORKSPACE_MIN_EXPAND_PX + WORKSPACE_HANDLE_HALF) / hostWidth) * 100;
        } else {
          const compressed =
            (WORKSPACE_OVERSHOOT_LIMIT_PX * panePx) / (panePx + WORKSPACE_OVERSHOOT_LIMIT_PX);
          value = ((compressed + WORKSPACE_HANDLE_HALF) / hostWidth) * 100;
        }
      } else {
        // 拖回 0 或以下:贴 0,重置右拉距离起点
        workspaceCollapsedEntryPx = -1;
        value = 0;
      }
    } else if (panePx < WORKSPACE_MIN_EXPAND_PX) {
      // 展开态:左拉过 220px 临界 → 阻尼锚 220;越过临界继续拉过阈值 → 立即折叠
      if (workspaceExpandedEntryPx < 0) {
        workspaceExpandedEntryPx = panePx;
        workspaceDeadzoneEnteredAt = Date.now();
      }
      if (
        workspaceExpandedEntryPx - panePx >= WORKSPACE_DRAG_SWITCH_PX &&
        Date.now() - workspaceDeadzoneEnteredAt >= WORKSPACE_DRAG_MIN_HOLD_MS
      ) {
        // 切换时两个距离起点全部重置:否则旧起点会让切换后下一帧立即再次触发(抽搐)
        workspaceCollapsed = true;
        workspaceCollapsedEntryPx = -1;
        workspaceExpandedEntryPx = -1;
        value = 0;
      } else {
        const overshoot = WORKSPACE_MIN_EXPAND_PX - panePx;
        const compressed =
          (WORKSPACE_OVERSHOOT_LIMIT_PX * overshoot) / (overshoot + WORKSPACE_OVERSHOOT_LIMIT_PX);
        value = ((WORKSPACE_MIN_EXPAND_PX - compressed + WORKSPACE_HANDLE_HALF) / hostWidth) * 100;
      }
    } else {
      // 拖回 220px 以上:自由区,重置左拉距离起点
      workspaceExpandedEntryPx = -1;
    }
    if (value !== raw) {
      // 覆写组件值 → 面板被阻尼压缩在锚点附近(与组件内建 overshoot 视觉一致)
      el.value = value;
    }
    workspaceSplitValue.value = value;
  };

  // 终端面板采用"固定像素高度"模型：窗口高度改变时终端保持像素高度不变
  // （窗口最矮时终端多高，调高窗口后仍保持该高度），而不是按 25% 比例放大
  // 露出更多内容。仅用户拖拽手柄会改变终端像素高度（下限 28px 最小高度）。
  // split-pane 拖拽时内部 value 变化并派发 input 事件——必须受控绑定（@input 同步到
  // innerSplitValue），否则窗口高度改变导致 Vue 重渲染时，组件 value 会被强制重置回 75。
  const innerSplitPaneRef = ref<HTMLElement | null>(null);
  const innerSplitMax = ref(100);
  const innerSplitValue = ref(75);
  let innerSplitResizeObserver: ResizeObserver | null = null;
  // 终端面板的固定像素高度：null 表示尚未初始化（首次用当前 25% 比例记录）
  let terminalHeightPx: number | null = null;

  // 拖拽/键盘调整时同步内部值，并记录新的终端像素高度作为后续保持的基准
  const onInnerSplitInput = (e: Event) => {
    // input 事件是冒泡的：编辑器 textarea 与终端输入框的原生 input 也会打到这里。
    // 只认分栏自己派发的事件——它的 value 是百分比，而输入框的 value 是文本，
    // 内容清空时 Number('') === 0，会把编辑区占比设成 0（高度塌成零）并污染终端像素高度。
    const el = e.currentTarget as HTMLElement & { value: number };
    if (e.target !== el) return;
    const v = Number(el.value);
    if (Number.isNaN(v)) return;
    innerSplitValue.value = v;
    const h = el.clientHeight;
    if (h > 0) {
      // end 面板像素高度 = (100 - v)% × h - 4（手柄半宽），下限 28px
      terminalHeightPx = Math.max(28, ((100 - v) / 100) * (h - 4));
    }
  };

  const updateInnerSplitMax = () => {
    const el = innerSplitPaneRef.value;
    if (!el) return;
    const h = el.clientHeight;
    if (h <= 0) return;
    // end 面板可用高度 = h - 4（手柄半宽）；拖拽上限保证终端 ≥ 28px 最小高度
    const available = Math.max(0, h - 4);
    innerSplitMax.value = Math.max(0, Math.min(100, ((available - 28) / h) * 100));
    // 首次运行：以当前面板比例（初始 25%）记录终端像素高度
    if (terminalHeightPx === null) {
      terminalHeightPx = Math.max(28, ((100 - innerSplitValue.value) / 100) * available);
    }
    // 窗口高度改变：终端保持固定像素高度（最小 28px；窗口过矮放不下时占满可用高度）
    const px = Math.min(terminalHeightPx, available);
    innerSplitValue.value = Math.max(0, Math.min(100, ((available - px) / h) * 100));
  };

  const attachInnerSplitResizeObserver = () => {
    const el = innerSplitPaneRef.value;
    if (!el || innerSplitResizeObserver) return;
    innerSplitResizeObserver = new ResizeObserver(updateInnerSplitMax);
    innerSplitResizeObserver.observe(el);
    updateInnerSplitMax();
  };

  // 初始挂载后确保观察器就位（activeNavTab 的切换监听放在其声明之后）
  onMounted(attachInnerSplitResizeObserver);

  return {
    workspaceSplitValue,
    onWorkspaceSplitPointerDown,
    handleWorkspaceSplitInput,
    innerSplitPaneRef,
    innerSplitValue,
    innerSplitMax,
    onInnerSplitInput,
    attachInnerSplitResizeObserver,
  };
}
