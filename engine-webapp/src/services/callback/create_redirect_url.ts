/** Copyright (c) 2023, Poozle, all rights reserved. **/

import { useMutation } from 'react-query';
import { ajaxPost } from 'utils';

export interface CreateRedirectURLParams {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any;
  workspaceId?: string;

  linkId?: string;
  accountIdentifier: string;

  integrationAccountName: string;
  redirectURL: string;

  integrationOAuthAppId: string;
}

export interface RedirectURLResponse {
  status: number;
  redirectURL: string;
}

export function createRedirectURL(params: CreateRedirectURLParams) {
  return ajaxPost({
    url: '/api/v1/oauth',
    data: params,
  });
}

export interface MutationParams {
  onMutate?: () => void;
  onSuccess?: (data: RedirectURLResponse) => void;
  onError?: (error: string) => void;
}

export function useCreateRedirectURLMutation({
  onMutate,
  onSuccess,
  onError,
}: MutationParams) {
  const onMutationTriggered = () => {
    onMutate && onMutate();
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onMutationError = (errorResponse: any) => {
    const errorText = errorResponse?.errors?.message || 'Error occured';

    onError && onError(errorText);
  };

  const onMutationSuccess = (data: RedirectURLResponse) => {
    onSuccess && onSuccess(data);
  };

  return useMutation(createRedirectURL, {
    onError: onMutationError,
    onMutate: onMutationTriggered,
    onSuccess: onMutationSuccess,
  });
}
