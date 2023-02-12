import { useParams } from 'react-router'
import { Fragment, useState } from 'react'
import { DynamicPage as DynamicPageEntity, WidgetConfig } from '@vlight/types'

import { useMasterData, useRawMasterData } from '../../hooks/api'
import { memoInProduction } from '../../util/development'
import { Grid } from '../../ui/containers/grid'
import { DynamicWidget } from '../../widgets/dynamic-widget'
import { Header } from '../../ui/containers/header'
import { iconClose, iconConfig, iconOk } from '../../ui/icons'
import { DynamicPageEditor } from '../config/entities/editors/dynamic-page-editor'
import { editEntity } from '../../api'
import { Button } from '../../ui/buttons/button'
import { centeredText } from '../../ui/css/basic-styles'
import { getHotkeyLabel, useNumberHotkey } from '../../hooks/hotkey'
import { useEvent } from '../../hooks/performance'

const widgetTypesWithoutHotkeys: Array<WidgetConfig['type']> = [
  'universe',
  'channels',
  'map',
]

/**
 * Displays a user-configured dynamic page with an ID given as route param.
 */
const DynamicPage = memoInProduction(() => {
  const { id } = useParams<{ id: string }>()
  const masterData = useMasterData()
  const rawMasterData = useRawMasterData()
  const [editing, setEditing] = useState(false)
  const [editedPage, setEditedPage] = useState<DynamicPageEntity | null>(null)

  const page = masterData.dynamicPages.find(p => p.id === id)
  const rawPage = rawMasterData.dynamicPages.find(p => p.id === id)

  const flatWidgets = (page?.rows ?? [])
    .flatMap(row =>
      row.cells.flatMap(cell =>
        cell.widgets.flatMap(widget => {
          // for multi-ID widgets we just place the widget in the array multiple times
          if ('id' in widget && Array.isArray(widget.id)) {
            return widget.id.map(() => widget)
          } else return widget
        })
      )
    )
    .filter(widget => !widgetTypesWithoutHotkeys.includes(widget.type))
  const activeHotkeyIndex = useNumberHotkey(flatWidgets.length)

  if (!page || !rawPage) return null

  const { headline, rows } = page

  const cancelEditing = useEvent(() => {
    setEditing(false)
    setEditedPage(null)
  })

  const save = useEvent(() => {
    if (editedPage !== null) {
      editEntity('dynamicPages', editedPage)
    }
    cancelEditing()
  })

  const startEditing = useEvent(() => setEditing(true))

  return (
    <>
      <Header
        rightContent={
          editing ? (
            <>
              <Button
                icon={iconClose}
                transparent
                onClick={cancelEditing}
                title="Cancel"
              />
              <Button icon={iconOk} title="Save" transparent onClick={save} />
            </>
          ) : (
            <Button
              icon={iconConfig}
              title="Edit"
              transparent
              onClick={startEditing}
            />
          )
        }
      >
        {headline}
      </Header>

      {editing ? (
        <>
          <DynamicPageEditor entry={rawPage} onChange={setEditedPage} inline />
          <br />
          <div className={centeredText}>
            <Button icon={iconOk} onClick={save}>
              Save
            </Button>
            <Button icon={iconClose} onClick={cancelEditing}>
              Cancel
            </Button>
          </div>
        </>
      ) : (
        rows.map(({ headline, cells }, index) => (
          <Grid
            key={index}
            headline={headline}
            cells={cells.map(({ factor, widgets }) => ({
              factor,
              children: (
                <>
                  {widgets.map((widget, index) => {
                    const hotkeyIndex = flatWidgets.indexOf(widget)

                    if ('id' in widget && Array.isArray(widget.id)) {
                      return (
                        <Fragment key={index}>
                          {widget.id.map((id, idIndex) => (
                            <DynamicWidget
                              key={id}
                              config={{
                                ...widget,
                                id,
                              }}
                              hotkeysActive={
                                hotkeyIndex + idIndex === activeHotkeyIndex
                              }
                              cornerLabel={getHotkeyLabel(
                                hotkeyIndex + idIndex
                              )}
                            />
                          ))}
                        </Fragment>
                      )
                    }

                    return (
                      <DynamicWidget
                        key={index}
                        config={widget}
                        hotkeysActive={hotkeyIndex === activeHotkeyIndex}
                        cornerLabel={getHotkeyLabel(hotkeyIndex)}
                      />
                    )
                  })}
                </>
              ),
            }))}
          />
        ))
      )}
    </>
  )
})

export default DynamicPage
