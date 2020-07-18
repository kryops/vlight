import React, { useState } from 'react'

import { useMasterData } from '../../hooks/api'
import { memoInProduction } from '../../util/development'
import { Grid } from '../../ui/containers/grid'
import { pageWithWidgets } from '../../ui/css/page'
import { DynamicWidget } from '../../widgets/dynamic'
import { showDialog } from '../../ui/overlays/dialog'
import { okCancel } from '../../ui/overlays/buttons'
import { Clickable } from '../../ui/components/clickable'
import { Input } from '../../ui/forms/input'
import { Checkbox } from '../../ui/forms/checkbox'
import { Select } from '../../ui/forms/select'
import { useFormState } from '../../hooks/form'
import {
  FormTextInput,
  FormNumberInput,
  FormCheckbox,
  FormSelect,
} from '../../ui/forms/form-input'

const TestPage = memoInProduction(() => {
  const masterData = useMasterData()
  const [inputValue, setInputValue] = useState('foo')
  const [selectValue, setSelectValue] = useState('foo')
  const [checkboxValue, setCheckboxValue] = useState(false)
  const formState = useFormState<{
    foo?: boolean
    name?: string
    channel?: number
    bar?: string
  }>({})

  return (
    <div>
      <h1>Test Page</h1>
      <h2>Forms</h2>
      Input: <Input type="text" value={inputValue} onChange={setInputValue} />
      <br />
      Checkbox: <Checkbox value={checkboxValue} onChange={setCheckboxValue} />
      <br />
      Select:
      <Select
        value={selectValue}
        onChange={setSelectValue}
        entries={[undefined, 'foo', 'bar', 'baz']}
      />
      <br />
      FormState: <FormTextInput formState={formState} name="name" />{' '}
      <FormTextInput formState={formState} name="name" />{' '}
      <FormNumberInput formState={formState} name="channel" />
      <FormCheckbox formState={formState} name="foo" />
      <FormSelect
        formState={formState}
        name="bar"
        entries={[undefined, 'sdf', 'dfgfdg', 'dfgdfölgkjdflkg']}
      />
      <h2>Overlay / Modal / Dialog</h2>
      <Clickable onClick={() => showDialog('sadsdfsdf', okCancel)}>
        Dialog
      </Clickable>
      <h2>Grid</h2>
      <Grid
        headline="Gridddd"
        cells={[
          {
            children: (
              <>
                <DynamicWidget config={{ type: 'universe', from: 1, to: 22 }} />
                <DynamicWidget config={{ type: 'channels', from: 1, to: 8 }} />
              </>
            ),
          },
          {
            children: (
              <>
                <DynamicWidget config={{ type: 'channels', from: 1, to: 3 }} />
                <DynamicWidget config={{ type: 'channels', from: 1, to: 3 }} />
              </>
            ),
            factor: 2,
          },
          {
            children: '3',
          },
        ]}
      />
      <h2>Widgets</h2>
      <div className={pageWithWidgets}>
        <DynamicWidget config={{ type: 'universe', from: 1, to: 22 }} />
        <DynamicWidget config={{ type: 'channels', from: 1, to: 8 }} />
        <DynamicWidget config={{ type: 'channels', from: 1, to: 4 }} />
        <DynamicWidget config={{ type: 'fixture', id: 'rgb' }} />
        <DynamicWidget config={{ type: 'fixture', id: 'rgb' }} />
        <DynamicWidget config={{ type: 'fixture-group', id: 'multi' }} />
      </div>
      <h2>Master data</h2>
      <pre>{JSON.stringify(masterData, null, 2)}</pre>
    </div>
  )
})

export default TestPage
