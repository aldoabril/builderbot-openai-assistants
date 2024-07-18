import { addKeyword, utils } from "@builderbot/bot"
import { flowSeller } from "./seller.flow"
import {addPatientTemp} from "src/services/calendar"

const empresaId = process.env.EMPRESA_ID

const registerFlow = addKeyword(utils.setEvent('REGISTER_FLOW'))
.addAnswer(`Ingresa tu DNI:`, { capture: true }, async (ctx, { state }) => {
    const persona = state.get('persona')
    
    await state.update({ persona: {...persona,numDoc: ctx.body, telefono: ctx.from, empresaId: empresaId} })
})

.addAnswer(`Ingresa tus apellidos:`, { capture: true }, async (ctx, { state }) => {
    const persona = state.get('persona')
    
    await state.update({ persona: {...persona,apellidos: ctx.body} })
})
    .addAnswer(`Ingresa tus nombres:`, { capture: true }, async (ctx, { state }) => {
        const persona = state.get('persona')
        await state.update({ persona: {...persona,nombres: ctx.body} })
    })
    .addAnswer('Ingresa tu correo:', { capture: true }, async (ctx, { state }) => {
        const persona = state.get('persona')
        await state.update({ persona: {...persona,correo: ctx.body} })
    })
    .addAction(async (_, { flowDynamic, state, gotoFlow }) => {
        const persona = state.get('persona')
        await addPatientTemp(persona)
        await flowDynamic(`${persona.nombres}, gracias por la informacion!`)
        return gotoFlow(flowSeller)
        
    })
export {registerFlow}