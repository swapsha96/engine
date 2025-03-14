/** Copyright (c) 2023, Poozle, all rights reserved. **/

import { BasePath, Config, Params, convertToRequestBody } from '@poozle/engine-idk';
import axios, { AxiosHeaders } from 'axios';
import { BASE_URL } from 'common';

import { TeamResponse, TeamsResponse } from './team.interface';
import { convertTeam, teamMapping } from './team.utils';

export class TeamsPath extends BasePath {
  async getTeams(url: string, headers: AxiosHeaders, params: Params): Promise<TeamsResponse> {
    const page =
      typeof params.queryParams?.cursor === 'string' ? parseInt(params.queryParams?.cursor) : 1;

    const final_params = {
      per_page: params.queryParams?.limit,
      page,
    };

    const response = await axios({
      url,
      headers,
      params: final_params,
    });

    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: response.data.map((data: any) => convertTeam(data)),
      raw: response.data,
      meta: {
        previous: (page > 1 ? page - 1 : 1).toString(),
        current: page.toString(),
        next: (page + 1).toString(),
      },
    };
  }

  async createTeams(url: string, headers: AxiosHeaders, params: Params): Promise<TeamResponse> {
    const body = params.requestBody;
    const createBody = convertToRequestBody(body, teamMapping);

    const response = await axios.post(url, createBody, { headers });

    return { data: convertTeam(response.data), raw: response.data };
  }

  async run(method: string, headers: AxiosHeaders, params: Params, config: Config) {
    const url = `${BASE_URL}/orgs/${config.org}/teams`;
    switch (method) {
      case 'GET':
        return this.getTeams(url, headers, params);

      case 'POST':
        return this.createTeams(url, headers, params);

      default:
        throw new Error('Method not found');
    }
  }
}
