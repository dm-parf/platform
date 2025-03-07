//
// Copyright © 2020, 2021 Anticrm Platform Contributors.
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

import { Person } from '@hcengineering/contact'
import {
  Account,
  AttachedDoc,
  Attribute,
  Class,
  Collection,
  Doc,
  DocumentQuery,
  Mixin,
  Ref,
  Timestamp,
  Tx,
  TxCreateDoc,
  TxCUD,
  TxMixin,
  TxUpdateDoc
} from '@hcengineering/core'
import type { Asset, IntlString, Plugin, Resource } from '@hcengineering/platform'
import { plugin } from '@hcengineering/platform'
import { Preference } from '@hcengineering/preference'
import type { AnyComponent } from '@hcengineering/ui'

// TODO: remove TxViewlet
/**
 * Define an display for all transaction kinds for particular class.
 * @public
 */
export interface TxViewlet extends Doc {
  icon: Asset
  objectClass: Ref<Class<Doc>>
  txClass: Ref<Class<Tx>>
  // Component to display on.
  component?: AnyComponent

  // If defined, will be added to label displayed
  labelComponent?: AnyComponent

  // Filter
  match?: DocumentQuery<Tx>

  // Label will be displayed right after author
  label?: IntlString
  labelParams?: any
  // Do component need to be emphasized or not.
  display: 'inline' | 'content' | 'emphasized'

  // If defined and true, will show context menu with Edit action, and will pass 'edit:true' to viewlet properties.
  editable?: boolean

  // If defined and true, will hide all transactions from object in case it is deleted.
  hideOnRemove?: boolean
}

// TODO: remove DisplayTx
/**
 * Transaction being displayed.
 * @public
 */
export interface DisplayTx {
  // Source tx
  tx: TxCUD<Doc>

  // A set of collapsed transactions.
  txes: DisplayTx[]
  txDocIds?: Set<Ref<Doc>>

  // type check for createTx
  createTx?: TxCreateDoc<Doc>

  // Type check for updateTx
  updateTx?: TxUpdateDoc<Doc>

  // Type check for updateTx
  mixinTx?: TxMixin<Doc, Doc>

  // Document in case it is required.
  doc?: Doc
  // Previous document in case it is required.
  prevDoc?: Doc

  updated: boolean
  mixin: boolean
  removed: boolean
  isOwnTx: boolean

  collectionAttribute?: Attribute<Collection<AttachedDoc>>
  originTx: TxCUD<Doc>
}

/**
 * @public
 */
export interface ActivityMessage extends AttachedDoc {
  modifiedBy: Ref<Account>
  modifiedOn: Timestamp

  isPinned?: boolean

  repliedPersons?: Ref<Person>[]
  lastReply?: Timestamp

  replies?: number
  reactions?: number
}

export type DisplayActivityMessage = DisplayDocUpdateMessage | ActivityMessage

export interface DisplayDocUpdateMessage extends DocUpdateMessage {
  previousMessages?: DocUpdateMessage[]
  combinedMessagesIds?: Ref<DocUpdateMessage>[]
}

/**
 * Designed to control and filter some of changes from being to be propagated into activity.
 * @public
 */
export interface ActivityMessageControl extends Doc {
  objectClass: Ref<Class<Doc>>

  // A set of rules to be skipped from generate doc update activity messages
  skip: DocumentQuery<Tx>[]
}

/**
 *
 * General information activity message.
 * @public
 */
export interface ActivityInfoMessage extends ActivityMessage {
  title?: IntlString
  message: IntlString
  props?: Record<string, any>
  icon?: Asset
  iconProps?: Record<string, any>
}

export type ActivityMessageExtensionKind = 'action' | 'footer'

/**
 * @public
 */
export interface ActivityMessageExtension extends Doc {
  ofMessage: Ref<Class<ActivityMessage>>
  components: { kind: ActivityMessageExtensionKind, component: AnyComponent }[]
}

/**
 * @public
 */
export interface DocUpdateMessage extends ActivityMessage {
  objectId: Ref<Doc>
  objectClass: Ref<Class<Doc>>

  txId: Ref<TxCUD<Doc>>

  action: DocUpdateAction
  updateCollection?: string
  attributeUpdates?: DocAttributeUpdates
}

/**
 * @public
 */
export interface DocAttributeUpdates {
  attrKey: string
  attrClass: Ref<Class<Doc>>
  set: (string | number | null)[]
  prevValue?: any // Need for description diff
  added: (string | number | null)[]
  removed: (string | number | null)[]
  isMixin: boolean
}

export type DocUpdateAction = 'create' | 'update' | 'remove'

