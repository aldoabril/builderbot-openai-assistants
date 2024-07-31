import { addKeyword, EVENTS, utils } from "@builderbot/bot";
import { clearHistory } from "../utils/handleHistory";
import { addMinutes, format } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import { appToCalendar,insertEventToGoogleCalendar } from "src/services/calendar";
import Usuario from "~/services/user";


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
        await flowDynamic('¿Cual es tu numero de DNI?')
    
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
            endDate: utcToZonedTime(addMinutes(state.get('desiredDate'), +DURATION_MEET), TIME_ZONE),
            phone: ctx.from
        }
        console.log('persona', dateObject)
        await insertEventToGoogleCalendar(dateObject);

        clearHistory(state)
         await flowDynamic('Listo! agendado Buen dia')
    })
          
    const isClientFlowConfirm = addKeyword(EVENTS.ACTION).
    addAction(async (ctx, { state, flowDynamic, endFlow }) => {
        const persona = state.get('persona')
        const dateObject = {
            name: persona.nombres+persona.apellidos,
            email: persona.email,
            startDate: utcToZonedTime(state.get('desiredDate'), TIME_ZONE),
            endDate: utcToZonedTime(addMinutes(state.get('desiredDate'), +DURATION_MEET), TIME_ZONE),
            phone: ctx.from
        }
    
        if (ctx.body.toLocaleLowerCase().includes('cancelar')) {
            clearHistory(state)
            await flowDynamic(`¿Como puedo ayudarte?`)
    
        }
        console.log('antes de confirmacion', dateObject)
        try{

            await insertEventToGoogleCalendar(dateObject);
            clearHistory(state)
            await flowDynamic(`${persona.nombres}, tu cita ha sido agendada, buen dia`)
        } catch (error) {

            await flowDynamic(`${persona.nombres}, hubo un fallo al confirmar tu cita`)
        }
            
        
    
    })

    

    
export { flowConfirm, isClientFlowConfirm, notClientFlowConfirm }