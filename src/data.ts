import webReport from '.';
import {
  COOKIE_KEY,
  DataType,
  ErrorType,
  StabilityType,
  StatisticsType,
  TrackType,
} from './config';

/**基础类型数据 */
export interface Data {
  /** 匿名id */
  anonymousId?: string;
  /** 登录id */
  distinctId?: string;
  /** 类型 */
  type?: DataType;
  /** 二级类型*/
  subType?: ErrorType | StabilityType | StatisticsType | TrackType;
  /** performance.now */
  performanceStamp?: number;
  /** date.now */
  timeStamp?: number;
  /**页面地址 */
  url?: string;
  /**页面title */
  title?: string;

  /**元素路径 */
  path?: string;
  /**最后一个交互元素路径 */
  lastPath?: string;
  /**最后一个交互元素属性 */
  lastElement?: string;
}

/**错误数据 */
export interface ErrorData extends Data {
  /**错误信息栈 */
  stack?: string;
  /**错误message */
  message?: string;
  /**文件 */
  filename?: string;
  /**行 */
  lineno?: number;
  /** 列*/
  colno?: number;
}

/**性能数据 */
export interface StabilityData extends Data {}

/** 页面导航性能数据 */
export interface NavigationTimingData extends StabilityData {
  /** unload 卸载时间 */
  unload: number;
  /** redirect */
  redirect: number;
  /** dns */
  domainLookup: number;
  /** tcp连接 */
  tcp: number;
  /** ssl连接 */
  ssl: number;
  /** request */
  request: number;
  /** response */
  response: number;
  /** http */
  http: number;
  /** domContentLoaded 执行完 */
  domLoaded: number;
  /** load 执行完 */
  load: number;
  /** 首字节时间 */
  ttfb: number;
  /** domContentLoadedEvent 执行时间  */
  domContentEvent: number;
  /** domloadEvent load执行时间  */
  domloadEvent: number;
  /** first paint 白屏*/
  fp: number;
  /** first contentful paint */
  fcp: number;
  /** first input delay（用户响应延时） */
  fid: number;
  /** first input */
  fi: number;
  /** largest contentful paint 当前最大内容绘制，首屏*/
  lcp: number;
  /** 累积偏移分数 */
  cls: number;
}

/** 静态资源 性能数据 */
export interface ResourceStabilityData extends StabilityData {
  /**缓存情况 */
  cacheType: string;
  /**请求地址 */
  name: string;
  /** 请求标签 */
  initiatorType: string;
  /**耗时 */
  duration: number;
  /**encode body大小 */
  encodedBodySize: number;
  /**dncode body大小 */
  decodedBodySize: number;
  /**请求开始时间，从页面初始化开始 */
  startTime: number;
  /**协议 */
  nextHopProtocol: string;
  /**传输的大小 */
  transferSize: number;
}

/**异步资源数据（fetch、xhr），包含请求完成(有status)、请求失败(请求error) */
export interface RequestResourceStabilityData extends ResourceStabilityData {
  /**响应状态码，0表示失败 */
  status?: number;
  /**如果报错，message */
  message?: string;
  /**资源地址 */
  url?: string;
  /**response字段 */
  bodyUsed?: boolean;
}

/**用户交互数据 */
export interface StatisticsData extends Data {}

/** 埋点数据，用户点击，访问 */
export interface ClickStatisticsData extends StatisticsData {
  /**坐标x */
  pageX: number;
  /**坐标y */
  pageY: number;
  /**可视height */
  innerHeight: number;
  /**可视width */
  innerWidth: number;
  /**文档height */
  clientHeight: number;
  /**文档width */
  clientWidth: number;
}

/**页面访问性数据 */
export interface PageViewStatisticsData extends StatisticsData {
  /**显示器Height */
  screenHeight: number;
  /**显示器Width */
  screenWidth: number;
  /**可视height */
  innerHeight: number;
  /**可视width */
  innerWidth: number;
  /**文档height */
  clientHeight: number;
  /**文档width */
  clientWidth: number;
  /**页面来源 */
  referrer: string;
  /**浏览器ua */
  userAgent: string;
  /** 路由跳转，来源url */
  from?: string;
  /**跳转方式 */
  historyType?: 'pushState' | 'replaceState' | 'hashChange';
}

/**自定义track */
export interface TrackData extends Data {
  name: string;
  data: any;
}

export class Data {
  constructor(_data: Partial<Data> = {}) {
    const cookies = webReport.cookies || {};
    const data = {
      anonymousId: cookies[COOKIE_KEY.anonymousId] || '',
      distinctId: cookies[COOKIE_KEY.distinctId] || '',
      performanceStamp: performance.now(),
      timeStamp: Date.now(),
      url: location.href,
      title: document.title,
      ..._data,
    };
    (Object.keys(data) as (keyof Data)[]).forEach(k => {
      this[k] = data[k] as any;
    });
  }
}

export class ErrorData extends Data {
  constructor(_data: ErrorData = {}) {
    const data = { ..._data, type: DataType.error };
    super(data);
  }
}
export class StabilityData extends Data {}

/** 页面导航性能*/
export class NavigationTimingData extends StabilityData {
  constructor(_data: NavigationTimingData) {
    const data = { ..._data, type: DataType.stability, subType: StabilityType.navigationTiming };
    super(data);
  }
}

/**静态资源 */
export class ResourceStabilityData extends StabilityData {
  constructor(_data: ResourceStabilityData) {
    const data = { ..._data, type: DataType.stability, subType: StabilityType.resource };
    super(data);
  }
}

/**异步静态资源 */
export class RequestResourceStabilityData extends ResourceStabilityData {
  constructor(_data: RequestResourceStabilityData) {
    const data = { ..._data, type: DataType.stability, subType: StabilityType.request };
    super(data);
  }
}

export class StatisticsData extends Data {}
export class ClickStatisticsData extends StatisticsData {
  constructor(_data: ClickStatisticsData) {
    const data = { ..._data, type: DataType.statistics, subType: StatisticsType.click };
    super(data);
  }
}
export class PageViewStatisticsData extends StatisticsData {
  constructor(_data: PageViewStatisticsData) {
    const data = { ..._data, type: DataType.statistics, subType: StatisticsType.pageView };
    super(data);
  }
}

/**自定义上报数据 */
export class TrackData extends Data {
  constructor(_data: TrackData) {
    const data = { ..._data, type: DataType.track, subType: TrackType.track };
    super(data);
  }
}
