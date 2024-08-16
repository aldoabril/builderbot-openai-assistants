import "dotenv/config"

import { createBot, createProvider, createFlow, addKeyword, EVENTS } from '@builderbot/bot'
import { MemoryDB as Database } from '@builderbot/bot'
//import { BaileysProvider as Provider } from '@builderbot/provider-baileys'
import { MetaProvider as Provider } from '@builderbot/provider-meta'
import { toAsk, httpInject } from "@builderbot-plugins/openai-assistants"
import { typing } from "./utils/presence"

const PORT = process.env?.PORT ?? 3008
const ASSISTANT_ID = process.env?.ASSISTANT_ID ?? 'asst_CefzVkM2h46pY3dZ6DZVheS4'
const NUMBER_ID = process.env.NUMBER_ID ?? 290468194157841
const JWT_TOKEN = process.env.JWT_TOKEN ?? "EAAGXQ8gHSS0BO4qgZA5ljt9hygEGJfZBWgYkWB3LE0IqzbPcYvAxElOnE6Sq4W2mdZBrHqDsrvPQm4Bxp9CoMsz3TN9GWNce3TCdr5vSLkFgOO00ZBgVqdhHeSPyoGNCRNEPsHXA6sOwZBZCS1ysXfLN2NGPOwyZAdX0dS6ijBNTdyaGpkuOIiBZCoWfYFKu7PMTol9hkLkhdlQlacjR"
const VERIFY_TOKEN = process.env.VERIFY_TOKEN ?? 1234567890

const welcomeFlow = addKeyword<Provider, Database>(EVENTS.WELCOME)
    .addAction(async (ctx, { flowDynamic, state, provider }) => {
        await typing(ctx, provider)
        const response = await toAsk(ASSISTANT_ID, ctx.body, state)
       const chunks = response.split(/\n\n+/);
for (const chunk of chunks) {
    await flowDynamic([{ body: chunk.trim() }]);
}
    })

const main = async () => {
    const args =  {
        jwtToken: JWT_TOKEN,
        numberId: NUMBER_ID,
        verifyToken: VERIFY_TOKEN,
        version: 'v20.0'
    }

    const adapterFlow = createFlow([welcomeFlow])
    const adapterProvider = createProvider(Provider,args)
    const adapterDB = new Database()

    const { httpServer } = await createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    httpInject(adapterProvider.server)
    httpServer(+PORT)
}

main()
