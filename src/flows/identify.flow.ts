import { addKeyword, EVENTS, utils} from "@builderbot/bot";
import { clearHistory } from "../utils/handleHistory";
import Usuario from "src/services/user";
import { flowSeller } from "./seller.flow";
import { registerFlow } from "./register.flow";
import { flowConfirm } from "./confirm.flow";

const usuario = new Usuario()
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
    const persona = await usuario.getUsuario(state.get('dni'), empresaId)
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
    
    const persona = await usuario.getUsuarioByPhone(telefono, EMPRESA_ID)
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


    

    
        


export { identifyFlow , identifyByFhoneFlow}