import { addKeyword, EVENTS, utils } from "@builderbot/bot";
import { clearHistory } from "../utils/handleHistory";
import { addMinutes, format } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import { appToCalendar } from "src/services/calendar";


const DURATION_MEET = process.env.DURATION_MEET ?? 45
const TIME_ZONE = process.env.TZ
/**
 * Encargado de pedir los datos necesarios para registrar el evento en el calendario
 */

    


const flowConfirm = addKeyword(EVENTS.ACTION).addAnswer(`⏱️`).addAction(async (_, { state, gotoFlow }) => {
    const persona = state.get('persona')
    
    if(!persona){
        console.log('nocliente flujo de confirmacion', persona)
        return gotoFlow(notClientFlowConfirm)
    } else{
        console.log('sicliente flujo de confirmacion', persona)
        return gotoFlow(isClientFlowConfirm)
    }
})

const notClientFlowConfirm = addKeyword(EVENTS.ACTION).addAction(async (_, { flowDynamic }) => {
    await flowDynamic('Ok, voy a pedirte unos datos para agendar, escribe "cancelar" para salir')
        await flowDynamic('¿Cual es tu nombre?')
    
}).addAction({ capture: true }, async (ctx, { state, flowDynamic, endFlow }) => {
    const persona = state.get('persona')

    if (ctx.body.toLocaleLowerCase().includes('cancelar')) {
        clearHistory(state)
        await flowDynamic(`¿Como puedo ayudarte?`)

    }
        persona.nombres = ctx.body
        await state.update({ persona: persona })
        await flowDynamic(`Ultima pregunta ¿Cual es tu email?`)
        
    


}).addAction({ capture: true }, async (ctx, { state, flowDynamic, fallBack,endFlow }) => {
        const persona = state.get('persona')    
            if (!ctx.body.includes('@')) {
                return fallBack(`Debes ingresar un mail correcto`)
            }
            persona.email = ctx.body
            await state.update({ persona: persona })
        const dateObject = {
            name: persona.nombres,
            email: persona.email,
            startDate: utcToZonedTime(state.get('desiredDate'), TIME_ZONE),
            endData: utcToZonedTime(addMinutes(state.get('desiredDate'), +DURATION_MEET), TIME_ZONE),
            phone: ctx.from
        }
        appToCalendar(dateObject);

        clearHistory(state)
         await flowDynamic('Listo! agendado Buen dia')
    })
          
    const isClientFlowConfirm = addKeyword(EVENTS.ACTION)
      .addAnswer('Ok, voy a pedirte unos datos para agendar, escribe "cancelar" para salir')
      .addAction(async (_, {flowDynamic, state}) => {
        const persona = state.get('persona')
        console.log('persona', persona)
        await flowDynamic(`¿Tu nombres es: ${persona.nombres} ${persona.apellidos} ?`)
        
    }).addAction({ capture: true }, async (ctx, { state, flowDynamic, endFlow }) => {
        const persona = state.get('persona')
        const dateObject = {
            name: persona.nombres+persona.apellidos,
            email: persona.email,
            startDate: utcToZonedTime(state.get('desiredDate'), TIME_ZONE),
            endData: utcToZonedTime(addMinutes(state.get('desiredDate'), +DURATION_MEET), TIME_ZONE),
            phone: ctx.from
        }
    
        if (ctx.body.toLocaleLowerCase().includes('cancelar')) {
            clearHistory(state)
            await flowDynamic(`¿Como puedo ayudarte?`)
    
        }
        if (ctx.body.toLocaleLowerCase().includes('si')) {
            await appToCalendar(dateObject);

            await flowDynamic(`Listo! agendado Buen dia`)
        }
        await flowDynamic(`¿Tus datos han sido mal ingresados?`)
    
    })

    

    
export { flowConfirm, isClientFlowConfirm, notClientFlowConfirm }