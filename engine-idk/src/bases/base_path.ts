/** Copyright (c) 2023, Poozle, all rights reserved. **/
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { AxiosHeaders } from 'axios';

import { Config, Params } from 'types/integration';
import { Meta } from 'types/path';

export class BasePath {
  pathRegex: RegExp;
  method: string | string[];

  constructor(pathRegex: RegExp, method: string | string[]) {
    this.pathRegex = pathRegex;
    this.method =
      typeof method === 'string' ? method.toLowerCase() : method.map((m) => m.toLowerCase());
  }

  isMatchingMethod(method: string): boolean {
    if (typeof this.method === 'string') {
      return this.method === method.toLowerCase();
    }

    return this.method.includes(method.toLowerCase());
  }

  isPath(path: string, method: string): boolean {
    return this.pathRegex.test(path) && this.isMatchingMethod(method);
  }

  async baseRun(method: string, headers: AxiosHeaders, params: Params, config: Config) {
    const responseFromRun: any = await this.run(method, headers, params, config);

    // if this is a request directly to the integration
    if (params.proxy) {
      return responseFromRun;
    }

    try {
      const response: any = {
        data: responseFromRun.data,
      };

      if (responseFromRun.meta && Array.isArray(responseFromRun.data)) {
        const meta = await this.getMetaParams(responseFromRun, params);

        response['meta'] = meta;
      }

      if (
        (params.queryParams?.raw === true || params.queryParams?.raw === 'true' ? true : false) &&
        responseFromRun.raw
      ) {
        response['raw'] = responseFromRun.raw;
      }

      return response;
    } catch (e) {
      return {
        data: {},
        error: e,
      };
    }
  }

  // Written by the integration
  async getMetaParams(response: any, params: Params): Promise<Meta> {
    let current = typeof params.queryParams?.cursor === 'string' ? params.queryParams?.cursor : '';

    if (response.data && response.data.current) {
      current = response.data.current;
    }

    const next = response.meta ? response.meta.next : '';
    const previous = response.meta ? response.meta.previous ?? '' : '';

    return {
      limit: params.queryParams?.limit ? parseInt(params.queryParams?.limit.toString()) : 10,
      cursors: {
        previous,
        current,
        next,
      },
    };
  }

  // Written by the integration
  async run(_method: string, _headers: AxiosHeaders, _params: Params, _config: Config) {
    return {};
  }
}
