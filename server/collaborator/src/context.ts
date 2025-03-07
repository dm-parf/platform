//
// Copyright © 2023 Hardcore Engineering Inc.
//
// Licensed under the Eclipse Public License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License. You may
// obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//
// See the License for the specific language governing permissions and
// limitations under the License.
//

import { generateId } from '@hcengineering/core'
import { Token, decodeToken } from '@hcengineering/server-token'
import { onAuthenticatePayload } from '@hocuspocus/server'

export interface Context {
  connectionId: string
  token: string
  decodedToken: Token
  initialContentId: string
  targetContentId: string
}

export type withContext<T> = Omit<T, 'context'> & {
  context: Context
}

export function buildContext (data: onAuthenticatePayload): Context {
  const connectionId = generateId()
  const decodedToken = decodeToken(data.token)
  const initialContentId = data.requestParameters.get('initialContentId') as string
  const targetContentId = data.requestParameters.get('targetContentId') as string

  const context: Context = {
    connectionId,
    decodedToken,
    token: data.token,
    initialContentId: initialContentId ?? '',
    targetContentId: targetContentId ?? ''
  }

  return context
}
