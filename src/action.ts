import assert from 'assert'
import { Job } from 'ymlr/src/components/.job/job'
import { ActionProps } from './action.props'
import { Bot } from './bot'

/** |**  ymlr-telegram'action
  Handle callback in inline keyboard
  @example
  ```yaml
    - name: Handle inline keyboard when user pick one
      ymlr-telegram'action:
        token: ${BOT_TOKEN}
        name: callback
        runs:
          # $parentState.botCtx: is ref to telegraf in https://www.npmjs.com/package/telegraf
          - vars:
              callbackData: ${$parentState.botCtx.update.callback_query.data}   # => VN/US
          - echo: ${ $vars.callbackData }
          - exec'js: |
              $parentState.botCtx.reply('Picked ' + $vars.callbackData)

    - ymlr-telegram'send:
        token: ${BOT_TOKEN}
        chatID: ${CHAT_ID}
        text: Send a message to help users to choose a language
        opts:
          reply_markup:
            one_time_keyboard: true
            inline_keyboard:
              -
                - text: VietNam
                  callback_data: VN
                - text: US
                  callback_data: US
  ```
*/
export class Action extends Job {
  name?: string | string[] | RegExp | RegExp[]
  token?: string

  bot?: Bot

  constructor({ name, token, ...props }: ActionProps) {
    super(props as any)
    Object.assign(this, { name, token })
    this.ignoreEvalProps.push('bot')
  }

  async execJob() {
    assert(this.name, '"name" is required')
    let bot: Bot | undefined
    if (this.token) {
      bot = this.bot = new Bot({
        token: this.token
      })
    } else {
      bot = this.proxy.getParentByClassName<Bot>(Bot)?.element
    }
    assert(bot)
    bot.telegraf.action(this.name, async ctx => {
      this.logger.debug(`⇠┆${this.name}┆⇠ \t%j`, ctx.message)
      await this.addJobData({ botCtx: ctx })
    })
    await this.bot?.exec()
  }

  async stop() {
    this.bot?.telegraf.stop()
    await super.stop()
  }
}
