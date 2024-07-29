import "dotenv/config"

import { createBot, createProvider, createFlow, addKeyword, EVENTS } from '@builderbot/bot'
import { MemoryDB as Database } from '@builderbot/bot'
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'
import { toAsk, httpInject, run  } from "@builderbot-plugins/openai-assistants"
import { typing } from "./utils/presence"
import AIClass from './services/ai';
import flow from './flows';

const PORT = process.env?.PORT ?? 3008
const ai = new AIClass(process.env.OPENAI_API_KEY, 'gpt-3.5-turbo-0125')

const main = async () => {
    const adapterProvider = createProvider(Provider)
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
