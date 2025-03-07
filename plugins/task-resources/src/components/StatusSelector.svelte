<script lang="ts">
  import { Class, IdMap, Ref, Status, generateId } from '@hcengineering/core'
  import { IntlString } from '@hcengineering/platform'
  import { DocPopup, getClient } from '@hcengineering/presentation'
  import { Task, TaskType } from '@hcengineering/task'
  import { ObjectPresenter, statusStore } from '@hcengineering/view-resources'
  import { createEventDispatcher } from 'svelte'
  import { taskTypeStore } from '..'

  export let value: Task | Task[]
  export let width: 'medium' | 'large' | 'full' = 'medium'
  export let placeholder: IntlString
  export let _class: Ref<Class<Status>>
  export let embedded: boolean = false

  const dispatch = createEventDispatcher()
  const client = getClient()
  let progress = false
  const changeStatus = async (newStatus: any) => {
    if (newStatus === undefined) {
      dispatch('close', undefined)
      return
    }
    progress = true
    const docs = Array.isArray(value) ? value : [value]

    const ops = client.apply('set-status' + generateId())
    const changed = (d: Task) => d.status !== newStatus
    for (const it of docs.filter(changed)) {
      await ops.update(it, { status: newStatus })
    }
    await ops.commit()
    progress = false

    dispatch('close', newStatus)
  }

  $: current = Array.isArray(value)
    ? value.every((v) => v.status === (value as Array<Task>)[0].status)
      ? value[0].status
      : undefined
    : value.status

  $: kind = Array.isArray(value)
    ? value.every((v) => v.kind === (value as Array<Task>)[0].kind)
      ? value[0].kind
      : undefined
    : value.kind

  function updateStatuses (taskTypes: IdMap<TaskType>, store: IdMap<Status>, kind: Ref<TaskType> | undefined): void {
    if (kind === undefined) {
      statuses = []
    } else {
      if (kind !== undefined) {
        const type = taskTypes.get(kind)
        if (type !== undefined) {
          statuses = type.statuses.map((p) => store.get(p)).filter((p) => p !== undefined) as Status[]
        }
      }
    }
  }

  $: updateStatuses($taskTypeStore, $statusStore.byId, kind)

  let statuses: Status[] = []
</script>

<DocPopup
  {_class}
  objects={statuses}
  allowDeselect={true}
  selected={current}
  on:close={(evt) => {
    changeStatus(evt.detail === null ? null : evt.detail?._id)
  }}
  {placeholder}
  {width}
  {embedded}
  loading={progress}
  on:changeContent
>
  <svelte:fragment slot="item" let:item>
    <div class="flex-row-center flex-grow overflow-label">
      <ObjectPresenter
        objectId={item._id}
        _class={item._class}
        value={item}
        inline={false}
        noUnderline
        props={{ disabled: true, inline: false, size: 'small', avatarSize: 'smaller' }}
      />
    </div>
  </svelte:fragment>
</DocPopup>
