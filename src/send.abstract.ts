import assert from 'assert'
import { Telegraf } from 'telegraf'
import { ElementProxy } from 'ymlr/src/components/element-proxy'
import { Element } from 'ymlr/src/components/element.interface'
import { Bot } from './bot'
import { SendProps } from './send.props'

export abstract class SendAbstract implements Element {
  ignoreEvalProps = ['telegraf', 'bot']
  proxy!: ElementProxy<this>
  protected get logger() {
    return this.proxy.logger
  }

  telegraf?: Telegraf

  token?: string
  chatIDs!: Array<string | number>
  notify?: boolean
  replyMessageID?: number
  opts?: any

  type?: 'Markdown' | 'HTML'

  constructor({ chatID, chatIDs = [], ...props }: SendProps) {
    chatID && chatIDs.push(chatID)
    Object.assign(this, { chatIDs, ...props })
  }

  async exec() {
    assert(this.chatIDs.length > 0)
    if (this.token) {
      this.telegraf = new Telegraf(this.token)
    } else {
      this.telegraf = this.proxy.getParentByClassName<Bot>(Bot)?.element?.telegraf
    }
    assert(this.telegraf, 'Could found "ymlr-telegram" or "token"')
    const opts: any = {
      parse_mode: this.type,
      disable_notification: !!this.notify,
      reply_to_message_id: this.replyMessageID,
      ...(this.opts || {})
    }
    const rs = await this.send(this.telegraf, opts)
    return rs
  }

  abstract send(bot: Telegraf, opts: any): any

  dispose() { }
}
