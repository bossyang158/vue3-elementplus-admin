/**
 * 检查元素是否包含某个类
 * @param {HTMLElement} ele - 待检查的元素
 * @param {string} cls - 类名
 * @returns {boolean} - 如果元素包含该类，则返回true
 */
export function hasClass(ele: HTMLElement, cls: string) {
  return !!ele.className.match(new RegExp("(\\s|^)" + cls + "(\\s|$)"));
}

/**
 * 为元素添加类
 * @param {HTMLElement} ele - 目标元素
 * @param {string} cls - 要添加的类名
 */
export function addClass(ele: HTMLElement, cls: string) {
  if (!hasClass(ele, cls)) ele.className += " " + cls;
}

/**
 * 从元素中移除类
 * @param {HTMLElement} ele - 目标元素
 * @param {string} cls - 要移除的类名
 */
export function removeClass(ele: HTMLElement, cls: string) {
  if (hasClass(ele, cls)) {
    const reg = new RegExp("(\\s|^)" + cls + "(\\s|$)");
    ele.className = ele.className.replace(reg, " ");
  }
}

/**
 * 检查路径是否为外部链接
 * @param {string} path - 待检查的路径
 * @returns {Boolean} - 如果是外部链接，则返回true
 */
export function isExternal(path: string) {
  const isExternal = /^(https?:|http?:|mailto:|tel:)/.test(path);
  return isExternal;
}
