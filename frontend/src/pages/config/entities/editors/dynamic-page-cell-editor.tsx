import { useCallback, useState } from 'react'
import { DynamicPageCell, WidgetConfig } from '@vlight/types'

import { editorTitle } from '../../../../ui/css/editor-styles'
import { Label } from '../../../../ui/forms/label'
import { NumberInput } from '../../../../ui/forms/typed-input'
import { iconAdd } from '../../../../ui/icons'
import { WidgetInput, widgetTypes } from '../../../../ui/forms/widget-input'
import { SortableList } from '../../../../ui/containers/sortable-list'
import { Button } from '../../../../ui/buttons/button'
import { useEvent } from '../../../../hooks/performance'

export interface DynamicPageCellEditorProps {
  cell: DynamicPageCell
  onChange: (newValue: DynamicPageCell) => void
}

/**
 * Dialog content to edit the cell of a dynamic page row.
 */
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

  const replaceWidget = useEvent(
    (widget: WidgetConfig, changes: WidgetConfig) => {
      setCellProperty(
        'widgets',
        localCell.widgets.map(it => (it === widget ? changes : it))
      )
    }
  )

  const removeWidget = useEvent((widget: WidgetConfig) => {
    setCellProperty(
      'widgets',
      localCell.widgets.filter(it => it !== widget)
    )
  })

  const changeFactor = useEvent((factor: number | undefined) =>
    setCellProperty('factor', factor)
  )
  const changeWidgets = useEvent((widgets: WidgetConfig[]) =>
    setCellProperty('widgets', widgets)
  )

  const renderEntryContent = useCallback(
    (widget: WidgetConfig) => (
      <WidgetInput
        value={widget}
        onChange={newWidget => replaceWidget(widget, newWidget)}
        onDelete={() => removeWidget(widget)}
      />
    ),
    [replaceWidget, removeWidget]
  )

  const addWidget = useEvent(() =>
    setCellProperty('widgets', [
      ...localCell.widgets,
      widgetTypes.map.defaultValueFactory(),
    ])
  )

  return (
    <>
      <h2 className={editorTitle}>Dynamic Page Cell</h2>
      <Label
        label="Factor"
        input={<NumberInput value={localCell.factor} onChange={changeFactor} />}
      />

      <h4>Widgets</h4>

      <SortableList
        entries={localCell.widgets}
        onChange={changeWidgets}
        renderEntryContent={renderEntryContent}
      />

      <Button icon={iconAdd} block onClick={addWidget} />
    </>
  )
}
