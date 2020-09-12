import React, { useState } from 'react'
import { MemorySceneState, MemoryScene } from '@vlight/entities'
import { css } from 'linaria'

import { useCommonFixtureMapping } from '../../../../hooks/fixtures'
import { FixtureStateWidget } from '../../../../widgets/fixture/fixture-state-widget'
import { updateFixtureState } from '../../../../api/fixture'

const widget = css`
  border: none;
`

export interface MemorySceneStateEditorProps {
  scene: MemoryScene
  state: MemorySceneState
  onChange: (newValue: MemorySceneState) => void
}

export function MemorySceneStateEditor({
  scene,
  state,
  onChange,
}: MemorySceneStateEditorProps) {
  const [localState, setLocalState] = useState(state)
  const mapping = useCommonFixtureMapping(scene.members)

  if (Array.isArray(localState)) {
    // TODO support gradient
    return <div>(gradients not supported yet)</div>
  } else {
    return (
      <FixtureStateWidget
        title="Edit Memory Scene"
        fixtureState={localState}
        mapping={mapping}
        onChange={partialState => {
          const newState = updateFixtureState(localState, partialState)
          setLocalState(newState)
          onChange(newState)
        }}
        disableOn
        className={widget}
      />
    )
  }
}
