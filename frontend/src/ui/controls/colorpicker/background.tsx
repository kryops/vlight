import React from 'react'

import { memoInProduction } from '../../../util/development'

export const ColorPickerBackground = memoInProduction(() => (
  <svg
    viewBox="0 0 256 256"
    height="100%"
    width="100%"
    preserveAspectRatio="none"
  >
    <defs>
      <linearGradient
        id="linearGradientWhite"
        y2="256"
        gradientUnits="userSpaceOnUse"
        x2="0"
        y1="0"
      >
        <stop stopColor="#fff" offset="0" />
        <stop stopColor="#fff" offset=".10" />
        <stop stopColor="#fff" stopOpacity="0" offset="1" />
      </linearGradient>
      <linearGradient
        id="linearGradientColor"
        y2="0"
        gradientUnits="userSpaceOnUse"
        x2="256"
        y1="0"
      >
        <stop stopColor="#f00" offset="0" />
        <stop stopColor="#ff0" offset=".167" />
        <stop stopColor="#0f0" offset=".333" />
        <stop stopColor="#0ff" offset=".5" />
        <stop stopColor="#00f" offset=".667" />
        <stop stopColor="#f0f" offset=".833" />
        <stop stopColor="#f00" offset="1" />
      </linearGradient>
    </defs>
    <rect
      height="256"
      width="256"
      y="0"
      x="0"
      fill="url(#linearGradientColor)"
    />
    <rect
      height="256"
      width="256"
      y="0"
      x="0"
      fill="url(#linearGradientWhite)"
    />
  </svg>
))
