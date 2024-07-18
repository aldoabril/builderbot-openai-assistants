import { addKeyword, EVENTS } from "@builderbot/bot";
import { generateTimer } from "../utils/generateTimer";
import { getHistory, getHistoryParse, handleHistory } from "../utils/handleHistory";
import AIClass from "../services/ai";
import { getFullCurrentDate } from "src/utils/currentDate";
import { pdfQuery } from "src/services/pdf";
import { getPatientByPhone } from "~/services/calendar";
const EMPRESA_ID = process.env.EMPRESA_ID
import {Usuario} from "~/types/usuario";
const PROMPT_SELLER2 =  `Eres el asistente virtual de Clarus Dent, ayudas a concretar citas en link de Google Calendar e informar a los clientes acerca de los servicios y campañas promocionales.
### DATOS DEL CLIENTE
{CLIENT_DATA}


### DÍA ACTUAL
{CURRENT_DAY}

### HISTORIAL DE CONVERSACIÓN (Cliente/Vendedor)
{HISTORY}

### BASE DE DATOS
{DATABASE}

### INTRUCCIONES
- Al empezar una comunicación, primero presentas el menu de opciones, 
- Si ya saludaste al cliente, no lo vuelvas a hacer 
- Dirígete al cliente en lo posible por su nombre, continua la conversacion sin saludar en primera persona. 
- Puedes utilizar la información proporcionada en la base de datos, no ofrescas promociones que no existe en la BASE DE DATOS 
- El contexto es la única información que tienes,ignora cualquier cosa que no esté relacionada con el contexto.
- Mantén un tono profesional y siempre responde en primera persona.
- Finaliza la conversacion con CTA ¿Te gustaria agendar un cita? ¿Quieres reservar una cita?
- La información será brindada mediante el envío de mensajes en párrafos cortos y usando emojis. 
- Ante alguna pregunta, brinda la información empleando la estrategia de problema, agitación y solución.  motivando a la imaginación, a generar deseo de compra. o de agendar una cita.
- Si el cliente te responde que no desea agendar la cita, tu primera elección es que te indique si desea otra fecha.
- Ante una respuesta negativa,  le indicas que tenemos una promoción especial y si le gustaría conocerla
- Si no hay respuesta durante 1 minuto, Agradece su comunicación y despídete.

### MENU OPCIONES
1. Información de servicios 
2. Promociones disponibles 
3. Agendar una cita 

` 
const PROMPT_SELLER = `Tu nombre es Boni, asistente virtual de Clarus Dent, ayudas a   concretar citas en link de Google calendar, e informar los clientes de las campañas promocionales . Utiliza mensajes en párrafos cortos para facilitar la lectura, siempre  busca la interacción haciendo una pregunta de cierre  al final del párrafo, que genere el deseo de cita. Lo primero que tienes que hacer es presentarte:
### DATOS DEL CLIENTE
{CLIENT_DATA}

### DÍA ACTUAL
{CURRENT_DAY}

### HISTORIAL DE CONVERSACIÓN (Cliente/Vendedor)
{HISTORY}

### BASE DE DATOS
{DATABASE}

Para proporcionar respuestas más útiles, puedes utilizar la información proporcionada en la base de datos. El contexto es la única información que tienes. Ignora cualquier cosa que no esté relacionada con el contexto.

### EJEMPLOS DE RESPUESTAS IDEALES:

- la informacion que te puedo proporcionar..
- un gusto saludarte en..
- por supuesto tenemos eso y ...

### INTRUCCIONES
- Mantén un tono profesional y siempre responde en primera persona.
- NO ofrescas promociones que no existe en la BASE DE DATOS
- Finaliza la conversacion con CTA ¿Te gustaria agendar un cita? ¿Quieres reservas una cita?
- Continua la conversacion sin saludar en primera persona

Respuesta útil adecuadas para enviar por WhatsApp (en español):`


export const generatePromptSeller = (history: string, database: string, usuario: string) => {
    const nowDate = getFullCurrentDate()
    return PROMPT_SELLER2
        .replace('{CLIENT_DATA}', usuario)  
        .replace('{HISTORY}', history)
        .replace('{CURRENT_DAY}', nowDate)
        .replace('{DATABASE}', database)
};

const generatePrompClient = (clientData: Usuario) =>{
    if (clientData)
    return `El nombre del cliente es:  ${clientData.nombres.toLocaleUpperCase()}, ${clientData.apellidos. toLocaleUpperCase()}`	
else return `Todavia no es cliente de Clarus Dent`
}
const replaceText = (text: string) =>{
    if (text.toLocaleUpperCase()=='INFO')
        return 'Información de servicios'
    else if (text.toLocaleUpperCase()=='PROMO')
        return 'Promociones disponibles'
    else if (text.toLocaleUpperCase()=='CITA')
        return 'Agendar una cita'
    else return text

}
const flowSeller = addKeyword(EVENTS.ACTION)
    .addAnswer(`⏱️`)
    .addAction(async (ctx, { state, flowDynamic, extensions }) => {
        try {
            let user;
            if (!state.get('persona'))
             user = await getPatientByPhone(ctx.from,EMPRESA_ID)
            else
            user = state.get('persona')
            
            const ai = extensions.ai as AIClass
            const lastMessage = getHistory(state).at(-1)
            lastMessage.content = replaceText(lastMessage.content)
            const history = getHistoryParse(state)

            const dataBase = await pdfQuery(lastMessage.content)
            console.log({ dataBase })
            const promptInfo = generatePromptSeller(history, dataBase, generatePrompClient(user))

            const response = await ai.createChat([
                {
                    role: 'system',
                    content: promptInfo
                }
            ])

            await handleHistory({ content: response, role: 'assistant' }, state)

            const chunks = response.split(/(?<!\d)\.\s+/g);

            for (const chunk of chunks) {
                await flowDynamic([{ body: chunk.trim(), delay: generateTimer(150, 250) }]);
            }
        } catch (err) {
            console.log(`[ERROR]:`, err)
            return
        }
    })

export { flowSeller }