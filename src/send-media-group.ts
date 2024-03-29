import assert from 'assert'
import { Telegraf } from 'telegraf'
import { ExtraPhoto } from 'telegraf/typings/telegram-types'
import { FileRemote } from 'ymlr/src/libs/file-remote'
import { SendMediaGroupProps } from './send-media-group.props'
import { SendAbstract } from './send.abstract'

/** |**  ymlr-telegram'sendMediaGroup
  Send a photo in telegram
  @example
  ```yaml
    - ymlr-telegram'sendMediaGroup:
        token: ${BOT_TOKEN}
        chatID: ${TELEGRAM_CHAT_ID}
        # chatIDs:
        #  - ${TELEGRAM_CHAT_ID_1}
        #  - ${TELEGRAM_CHAT_ID_2}
        data:
          - media: http://.../image1.jpg               # "file" is a path of local file or a URL
            caption: This is a image caption           # File caption
            type: photo                                # File type must in [ photo, document, audio, video ]
          - media: http://.../image2.jpg
            caption: This is a image caption
            type: photo
  ```

  Reuse bot in the ymlr-telegram
  ```yaml
    - ymlr-telegram:
        token: ${BOT_TOKEN}
        runs:
          - ymlr-telegram'sendMediaGroup:
              chatID: ${TELEGRAM_CHAT_ID}
              data:
                - media: http://.../image.jpg                # "file" is a path of local file or a URL
                  caption: This is a image caption           # File caption
                  type: photo                                # File type must in [ photo, document, audio, video ]
  ```
*/
export class SendMediaGroup extends SendAbstract {
  data = [] as Array<{
    type: 'photo' | 'audio' | 'document' | 'video'
    media: string
    caption?: string
  }>

  constructor({ data, ...props }: SendMediaGroupProps) {
    super(props as any)
    Object.assign(this, { data })
  }

  async exec() {
    assert(this.data?.length, '"data" is required')
    assert(this.data.every(m => m.type && m.media), '"type" and "media" are required')
    return await super.exec()
  }

  async send(bot: Telegraf, opts: ExtraPhoto) {
    this.logger.debug(`⇢┆${this.chatIDs}┆⇢ \t%j`, this.data)
    const data = this.data.map(item => {
      const fileRemote = new FileRemote(item.media, this.proxy.scene)
      return {
        ...item,
        media: fileRemote.uri
      }
    }) as any
    const rs = await Promise.all(this.chatIDs.map(async chatID => await bot.telegram.sendMediaGroup(chatID, data, {
      ...opts
    })))
    return rs as any
  }
}
