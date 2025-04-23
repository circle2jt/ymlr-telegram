import { type SendProps } from './send.props'

export type SendMediaGroupProps = {
  editMessageIDs?: string[]
  data: Array<{
    media: string
    type: 'photo' | 'audio' | 'document' | 'video'
    caption?: string
    filename?: string
  }>
} & SendProps
