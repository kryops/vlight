import { mdiAccount } from '@mdi/js'
import React from 'react'

import styles from './lazy.scss'

const LazyComponent: React.SFC = () => (
  <div className={styles.lazy}>
    LAZY foo{' '}
    <svg>
      <path d={mdiAccount} />
    </svg>{' '}
    LOADED
  </div>
)

export default LazyComponent
