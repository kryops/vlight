import React from 'react'

import styles from './lazy.scss'

const LazyComponent: React.SFC = () => (
  <div className={styles.lazy}>LAZY LOADED</div>
)

export default LazyComponent
