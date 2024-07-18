import { addKeyword, EVENTS } from "@builderbot/bot";
import { generateTimer } from "../utils/generateTimer";
import { getHistory, getHistoryParse, handleHistory } from "../utils/handleHistory";
import AIClass from "../services/ai";
import { MemoryDB as Database } from '@builderbot/bot'
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'
import { typing } from "src/utils/presence"
import { toAsk, httpInject, run  } from "@builderbot-plugins/openai-assistants"
import { getFullCurrentDate } from "src/utils/currentDate";
import { pdfQuery } from "src/services/pdf";
const EMPRESA_ID = process.env.EMPRESA_ID
const ASSISTANT_ID = process.env?.ASSISTANT_ID ?? 'asst_CefzVkM2h46pY3dZ6DZVheS4'



const flowSeller = addKeyword<Provider, Database>(EVENTS.WELCOME)
    .addAnswer(`⏱️`)
    .addAction(async (ctx, { flowDynamic, state, provider }) => {
        await typing(ctx, provider)
        const response = await toAsk(ASSISTANT_ID, ctx.body, state)
        await handleHistory({ content: response, role: 'assistant' }, state)

        const chunks = response.split(/(?<!\d)\.\s+/g);

        for (const chunk of chunks) {
            await flowDynamic([{ body: chunk.trim(), delay: generateTimer(150, 250) }]);
        }

       
    })



export { flowSeller }