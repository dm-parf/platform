<!--
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
-->
<script lang="ts">
  import { createEventDispatcher, onDestroy } from 'svelte'
  import { Ref } from '@hcengineering/core'
  import type {
    NotificationGroup,
    NotificationPreferencesGroup,
    NotificationSetting,
    NotificationType
  } from '@hcengineering/notification'
  import { getResource } from '@hcengineering/platform'
  import { createQuery, getClient } from '@hcengineering/presentation'
  import {
    Location,
    Scroller,
    getCurrentResolvedLocation,
    navigate,
    resolvedLocationStore,
    Header,
    Breadcrumb,
    defineSeparators,
    settingsSeparators,
    Separator,
    NavItem
  } from '@hcengineering/ui'
  import notification from '../plugin'
  import NotificationGroupSetting from './NotificationGroupSetting.svelte'

  export let visibleNav: boolean = true

  const dispatch = createEventDispatcher()

  const client = getClient()
  let groups: NotificationGroup[] = []
  let preferencesGroups: NotificationPreferencesGroup[] = []

  void client.findAll(notification.class.NotificationGroup, {}).then((res) => {
    groups = res
  })

  let settings = new Map<Ref<NotificationType>, NotificationSetting[]>()

  const query = createQuery()

  query.query(notification.class.NotificationSetting, {}, (res) => {
    settings = new Map()
    for (const value of res) {
      const arr = settings.get(value.type) ?? []
      arr.push(value)
      settings.set(value.type, arr)
    }
    settings = settings
  })

  let group: Ref<NotificationGroup> | undefined = undefined
  let currentPreferenceGroup: NotificationPreferencesGroup | undefined = undefined

  void client.findAll(notification.class.NotificationPreferencesGroup, {}).then((res) => {
    preferencesGroups = res
  })

  $: if (!group && !currentPreferenceGroup) {
    if (preferencesGroups.length > 0) {
      currentPreferenceGroup = preferencesGroups[0]
    } else if (groups.length > 0) {
      group = groups[0]._id
    }
  }

  onDestroy(
    resolvedLocationStore.subscribe((loc) => {
      void (async (loc: Location): Promise<void> => {
        group = loc.path[4] as Ref<NotificationGroup>
        currentPreferenceGroup = undefined
      })(loc)
    })
  )
  defineSeparators('notificationSettings', settingsSeparators)
</script>

<div class="hulyComponent">
  <Header minimize={!visibleNav} on:resize={(event) => dispatch('change', event.detail)}>
    <Breadcrumb
      icon={notification.icon.Notifications}
      label={notification.string.Notifications}
      size={'large'}
      isCurrent
    />
  </Header>
  <div class="hulyComponent-content__container columns">
    <div class="hulyComponent-content__column navigation py-2">
      <Scroller shrink>
        {#each preferencesGroups as preferenceGroup}
          <NavItem
            icon={preferenceGroup.icon}
            label={preferenceGroup.label}
            selected={preferenceGroup === currentPreferenceGroup}
            on:click={() => {
              currentPreferenceGroup = preferenceGroup
              group = undefined
              const loc = getCurrentResolvedLocation()
              loc.path.length = 4
              navigate(loc)
            }}
          />
        {/each}
        {#if preferencesGroups.length > 0 && groups.length > 0}
          <div class="antiNav-divider line" />
        {/if}
        {#each groups as gr}
          <NavItem
            icon={gr.icon}
            label={gr.label}
            selected={gr._id === group}
            on:click={() => {
              group = gr._id
              currentPreferenceGroup = undefined
              const loc = getCurrentResolvedLocation()
              loc.path[4] = group
              loc.path.length = 5
              navigate(loc)
            }}
          />
        {/each}
        <div class="antiNav-space" />
      </Scroller>
    </div>
    <Separator name={'notificationSettings'} index={0} color={'var(--theme-divider-color)'} />
    <div class="hulyComponent-content__column content">
      <Scroller align={'center'} padding={'var(--spacing-3)'} bottomPadding={'var(--spacing-3)'}>
        <div class="hulyComponent-content">
          {#if group}
            <NotificationGroupSetting {group} {settings} />
          {/if}
          {#if currentPreferenceGroup}
            {#await getResource(currentPreferenceGroup.presenter) then presenter}
              <svelte:component this={presenter} />
            {/await}
          {/if}
        </div>
      </Scroller>
    </div>
  </div>
</div>
