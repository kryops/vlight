import { ChannelType } from '@vlight/controls'

export const positionChannels: string[] = [
  ChannelType.Pan,
  ChannelType.PanFine,
  ChannelType.Tilt,
  ChannelType.TiltFine,
]

export interface Position {
  [ChannelType.Pan]: number
  [ChannelType.Tilt]: number
}
