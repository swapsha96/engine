/** Copyright (c) 2023, Poozle, all rights reserved. **/

import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { LinkService } from 'modules/link/link.service';

import { BodyInterface, CallbackParams } from './oauth_callback.interface';
import { OAuthCallbackService } from './oauth_callback.service';

@Controller({
  version: '1',
  path: 'oauth',
})
@ApiTags('OAuth Utils')
export class OAuthCallbackController {
  constructor(
    private oAuthCallbackService: OAuthCallbackService,
    private linkService: LinkService,
  ) {}

  @Post()
  async getRedirectURL(@Body() body: BodyInterface) {
    if (!body.workspaceId && !body.linkId) {
      throw new BadRequestException('Pass either linkId or workspaceId');
    }

    let workspaceId = body.workspaceId;

    if (!workspaceId && body.linkId) {
      const link = await this.linkService.getLink({
        linkId: body.linkId,
      });

      workspaceId = link.workspaceId;
    }

    return await this.oAuthCallbackService.getRedirectURL(
      body.integrationAccountName,
      workspaceId,
      body.integrationOAuthAppId,
      body.config ?? {},
      body.redirectURL,
      body.linkId,
      body.accountIdentifier,
    );
  }

  @Get('callback')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async callback(@Query() queryParams: CallbackParams, @Res() res: any) {
    return await this.oAuthCallbackService.callbackHandler(queryParams, res);
  }
}
