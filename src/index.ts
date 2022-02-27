import { COOKIE_KEY, COOKIE_KEY_ENUM } from './config';
import { getCookies, setCookies, splitArray } from './utils';
import { v4 as uuid } from 'uuid';
import { start as startListenError } from './error-listener';
import { encode } from 'js-base64';
import {
  getNavigationTiming,
  getResourcesData,
  start as startListenStability,
} from './stability-listener';
import { start as startListenStatistics } from './statistics-listener';
import { Data, TrackData } from './data';
import { Options } from './interface';

class Webreport {
  options!: Options;
  cookies?: { [k in COOKIE_KEY_ENUM]?: string };
  init(options: Options) {
    this.options = this.getCheckedOptions(options);
    this.cookies = this.getInitUserData();
    startListenError();
    startListenStatistics();
    window.addEventListener('load', async () => {
      startListenStability();
      const navigationTiming = await getNavigationTiming();
      const resources = getResourcesData();
      this.send(navigationTiming);
      this.send(resources);
    });
  }
  /**检查配置 */
  getCheckedOptions(options: Options) {
    if (!options.server.endsWith('/')) {
      options.server = options.server + '/';
    }
    return options;
  }
  /**初始并获取化用户cookie */
  getInitUserData() {
    const userCookies = getCookies();
    if (!userCookies[COOKIE_KEY.anonymousId]) {
      setCookies({
        [COOKIE_KEY.anonymousId]: uuid(),
        [COOKIE_KEY.distinctId]: userCookies[COOKIE_KEY.distinctId] || '',
      });
      return getCookies();
    } else {
      return userCookies;
    }
  }
  _send(data: Data | Data[]) {
    const img = document.createElement('img');
    img.src = this.options.server + 'xx?data=' + encode(JSON.stringify(data));
  }
  /**上报数据 */
  send(data: Data | Data[]) {
    if (data instanceof Array) {
      const str = JSON.stringify(data);
      if (str.length < 4096) {
        this._send(data);
      } else {
        const piece = Math.ceil(str.length / 4096);
        const arr = splitArray(data, piece);
        arr.forEach(this._send);
      }
    } else {
      this._send(data);
    }
  }
  /**自定义上报 */
  track(name: string, data: any) {
    this.send(new TrackData({ name, data }));
  }
  /** 登录 */
  login(distinctId: string) {
    setCookies({
      [COOKIE_KEY.distinctId]: distinctId,
    });
  }
}

export * from './config';
export * from './data';
export default new Webreport();
