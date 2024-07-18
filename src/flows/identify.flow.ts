import { addKeyword, EVENTS, utils} from "@builderbot/bot";
import { clearHistory } from "../utils/handleHistory";
import { flowSeller } from "./seller.flow";
import { registerFlow } from "./register.flow";
import { flowConfirm } from "./confirm.flow";
import {getPatientByPhone} from "src/services/calendar"
import { pseudoRandomBytes } from "crypto";

const EMPRESA_ID = process.env.EMPRESA_ID || "hIntsAEzBwy8Hwi4DNcf"
/**
 * Encargado de pedir los datos necesarios para registrar el evento en el calendario
 */
const identifyFlow = addKeyword(utils.setEvent('IDENTIFY_FLOW')).addAction(async (_, { flowDynamic }) => {
    await flowDynamic('¿Cual es tu DNI?')
}).addAction({ capture: true }, async (ctx, { state, flowDynamic, endFlow, gotoFlow }) => {

    if (ctx.body.toLocaleLowerCase().includes('cancelar')) {
        clearHistory(state)
        await flowDynamic(`¿Como puedo ayudarte?`)

    }
    await state.update({ dni: ctx.body })
    
    const empresaId = process.env.EMPRESA_ID||"hIntsAEzBwy8Hwi4DNcf"
    const persona = await getPatientByPhone(ctx.from, empresaId)
    if (!persona) {

            await flowDynamic('Aun no eres cliente!') 
            return gotoFlow(registerFlow)
        }
    else {

        await state.update({ persona: persona })
        }
    //clearHistory(state)
    await flowDynamic('Bienvenido '+  persona.nombres)
    return gotoFlow(flowConfirm)
    
})

const identifyByFhoneFlow = addKeyword(utils.setEvent('IDENTIFY_FLOW')).addAction(async (ctx, { state,flowDynamic, gotoFlow }) => {
    const telefono = ctx.from
    
    const persona = await getPatientByPhone(telefono, EMPRESA_ID)
    console.log('persona identificada', persona)
    if (!persona) {

            await flowDynamic('Aun no eres cliente!') 
            return gotoFlow(registerFlow)
        }
    else {

        await state.update({ persona: persona })
        }
    //clearHistory(state)
    await flowDynamic('De acuerdo '+  persona.nombres)
    return gotoFlow(flowConfirm)

})


    

    
        


export { identifyFlow , identifyByFhoneFlow}