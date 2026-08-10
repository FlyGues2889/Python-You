/**
 * m3e-content-pane 滚动区适配工具。
 *
 * m3e-content-pane 的滚动发生在 shadow DOM 内的 .scroll-container 上,
 * host 本身不滚动:
 * - scrollTop / scrollTo / scrollHeight 等 API 无法直接作用于 host
 * - scroll 事件在 shadow 内触发,host 上的 @scroll 监听器不可靠
 * 统一经此工具解析 shadow 内的真实滚动容器,或在其上挂载滚动监听。
 */

/** 获取 m3e-content-pane 的 shadow 内滚动容器;非 content-pane 元素原样返回(兼容回退)。 */
export function paneScroller(el: HTMLElement | null | undefined): HTMLElement | null {
  if (!el) return null;
  return el.shadowRoot?.querySelector<HTMLElement>('.scroll-container') ?? el;
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
