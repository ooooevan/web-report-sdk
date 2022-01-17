/**cookies key */
export enum COOKIE_KEY_ENUM {
  anonymousId = '_report_sdk_anonymous_id',
  distinctId = '_report_sdk_distinct_id',
}

/**cookies key */
export const COOKIE_KEY = {
  anonymousId: COOKIE_KEY_ENUM.anonymousId,
  distinctId: COOKIE_KEY_ENUM.distinctId,
};

/** ---数据分类-- */
export enum DataType {
  /** 错误 */
  error = 'error',
  /** 页面性能 */
  stability = 'stability',
  /** 埋点*/
  statistics = 'statistics',
  /** 自定义事件 */
  track = 'track',
}
/**错误-二级分类 */
export enum ErrorType {
  /**js异常 */
  normal = 'normal',
  /** promise异常 */
  promiseError = 'promiseError',
  /** promise reject异常 */
  promiseReject = 'promiseReject',
  /** console.error */
  console = 'console',
  /** 资源加载一次 */
  resource = 'resource',
}
/** 页面性能 -二级分类 */
export enum StabilityType {
  /**导航数据性能 */
  navigationTiming = 'navigationTiming',
  // /**页面渲染性能 */
  // paint = 'paint',
  /**资源性能 */
  resource = 'resource',
  /**异步请求性能 */
  request = 'request',
}
/** 埋点相关-二级分类*/
export enum StatisticsType {
  /** 用户点击 */
  click = 'click',
  /** 访问性数据，如pv，uv */
  pageView = 'pageView',
}
/**自定义事件 -二级分类 */
export enum TrackType {
  track = 'track',
}
/** --数据分类--- */

export const ResourceType = {
  memory: 'memory',
  disk: 'disk',
  304: '304',
  200: '200',
  /**失败资源 */
  '': '',
};