export type DocUpdateMessageViewletAttributesConfig = Record<
string,
{
  presenter?: AnyComponent
  icon?: Asset
  iconPresenter?: AnyComponent
}
>

/**
 * @public
 */
export interface ActivityMessageViewlet extends Doc {
  objectClass: Ref<Class<Doc>>
  onlyWithParent?: boolean
}

/**
 * @public
 */
export interface DocUpdateMessageViewlet extends ActivityMessageViewlet {
  action: DocUpdateAction
  valueAttr?: string

  label?: IntlString
  labelComponent?: AnyComponent

  icon?: Asset
  component?: AnyComponent

  config?: DocUpdateMessageViewletAttributesConfig

  hideIfRemoved?: boolean
}

/**
 * @public
 */
export const activityId = 'activity' as Plugin

/**
 * @public
 */
export interface ActivityMessagesFilter extends Doc {
  label: IntlString
  position: number
  filter: Resource<(message: ActivityMessage, _class?: Ref<Doc>) => boolean>
}

/**
 * @public
 */
export interface ActivityDoc extends Class<Doc> {
  preposition?: IntlString
}

/**
 * @public
 */
export interface ActivityAttributeUpdatesPresenter extends Class<Doc> {
  presenter: AnyComponent
}

/**
 * @public
 */
export type ActivityExtensionKind = 'input'

/**
 * @public
 */
export interface ActivityExtension extends Doc {
  ofClass: Ref<Class<Doc>>
  components: Record<ActivityExtensionKind, AnyComponent>
}

/**
 * @public
 */
export interface Reaction extends AttachedDoc {
  attachedTo: Ref<ActivityMessage>
  attachedToClass: Ref<Class<ActivityMessage>>
  emoji: string
  createBy: Ref<Account>
}

/**
 * @public
 */
export interface SavedMessage extends Preference {
  attachedTo: Ref<ActivityMessage>
}

/**
 * @public
 */
export interface IgnoreActivity extends Class<Doc> {}

export default plugin(activityId, {
  mixin: {
    ActivityDoc: '' as Ref<Mixin<ActivityDoc>>,
    ActivityAttributeUpdatesPresenter: '' as Ref<Mixin<ActivityAttributeUpdatesPresenter>>,
    IgnoreActivity: '' as Ref<Mixin<IgnoreActivity>>
  },
  class: {
    TxViewlet: '' as Ref<Class<TxViewlet>>,
    DocUpdateMessage: '' as Ref<Class<DocUpdateMessage>>,
    ActivityMessage: '' as Ref<Class<ActivityMessage>>,
    ActivityInfoMessage: '' as Ref<Class<ActivityInfoMessage>>,
    ActivityMessageControl: '' as Ref<Class<ActivityMessageControl>>,
    DocUpdateMessageViewlet: '' as Ref<Class<DocUpdateMessageViewlet>>,
    ActivityMessageExtension: '' as Ref<Class<ActivityMessageExtension>>,
    ActivityMessagesFilter: '' as Ref<Class<ActivityMessagesFilter>>,
    ActivityExtension: '' as Ref<Class<ActivityExtension>>,
    Reaction: '' as Ref<Class<Reaction>>,
    SavedMessage: '' as Ref<Class<SavedMessage>>
  },
  icon: {
    Activity: '' as Asset,
    Emoji: '' as Asset,
    Bookmark: '' as Asset
  },
  string: {
    Activity: '' as IntlString,
    Added: '' as IntlString,
    Changed: '' as IntlString,
    Edited: '' as IntlString,
    From: '' as IntlString,
    Removed: '' as IntlString,
    To: '' as IntlString,
    Unset: '' as IntlString,
    In: '' as IntlString,
    NewestFirst: '' as IntlString,
    Edit: '' as IntlString,
    Updated: '' as IntlString,
    Created: '' as IntlString,
    UpdatedCollection: '' as IntlString,
    New: '' as IntlString,
    Set: '' as IntlString,
    Update: '' as IntlString,
    For: '' as IntlString,
    AllActivity: '' as IntlString,
    Reactions: '' as IntlString,
    LastReply: '' as IntlString,
    RepliesCount: '' as IntlString
  },
  component: {
    Activity: '' as AnyComponent,
    ActivityMessagePresenter: '' as AnyComponent,
    DocUpdateMessagePresenter: '' as AnyComponent,
    ActivityInfoMessagePresenter: '' as AnyComponent,
    ReactionAddedMessage: '' as AnyComponent
  },
  ids: {
    AllFilter: '' as Ref<ActivityMessagesFilter>
  }
})
