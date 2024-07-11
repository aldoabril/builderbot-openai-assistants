import { BotContext, BotMethods } from "@builderbot/bot/dist/types"
import { getHistoryParse } from "../utils/handleHistory"
import AIClass from "src/services/ai"
import { flowSeller } from "../flows/seller.flow"
import { flowSchedule } from "../flows/schedule.flow"
import { identifyFlow } from "src/flows/identify.flow"
import { flowConfirm } from "src/flows/confirm.flow"

const PROMPT_DISCRIMINATOR = `Como una inteligencia artificial avanzada, tu tarea es analizar el contexto de una conversación y determinar cuál de las siguientes acciones es más apropiada para realizar:
    --------------------------------------------------------
    Historial de conversación:
    {HISTORY}
    ### MENU OPCIONES
    El menu de opciones proporcionado al cliente es el siguiente:
    1. Información de servicios 
    2. Promociones disponibles 
    3. Agendar una cita 

    
    Posibles acciones a realizar:
    1. AGENDAR: Esta acción se debe realizar cuando el cliente expresa su deseo de programar una cita.
    2. HABLAR: Esta acción se debe realizar cuando el cliente desea hacer una pregunta o necesita más información.
    3. CONFIRMAR: Esta acción se debe realizar cuando el cliente y el vendedor llegaron a un acuerdo mutuo proporcionando una fecha, dia y hora exacta sin conflictos de hora.
    -----------------------------
    Tu objetivo es comprender la intención del cliente y seleccionar la acción más adecuada en respuesta a su declaración.
    
    Respuesta ideal (AGENDAR|HABLAR|CONFIRMAR):`

export default async (_: BotContext, { state, gotoFlow, extensions }: BotMethods) => {
    const ai = extensions.ai as AIClass
    const history = getHistoryParse(state)
    const prompt = PROMPT_DISCRIMINATOR.replace('{HISTORY}', history)


    console.log('estamos en prompt', prompt)

    const { prediction } = await ai.determineChatFn([
        {
            role: 'system',
            content: prompt
        }
    ])


    console.log({ prediction })

    if (prediction.includes('HABLAR')) return gotoFlow(flowSeller)
    if (prediction.includes('AGENDAR')) return gotoFlow(flowSchedule)
    if (prediction.includes('CONFIRMAR')) return gotoFlow(flowConfirm)
}