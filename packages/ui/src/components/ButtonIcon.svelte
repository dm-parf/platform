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
  import type { Asset } from '@hcengineering/platform'
  import { AnySvelteComponent } from '../types'
  import { ComponentType } from 'svelte'
  import ButtonBase from './ButtonBase.svelte'

  export let kind: 'primary' | 'secondary' | 'tertiary' | 'negative' = 'secondary'
  export let size: 'large' | 'medium' | 'small' = 'large'
  export let icon: Asset | AnySvelteComponent | ComponentType
  export let disabled: boolean = false
  export let loading: boolean = false
  export let inheritColor: boolean = false
</script>

<ButtonBase type={'type-button-icon'} {kind} {size} {icon} {disabled} {loading} {inheritColor} on:click />
