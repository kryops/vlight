import { useParams } from 'react-router'
import { useState } from 'react'
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
import { useNumberHotkey } from '../../hooks/hotkey'

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
    .flatMap(row => row.cells.flatMap(cell => cell.widgets))
    .filter(widget => !widgetTypesWithoutHotkeys.includes(widget.type))
  const activeHotkeyIndex = useNumberHotkey(flatWidgets.length)

  if (!page || !rawPage) return null

  const { headline, rows } = page

  const cancelEditing = () => {
    setEditing(false)
    setEditedPage(null)
  }

  const save = () => {
    if (editedPage !== null) {
      editEntity('dynamicPages', editedPage)
    }
    cancelEditing()
  }

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
              onClick={() => setEditing(true)}
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
                  {widgets.map((widget, index) => (
                    <DynamicWidget
                      key={index}
                      config={widget}
                      hotkeysActive={
                        flatWidgets.indexOf(widget) === activeHotkeyIndex
                      }
                    />
                  ))}
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
