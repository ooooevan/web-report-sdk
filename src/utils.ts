import Cookies from 'js-cookie';
import { COOKIE_KEY, COOKIE_KEY_ENUM, ResourceType } from './config';

/** 获取元素路径 */
export const getElementPath = (ePath: HTMLElement[]) => {
  const paths: string[] = [];
  if (!ePath) return paths;
  for (let i = 0; i < ePath.length; i++) {
    const p = ePath[i];
    if (!p.tagName) break;
    var tag = p.tagName.toLowerCase();
    if (p.id) {
      paths.unshift(`${tag}#${p.id}`);
    } else if (p.classList.length) {
      var cls = [].reduce.call(p.classList, (cls, c) => `${cls}.${c}`, '');
      paths.unshift(`${tag}${cls}`);
    } else {
      paths.unshift(`${tag}`);
    }
  }
  return paths;
};

/**获取元素属性 */
export const getElementProp = (element?: HTMLElement) => {
  if (!element) return '';
  const names = element.getAttributeNames();
  let result = element.tagName.toLowerCase();
  if ('html' !== result) result += `[innerText=${element.innerText.substring(0, 20)}]`;
  names.forEach(name => {
    result += `[${name}=${element.getAttribute(`${name}`)}]`;
  });
  return result;
};

/**获取event.path */
export const getEventPath = (e: any) => {
  return e.path || (typeof e.composedPath === 'function' && e.composedPath()) || [];
};

/** 获取自身cookies */
export const getCookies = () => {
  const result: { [k in COOKIE_KEY_ENUM]?: string } = {};
  const cookies = Cookies.get();
  Object.keys(cookies)
    .filter(k => Object.values(COOKIE_KEY).includes(k as COOKIE_KEY_ENUM))
    .forEach(k => {
      result[k as COOKIE_KEY_ENUM] = cookies[k];
    });
  return result;
};

/** 生成cookies */
export const setCookies = (data: { [k: string]: string }) => {
  for (const k in data) {
    Cookies.set(k, data[k], {
      // sameSite: 'None',
      // secure: true,
      expires: new Date(Date.now() + 360 * 24 * 60 * 60 * 1000),
    });
  }
};

/** 格式化stack字符串*/
export const formatStack = (stack: string = '') => {
  const result = {
    filename: '',
    message: '',
    lineno: 0,
    colno: 0,
    stack: '',
  };
  const arr = stack.split(/\n\s+/);
  result.message = (arr.shift() || '').replace(/^Error: /, '');
  const m = arr[0].match(/at\s+(.+):(\d+):(\d+)/);
  if (m) {
    result.filename = m[1];
    result.lineno = +m[2];
    result.colno = +m[3];
  } else {
    // 只有行信息
    const m = arr[0].match(/.+:(\d+)/);
    if (m) {
      result.filename = m[1];
      result.lineno = +m[2];
    }
  }
  result.stack = arr.join('\n');
  return result;
};

/** 获取最后一次交互event*/
export const getLastEvent = (function () {
  let event: any = {};
  ['click', 'keydown', 'mouseover'].forEach(name => {
    window.addEventListener(name, e => {
      event = e;
    });
  });
  return () => event;
})();

/** 资源缓存类型*/
export const getCacheType = (source: PerformanceResourceTiming) => {
  /**
   * transferSize表示请求数据包大小，包括头信息。为0说明是强制缓存disk cache，也可能是无响应（失败）资源
   * encodedBodySize为0表示body为0，则是304（或者body是空，为空资源不考虑）
   * 考虑memory cache，请求完不久再次请求，从内存读取，此时时间duration是0
   */
  /** memory cache */
  if (source.duration === 0) return ResourceType.memory;
  /** disk cache */
  if (source.transferSize === 0) return ResourceType.disk;
  /** 304 */
  if (source.encodedBodySize === 0) return ResourceType[304];
  /** 200 */
  return ResourceType[200];
};

/**将数组分为若干份 */
export function splitArray<T>(arr: T[], blocks: number): T[][] {
  const len = Math.ceil(arr.length / blocks);
  const result = [];
  while (arr.length) {
    result.push(arr.splice(0, len));
  }
  return result;
}

/**
 * 直接请求域名，url会自动添加'/',手动获取也要添加url
 */
export const formatXhrOrFetchResourceUrl = (_url: string) => {
  const url = _url.replace(/^\/\//, '').replace(/^https?:\/\//, '');
  if (
    url.match(/^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/)
  ) {
    return _url + '/';
  }
  return _url;
};
