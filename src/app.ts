import "dotenv/config"

import { createBot, createProvider, createFlow, addKeyword, EVENTS } from '@builderbot/bot'
import { MemoryDB as Database } from '@builderbot/bot'
//import { BaileysProvider as Provider } from '@builderbot/provider-baileys'
import { MetaProvider as Provider } from '@builderbot/provider-meta'
import { toAsk, httpInject, run  } from "@builderbot-plugins/openai-assistants"
import { typing } from "./utils/presence"
import AIClass from './services/ai';
import flow from './flows';

const PORT = process.env?.PORT ?? 3008
const ai = new AIClass(process.env.OPENAI_API_KEY, 'gpt-3.5-turbo-0125')
const NUMBER_ID = process.env.NUMBER_ID ?? 290468194157841
const JWT_TOKEN = process.env.JWT_TOKEN ?? "EAAGXQ8gHSS0BO4qgZA5ljt9hygEGJfZBWgYkWB3LE0IqzbPcYvAxElOnE6Sq4W2mdZBrHqDsrvPQm4Bxp9CoMsz3TN9GWNce3TCdr5vSLkFgOO00ZBgVqdhHeSPyoGNCRNEPsHXA6sOwZBZCS1ysXfLN2NGPOwyZAdX0dS6ijBNTdyaGpkuOIiBZCoWfYFKu7PMTol9hkLkhdlQlacjR"
const VERIFY_TOKEN = process.env.VERIFY_TOKEN ?? 1234567890

const main = async () => {
    const args =  {
        jwtToken: JWT_TOKEN,
        numberId: NUMBER_ID,
        verifyToken: VERIFY_TOKEN,
        version: 'v20.0'
    }
    const adapterProvider = createProvider(Provider,args)
    const adapterDB = new Database()

    const { httpServer, handleCtx } = await createBot({
        flow: flow,
        provider: adapterProvider,
        database: adapterDB,
    }, { extensions: { ai } })

    
    adapterProvider.server.post('/v1/mensajes', handleCtx(async (bot, req, res) => {
        const { number, message } = req.body
        await bot.sendMessage(number, message, {})
        return res.end('send')
    }))

    
    
    httpInject(adapterProvider.server)
   
    httpServer(+PORT)

}

main()
