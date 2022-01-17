/**
 * 监听性能属性：navigation、初次渲染、异步请求数据
 */
import { formatXhrOrFetchResourceUrl, getCacheType } from './utils';
import webReport from '.';
import { NavigationTimingData, RequestResourceStabilityData, ResourceStabilityData } from './data';
let listened = false;

/**监听性能属性 */
export const start = () => {
  if (listened) return;
  listened = true;

  /**异步请求。PerformanceObserver监听性能，xhr查看结果 */
  const xhrOrFetchResource: { [x: string]: RequestResourceStabilityData | undefined } = {};

  /**监听异步资源时间信息，无法知道请求响应信息，要知道请求响应信息需要重写xhr和fetch */
  new PerformanceObserver(list => {
    let entries = list.getEntries() as PerformanceResourceTiming[];
    /**过滤自身上报数据 */
    entries = entries.filter(entry => !entry.name.startsWith(webReport.options.server));
    const datas: ResourceStabilityData[] = [];
    entries.forEach(entry => {
      if (['xmlhttprequest', 'fetch'].includes(entry.initiatorType)) {
        xhrOrFetchResource[entry.name] = new RequestResourceStabilityData({
          cacheType: getCacheType(entry),
          name: entry.name,
          initiatorType: entry.initiatorType,
          transferSize: entry.transferSize,
          nextHopProtocol: entry.nextHopProtocol,
          startTime: entry.startTime,
          duration: entry.duration,
          encodedBodySize: entry.encodedBodySize,
          decodedBodySize: entry.decodedBodySize,
        });
      } else {
        datas.push(
          new ResourceStabilityData({
            cacheType: getCacheType(entry),
            name: entry.name,
            initiatorType: entry.initiatorType,
            transferSize: entry.transferSize,
            nextHopProtocol: entry.nextHopProtocol,
            startTime: entry.startTime,
            duration: entry.duration,
            encodedBodySize: entry.encodedBodySize,
            decodedBodySize: entry.decodedBodySize,
          })
        );
      }
    });
    if (datas.length) {
      webReport.send(datas);
    }
  }).observe({ entryTypes: ['resource'] });

  hackFetch(
    (response: Response) => {
      /**使用setTimeout，让PerformanceObserver先执行获得请求数据 */
      setTimeout(() => {
        let data = xhrOrFetchResource[formatXhrOrFetchResourceUrl(response.url)];
        if (data) {
          data = {
            ...data,
            status: response.status,
            bodyUsed: response.bodyUsed,
          };
          xhrOrFetchResource[formatXhrOrFetchResourceUrl(response.url)] = undefined;
          webReport.send(data);
        }
      });
    },
    (error: any, url: string) => {
      setTimeout(() => {
        let data = xhrOrFetchResource[formatXhrOrFetchResourceUrl(url)];
        if (data) {
          data = {
            ...data,
            cacheType: '',
            status: 0,
            message: error.toString(),
          };
          xhrOrFetchResource[formatXhrOrFetchResourceUrl(url)] = undefined;

          webReport.send(data);
        }
      });
    }
  );
  hackXMLHttpRequest(
    (xhr: any) => {
      setTimeout(() => {
        const url = xhr.target.responseURL;
        let data = xhrOrFetchResource[formatXhrOrFetchResourceUrl(url)];
        if (data) {
          data = {
            ...data,
            cacheType: '',
            status: xhr.target.status,
          };
          xhrOrFetchResource[formatXhrOrFetchResourceUrl(url)] = undefined;
          webReport.send(data);
        }
      });
    },
    (xhr: any) => {
      setTimeout(() => {
        const url = xhr.target._report_url;
        let data = xhrOrFetchResource[formatXhrOrFetchResourceUrl(url)];
        if (data) {
          data = {
            ...data,
            cacheType: '',
            status: 0,
            message: '<xhr error>', // 可能是服务器无响应、跨域
          };
          xhrOrFetchResource[formatXhrOrFetchResourceUrl('url')] = undefined;
          webReport.send(data);
        }
      });
    }
  );
};

