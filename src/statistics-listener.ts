/**监听用户行为；用户访问性数据 */

import { ClickStatisticsData, PageViewStatisticsData } from './data';
import { getEventPath, getElementPath, getLastEvent, getElementProp } from './utils';
import webReport from '.';
import { StatisticsType } from './config';

let listened = false;

/**监听用户点击事件、页面浏览 */
export const start = () => {
  if (listened) return;
  listened = true;

  window.addEventListener(
    'click',
    e => {
      if (!e) return;
      setTimeout(() => {
        const ePath = getEventPath(e);
        const paths = getElementPath(ePath).join(' ');
        const lastEvent = getLastEvent();
        const lastPath = getElementPath(getEventPath(lastEvent)).join(' ');
        const lastTargetProp = getElementProp(lastEvent.target);
        const data = new ClickStatisticsData({
          subType: StatisticsType.click,
          path: paths,
          lastPath,
          lastElement: lastTargetProp,
          pageX: e.pageX,
          pageY: e.pageY,
          innerHeight: window.innerHeight,
          innerWidth: window.innerWidth,
          clientHeight: document.body.clientHeight,
          clientWidth: document.body.clientWidth,
        });
        webReport.send(data);
      });
    },
    true
  );

  if (webReport.options.single) {
    window.addEventListener('hashchange', e => {
      const data = getPageViewData({
        from: e.oldURL,
        historyType: 'hashChange',
      });
      webReport.send(data);
    });
    const originPushState = window.history.pushState;
    window.history.pushState = function (...args) {
      const oldUrl = location.href;
      originPushState.call(window.history, ...args);
      setTimeout(() => {
        const data = getPageViewData({
          from: oldUrl,
          historyType: 'pushState',
        });
        webReport.send(data);
      });
    };
    const originReplaceState = window.history.replaceState;
    window.history.replaceState = function (...args) {
      const oldUrl = location.href;
      originReplaceState.call(window.history, ...args);
      setTimeout(() => {
        const data = getPageViewData({
          from: oldUrl,
          historyType: 'replaceState',
        });
        webReport.send(data);
      });
    };
  }
  // window.addEventListener('beforeunload',e=>{
  // })
};

/** 当前页面信息 */
export const getPageViewData = (data?: Partial<PageViewStatisticsData>) => {
  return new PageViewStatisticsData({
    screenHeight: screen.height,
    screenWidth: screen.width,
    clientHeight: document.body.clientHeight,
    clientWidth: document.body.clientWidth,
    innerHeight: window.innerHeight,
    innerWidth: window.innerWidth,
    referrer: document.referrer,
    userAgent: navigator.userAgent,
    ...data,
  });
};
