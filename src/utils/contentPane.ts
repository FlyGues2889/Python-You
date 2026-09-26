/**
 * m3e-content-pane 滚动区适配工具。
 *
 * m3e-content-pane 的滚动发生在 shadow DOM 内的 .scroll-container 上,
 * host 本身不滚动:
 * - scrollTop / scrollTo / scrollHeight 等 API 无法直接作用于 host
 * - scroll 事件在 shadow 内触发,host 上的 @scroll 监听器不可靠
 * 统一经此工具解析 shadow 内的真实滚动容器,或在其上挂载滚动监听。
 */

/**
 * 获取 m3e-content-pane 的 shadow 内滚动容器;非 content-pane 元素原样返回(兼容回退)。
 * 有 shadowRoot 却还没渲染出 .scroll-container 时返回 null(「还没好」),
 * 不能退回 host —— host 本身不滚动,拿到它去读 scrollTop / 挂 scroll 监听都会静默失效,
 * syncPaneToToc 那样在 host 上定义 scrollTop 访问器还会自我递归。
 */
export function paneScroller(el: HTMLElement | null | undefined): HTMLElement | null {
  if (!el) return null;
  if (!el.shadowRoot) return el;
  return el.shadowRoot.querySelector<HTMLElement>('.scroll-container');
}

/**
 * 等滚动容器就绪后再回调,返回取消函数。
 * 自定义元素刚挂载时 shadow 里还没有 .scroll-container(Lit 首次渲染在微任务里),
 * 单帧 rAF 未必等得到,因此重试:先走微任务(能赶在首帧之前拿到容器,
 * 恢复滚动位置时用户看不到从顶部跳一下),微任务用尽再退回 rAF。
 */
export function whenPaneScroller(
  el: HTMLElement | null | undefined,
  cb: (sc: HTMLElement) => void,
  maxTries = 20
): () => void {
  const MICROTASK_TRIES = 12;
  let cancelled = false;
  let tries = 0;
  const attempt = () => {
    if (cancelled) return;
    const sc = paneScroller(el);
    if (sc) {
      cb(sc);
      return;
    }
    if (++tries > maxTries) return;
    if (tries <= MICROTASK_TRIES) queueMicrotask(attempt);
    else requestAnimationFrame(attempt);
  };
  attempt();
  return () => { cancelled = true; };
}

/** 在滚动容器上挂载 scroll 监听(自动解析 shadow 内容器),返回取消函数。 */
export function watchPaneScroll(
  el: HTMLElement | null | undefined,
  handler: (e: Event) => void
): () => void {
  const sc = paneScroller(el);
  if (!sc) return () => {};
  sc.addEventListener('scroll', handler);
  return () => sc.removeEventListener('scroll', handler);
}
