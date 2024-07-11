import "dotenv/config"

import { createBot, createProvider, createFlow, addKeyword, EVENTS } from '@builderbot/bot'
import { MemoryDB as Database } from '@builderbot/bot'
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'
import { toAsk, httpInject, run  } from "@builderbot-plugins/openai-assistants"
import { typing } from "./utils/presence"
import AIClass from './services/ai';
import flow from './flows';

const PORT = process.env?.PORT ?? 3008
const ai = new AIClass(process.env.OPEN_API_KEY, 'gpt-3.5-turbo-0125')

const main = async () => {
    const adapterProvider = createProvider(Provider)
    const adapterDB = new Database()

    const { httpServer } = await createBot({
        flow: flow,
        provider: adapterProvider,
        database: adapterDB,
    }, { extensions: { ai } })

    httpInject(adapterProvider.server)
    httpServer(+PORT)
}

main()
