import { addKeyword, EVENTS, utils} from "@builderbot/bot";
import { MemoryDB as Database } from '@builderbot/bot'
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'
import { typing } from "src/utils/presence"
import { toAsk, httpInject, run  } from "@builderbot-plugins/openai-assistants"
const ASSISTANT_ID = process.env?.ASSISTANT_ID ?? 'asst_CefzVkM2h46pY3dZ6DZVheS4'

const welcomeFlow = addKeyword<Provider, Database>(EVENTS.WELCOME)
    .addAction(async (ctx, { flowDynamic, state, provider }) => {
        await typing(ctx, provider)
        const response = await toAsk(ASSISTANT_ID, ctx.body, state)
       const chunks = response.split(/\n\n+/);
for (const chunk of chunks) {
    await flowDynamic([{ body: chunk.trim() }]);
}
    })

export {welcomeFlow}