/** 页面初始化数据 */
export const getNavigationTiming = () => {
  return new Promise<NavigationTimingData>((resolve, reject) => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    const navigationTiming = new NavigationTimingData({
      unload: navigation.unloadEventEnd - navigation.unloadEventStart,
      redirect: navigation.redirectEnd - navigation.redirectStart,
      domainLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcp: navigation.connectEnd - navigation.connectStart,
      ssl:
        (navigation.secureConnectionStart &&
          navigation.connectEnd - navigation.secureConnectionStart) ||
        0,
      request: navigation.responseStart - navigation.requestStart,
      response: navigation.responseEnd - navigation.responseStart,
      http: navigation.responseEnd - navigation.requestStart,
      domLoaded: navigation.domContentLoadedEventEnd - navigation.startTime,
      load: navigation.loadEventEnd - navigation.startTime,
      ttfb: navigation.responseStart - navigation.requestStart,
      domContentEvent: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      domloadEvent: navigation.loadEventEnd - navigation.loadEventStart,
      fp: 0,
      fcp: 0,
      fid: 0,
      fi: 0,
      lcp: 0,
      cls: 0,
    });
    /** 测试发现已不支持用PerformanceObserver监听得到first-paint，first-contentful-paint*/
    const paints = performance.getEntriesByType('paint') as PerformancePaintTiming[];
    var fp = paints.filter(p => p.name === 'first-paint')[0];
    var fcp = paints.filter(p => p.name === 'first-contentful-paint')[0];
    navigationTiming.fp = (fp && fp.startTime) || 0;
    navigationTiming.fcp = (fcp && fcp.startTime) || 0;

    new PerformanceObserver(entryList => {
      for (const _entry of entryList.getEntries()) {
        const entry = _entry as PerformanceEventTiming;
        const delay = entry.processingStart - entry.startTime;
        navigationTiming.fid = delay;
        navigationTiming.fi = entry.startTime;
      }
    }).observe({ type: 'first-input', buffered: true });

    new PerformanceObserver(entryList => {
      const list = entryList.getEntries();
      const item = list[list.length - 1];
      navigationTiming.lcp = item.startTime;
    }).observe({
      type: 'largest-contentful-paint',
      buffered: true,
    });

    /** cls 累计分数 */
    let metricValue = 0;
    /** 临时变量 */
    let sessionEntries: any[] = [];
    let sessionValue = 0;
    new PerformanceObserver(entryList => {
      for (const _entry of entryList.getEntries()) {
        const entry = _entry as any;
        if (!entry.hadRecentInput) {
          const firstSessionEntry = sessionEntries[0];
          const lastSessionEntry = sessionEntries[sessionEntries.length - 1];
          // 如果时间靠近上一个 session, 将本轮 layout-shift 累加进上一个 session
          if (
            sessionValue &&
            entry.startTime - lastSessionEntry.startTime < 1000 &&
            entry.startTime - firstSessionEntry.startTime < 5000
          ) {
            sessionValue += entry.value;
            sessionEntries.push(entry);
          } else {
            // 新起一个 session
            sessionValue = entry.value;
            sessionEntries = [entry];
          }
          // 如果当前 session 的 value 大于之前的最大值，替换为现在这个大的
          if (sessionValue > metricValue) {
            metricValue = sessionValue;
          }
        }
      }
    }).observe({
      type: 'layout-shift',
      buffered: true,
    });
    setTimeout(() => {
      navigationTiming.cls = metricValue;
      resolve(navigationTiming);
    });
  });
};

/**页面初始化，资源加载信息 */
export const getResourcesData = () => {
  let resource = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  /**过滤xhr、fetch和自身上报接口 */
  resource.filter(source => {
    if (
      ['xmlhttprequest', 'fetch'].includes(source.initiatorType) ||
      !source.name.startsWith(webReport.options.server)
    )
      return false;
    return true;
  });
  return resource.map(
    source =>
      new ResourceStabilityData({
        cacheType: getCacheType(source),
        name: source.name,
        initiatorType: source.initiatorType,
        transferSize: source.transferSize,
        duration: source.duration,
        encodedBodySize: source.encodedBodySize,
        decodedBodySize: source.decodedBodySize,
        startTime: source.startTime,
        nextHopProtocol: source.nextHopProtocol,
      })
  );
};

/**劫持fetch */
function hackFetch(resolveCb: Function, errorCb: Function) {
  const originFetch = window.fetch;
  window.fetch = function (...args) {
    return new Promise((resolve, reject) => {
      originFetch(...args).then(
        response => {
          resolveCb(response.clone());
          resolve(response);
        },
        error => {
          errorCb(error, ...args);
          reject(error);
        }
      );
    });
  };
  return function unHack() {
    window.fetch = originFetch;
  };
}
/**劫持XMLHttpRequest */
function hackXMLHttpRequest(resolveCb: (...args: any) => void, errorCb: (...args: any) => void) {
  const originOpen = XMLHttpRequest.prototype.open;
  const originSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (
    method,
    url,
    async: boolean = true,
    username?: string | null,
    password?: string | null
  ) {
    originOpen.call(this, method, url, async, username, password);
    (this as any)._report_url = url;
  };
  XMLHttpRequest.prototype.send = function (body?: Document | XMLHttpRequestBodyInit | null) {
    this.addEventListener('load', resolveCb);
    this.addEventListener('error', errorCb);
    originSend.call(this, body);
  };
  return function unHack() {
    XMLHttpRequest.prototype.send = originSend;
    XMLHttpRequest.prototype.open = originOpen;
  };
}
