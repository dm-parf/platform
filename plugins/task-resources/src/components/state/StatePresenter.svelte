<!--
// Copyright © 2020, 2021 Anticrm Platform Contributors.
// Copyright © 2021 Hardcore Engineering Inc.
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
  import core, { IdMap, Ref, Status, StatusCategory } from '@hcengineering/core'
  import { getClient } from '@hcengineering/presentation'
  import task, { Project, ProjectType, TaskType } from '@hcengineering/task'
  import {
    ColorDefinition,
    Icon,
    IconSize,
    IconWithEmoji,
    getColorNumberByText,
    getPlatformColorDef,
    themeStore
  } from '@hcengineering/ui'
  import view from '@hcengineering/view'
  import { statusStore } from '@hcengineering/view-resources'
  import { createEventDispatcher, onMount } from 'svelte'
  import { typeStore } from '../..'
  import IconBacklog from '../icons/IconBacklog.svelte'
  import IconUnstarted from '../icons/IconUnstarted.svelte'
  import IconCanceled from '../icons/IconCanceled.svelte'
  import IconCompleted from '../icons/IconCompleted.svelte'
  import IconStarted from '../icons/IconStarted.svelte'

  export let value: Status | undefined
  export let shouldShowAvatar = true
  export let inline: boolean = false
  export let disabled: boolean = false
  export let oneLine: boolean = false
  export let shouldShowName: boolean = true
  export let shouldShowTooltip: boolean = false
  export let noUnderline: boolean = false
  export let accent: boolean = false
  export let shrink: number = 0
  export let space: Ref<Project> | undefined = undefined
  export let projectType: Ref<ProjectType> | undefined = undefined
  export let taskType: Ref<TaskType> | undefined = undefined
  export let size: IconSize = 'small'

  const dispatch = createEventDispatcher()

  let type: ProjectType | undefined = undefined
  let category: StatusCategory | undefined

  $: void getType(space, projectType, $typeStore)

  const client = getClient()

  async function getType (
    space: Ref<Project> | undefined,
    projectType: Ref<ProjectType> | undefined,
    types: IdMap<ProjectType>
  ): Promise<ProjectType | undefined> {
    if (projectType !== undefined) {
      type = types.get(projectType)
      return
    }
    const _space = await client.findOne(task.class.Project, { _id: space })
    if (_space === undefined) {
      type = undefined
      return
    }
    type = types.get(_space.type)
  }

  $: projectState = type?.statuses.find((p) => p._id === value?._id)

  const dispatchAccentColor = (color?: ColorDefinition): void => {
    dispatch('accent-color', color)
  }

  $: color = getPlatformColorDef(
    projectState?.color ?? category?.color ?? getColorNumberByText(value?.name ?? ''),
    $themeStore.dark
  )
  $: dispatchAccentColor(color)

  onMount(() => {
    dispatchAccentColor(color)
  })

  $: void updateCategory(value)

  async function updateCategory (value: Status | undefined): Promise<void> {
    if (value === undefined) {
      category = undefined
      return
    }
    category = await client.findOne(core.class.StatusCategory, { _id: value.category })
  }

  const categoryIcons = {
    [task.statusCategory.UnStarted]: IconBacklog,
    [task.statusCategory.ToDo]: IconUnstarted,
    [task.statusCategory.Active]: IconStarted,
    [task.statusCategory.Won]: IconCompleted,
    [task.statusCategory.Lost]: IconCanceled
  }

  $: sameCategory = (type?.statuses ?? []).filter(
    (it) =>
      $statusStore.byId.get(it._id)?.category === value?.category &&
      (taskType === undefined || it.taskType === taskType)
  )

  $: index = sameCategory.findIndex((it) => it._id === value?._id) + 1

  $: icon = projectState?.icon === view.ids.IconWithEmoji ? IconWithEmoji : projectState?.icon
</script>

{#if value}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    id="{value.category}:{value.name}"
    class="flex-presenter"
    class:inline-presenter={inline}
    class:flex-no-shrink={!shouldShowName || shrink === 0}
    class:fs-bold={accent}
    on:click
  >
    {#if shouldShowAvatar}
      <div
        class="state-container"
        class:inline
        class:mr-2={shouldShowName}
        title={shouldShowTooltip ? value.name : undefined}
      >
        {#if icon != null}
          <Icon {icon} {size} iconProps={{ icon: projectState?.color ?? category?.color }} />
        {:else if category?._id === task.statusCategory.Active}
          <Icon
            icon={categoryIcons[category._id]}
            {size}
            iconProps={{ index, count: sameCategory.length + 1, fill: projectState?.color ?? category?.color }}
          />
        {:else}
          <Icon
            icon={categoryIcons[category?._id ?? task.statusCategory.UnStarted]}
            {size}
            iconProps={{ fill: projectState?.color ?? category?.color }}
          />
        {/if}
      </div>
    {/if}
    {#if shouldShowName}
      <span class="overflow-label label" class:nowrap={oneLine} class:no-underline={noUnderline || disabled}>
        {value.name}
      </span>
    {/if}
  </div>
{/if}

<style lang="scss">
  .state-container {
    flex-shrink: 0;

    &.inline {
      transform: translateY(0.125rem);
    }
  }
</style>
