import { useState } from 'react'
import { css } from '@linaria/core'
import { DynamicPageCell } from '@vlight/types'

import { editorTitle } from '../../../../ui/css/editor-styles'
import { Label } from '../../../../ui/forms/label'
import { NumberInput } from '../../../../ui/forms/typed-input'
import { Icon } from '../../../../ui/icons/icon'
import { iconAdd } from '../../../../ui/icons'
import { WidgetInput, widgetTypes } from '../../../../ui/forms/widget-input'
import { baseline } from '../../../../ui/styles'
import { SortableList } from '../../../../ui/containers/sortable-list'

const addLink = css`
  display: inline-block;
  margin-top: ${baseline(2)};
`

export interface DynamicPageCellEditorProps {
  cell: DynamicPageCell
  onChange: (newValue: DynamicPageCell) => void
}

export function DynamicPageCellEditor({
  cell: initialCell,
  onChange,
}: DynamicPageCellEditorProps) {
  const [localCell, setLocalCell] = useState(initialCell)

  function setCellProperty<TKey extends keyof DynamicPageCell>(
    key: TKey,
    value: DynamicPageCell[TKey]
  ) {
    const newCell = { ...localCell, [key]: value }
    setLocalCell(newCell)
    onChange(newCell)
  }

  return (
    <>
      <h2 className={editorTitle}>Edit Dynamic Page Cell</h2>
      <Label
        label="Factor"
        input={
          <NumberInput
            value={localCell.factor}
            onChange={newValue => setCellProperty('factor', newValue)}
          />
        }
      />
      <h4>Widgets</h4>

      <SortableList
        entries={localCell.widgets}
        onChange={newWidgets => setCellProperty('widgets', newWidgets)}
        renderEntryContent={widget => (
          <WidgetInput
            value={widget}
            onChange={newWidget =>
              setCellProperty(
                'widgets',
                localCell.widgets.map(it => (it === widget ? newWidget : it))
              )
            }
            onDelete={() =>
              setCellProperty(
                'widgets',
                localCell.widgets.filter(it => it !== widget)
              )
            }
          />
        )}
      />

      <a
        onClick={() =>
          setCellProperty('widgets', [
            ...localCell.widgets,
            widgetTypes.universe.defaultValueFactory(),
          ])
        }
        className={addLink}
      >
        <Icon icon={iconAdd} inline /> Add widget
      </a>
    </>
  )
}
