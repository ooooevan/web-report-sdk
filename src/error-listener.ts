/**
 * 监听错误：运行时错误、资源加载错误
 */

import { ErrorType } from './config';
import { ErrorData } from './data';
import { formatStack, getElementPath, getElementProp, getEventPath, getLastEvent } from './utils';
import webReport from '.';

let listened = false;

/**监听错误 */
export const start = () => {
  if (listened) return;
  listened = true;
  window.addEventListener(
    'error',
    e => {
      if (!e) return;
      setTimeout(() => {
        const ePath = getEventPath(e);
        const paths = getElementPath(ePath).join(' ');
        const lastEvent = getLastEvent();
        const lastPath = getElementPath(getEventPath(lastEvent)).join(' ');
        const lastTargetProp = getElementProp(lastEvent.target);
        if (e.target instanceof HTMLElement) {
          // 资源加载错误
          const data = new ErrorData({
            subType: ErrorType.resource,
            path: paths,
            lastPath,
            lastElement: lastTargetProp,
            filename: (e.target as any).src || (e.target as any).href,
          });
          webReport.send(data);
        } else {
          // js运行时错误
          const data = new ErrorData({
            subType: ErrorType.normal,
            path: paths,
            lastPath,
            lastElement: lastTargetProp,
            filename: e.filename,
            message: e.message,
            lineno: e.lineno,
            colno: e.colno,
            stack: formatStack(e.error.stack).stack,
          });
          webReport.send(data);
        }
      });
    },
    true
  );

  window.addEventListener('unhandledrejection', e => {
    /**promise error */
    if (!e) return;
    setTimeout(() => {
      const data = new ErrorData();
      const lastEvent = getLastEvent();
      const lastPath = getElementPath(getEventPath(lastEvent)).join(' ');
      const lastTargetProp = getElementProp(lastEvent.target);
      data.lastPath = lastPath;
      data.lastElement = lastTargetProp;
      if (typeof e.reason === 'string') {
        /**reject */
        data.subType = ErrorType.promiseReject;
        data.message = e.reason;
        data.stack = '';
      } else {
        /**throw error */
        const stack = formatStack(e.reason.stack);
        data.subType = ErrorType.promiseError;
        data.message = e.reason.message;
        data.lineno = stack.lineno;
        data.colno = stack.colno;
        data.stack = stack.stack;
        data.filename = stack.filename;
      }
      webReport.send(data);
    });
  });

  const originError = console.error;
  console.error = function (...args) {
    originError.call(console.error, ...args);
    const lastEvent = getLastEvent();
    const lastPath = getElementPath(getEventPath(lastEvent)).join(' ');
    const lastTargetProp = getElementProp(lastEvent.target);
    const data = new ErrorData({
      lastPath: lastPath,
      lastElement: lastTargetProp,
      subType: ErrorType.console,
      message: args.join('\n'),
    });
    webReport.send(data);
  };
};
