import { addKeyword, EVENTS } from "@builderbot/bot";
import AIClass from "../services/ai";
import { getHistoryParse, handleHistory } from "../utils/handleHistory";
import { generateTimer } from "../utils/generateTimer";
import { getCurrentCalendar, getGoogleCalendarEvents } from "../services/calendar";
import { getFullCurrentDate } from "src/utils/currentDate";
import { flowConfirm } from "./confirm.flow";
import { addMinutes, isWithinInterval, format, parse } from "date-fns";
import { identifyByFhoneFlow } from "./identify.flow";
import { flowSeller } from "./seller.flow";

const DURATION_MEET = process.env.DURATION_MEET ?? 30
const EMPRESA_ID = process.env.EMPRESA_ID?? 'hIntsAEzBwy8Hwi4DNcf'
const PROMPT_FILTER_DATE = `
### Contexto
Eres un asistente de inteligencia artificial. Tu propósito es determinar la fecha y hora que el cliente quiere, en el formato yyyy/MM/dd HH:mm:ss.

### Fecha y Hora Actual:
{CURRENT_DAY}

### Registro de Conversación:
{HISTORY}

Asistente: "{respuesta en formato (yyyy/MM/dd HH:mm:ss)}"
`;

const generatePromptFilter = (history: string) => {
    const nowDate = getFullCurrentDate();
    const mainPrompt = PROMPT_FILTER_DATE
        .replace('{HISTORY}', history)
        .replace('{CURRENT_DAY}', nowDate);

    return mainPrompt;
}

function isWithinAvailability(date) {
    const day = date.getDay(); // 0 (domingo) a 6 (sábado)
    const hours = date.getHours();
    const minutes = date.getMinutes();

    // Definir los intervalos de tiempo
    const morningStart = new Date(date);
    morningStart.setHours(8, 0, 0, 0);

    const morningEnd = new Date(date);
    morningEnd.setHours(13, 0, 0, 0);

    const afternoonStart = new Date(date);
    afternoonStart.setHours(15, 0, 0, 0);

    const afternoonEnd = new Date(date);
    afternoonEnd.setHours(19, 0, 0, 0);

    // Verificar disponibilidad para días de semana (lunes a viernes)
    if (day >= 1 && day <= 5) {
        if (date >= morningStart && date < morningEnd) {
            return true;
        }
        if (date >= afternoonStart && date < afternoonEnd) {
            return true;
        }
    }

    // Verificar disponibilidad para sábado
    if (day === 6) {
        if (date >= morningStart && date < morningEnd) {
            return true;
        }
    }

    // No está dentro de los horarios disponibles
    return false;
}



const flowSchedule = addKeyword(EVENTS.ACTION).addAction(async (_, { extensions, state, flowDynamic, fallBack, endFlow }) => {
    await flowDynamic('Dame un momento para consultar la agenda...');
    const ai = extensions.ai as AIClass;
    const history = getHistoryParse(state);
    const listFake = [
        {
          end: '2024-06-12T08:45:00.000Z',
          name: 'Aldo',
          start: '2024-06-12T08:00:00.000Z'
        },
        {
          end: '2024-07-06T08:45:00.000Z',
          name: 'Aldo',
          start: '2024-07-06T08:00:00.000Z'
        },
        {
          end: '2024-07-06T09:15:00.000Z',
          name: 'Aldo Eslyn',
          start: '2024-07-06T08:30:00.000Z'
        }
      ]
    //const list = await getCurrentCalendar()
    
    const promptFilter = generatePromptFilter(history);

    const { date } = await ai.desiredDateFn([
        {
            role: 'system',
            content: promptFilter
        }
    ]);
    let desiredDate = new Date()
    try{

        desiredDate = parse(date, 'yyyy/MM/dd HH:mm:ss', new Date());
    }catch(ex){
        const m = 'Fecha mal ingresada. ¿Alguna otra fecha y hora?'
        await flowDynamic(m);
        await handleHistory({ content: m, role: 'assistant' }, state);
    }

    const list2 = await getGoogleCalendarEvents(desiredDate,EMPRESA_ID)
    console.log('list2', list2)
    const list = listFake

    const listParse = list2
        .map(({ start, end }) => ({ fromDate: new Date(start), toDate: new Date(end) }));

    console.log({ listParse })

    

    const isDateAvailable = listParse.every(({ fromDate, toDate }) => !isWithinInterval(desiredDate, { start: fromDate, end: toDate }));

    if (!isDateAvailable) {
        const m = 'Lo siento, esa hora ya está reservada. ¿Alguna otra fecha y hora?';
        return  fallBack(m);
        //await handleHistory({ content: m, role: 'assistant' }, state);
        
    }

    if (!isWithinAvailability(desiredDate)){

        const m = 'Lo siento, esa hora esta fuera de horario ¿Alguna otra fecha y hora?';
        return  fallBack(m);
        //await handleHistory({ content: m, role: 'assistant' }, state);
    }
try{

    const formattedDateFrom = format(desiredDate, 'hh:mm a');
    const formattedDateTo = format(addMinutes(desiredDate, +DURATION_MEET), 'hh:mm a');
    const message = `¡Perfecto! Tenemos disponibilidad de ${formattedDateFrom} a ${formattedDateTo} el día ${format(desiredDate, 'dd/MM/yyyy')}. ¿Confirmo tu reserva? *si*`;
    await handleHistory({ content: message, role: 'assistant' }, state);
    await state.update({ desiredDate })

    const chunks = message.split(/(?<!\d)\.\s+/g);
    for (const chunk of chunks) {
        await flowDynamic([{ body: chunk.trim(), delay: generateTimer(150, 250) }]);
    }
}catch(ex) {
    const m = 'Fecha mal ingresada. ¿Alguna otra fecha y hora?'
    return  fallBack(m);
    //await handleHistory({ content: m, role: 'assistant' }, state);
     

}

}).addAction({ capture: true }, async ({ body }, { gotoFlow, flowDynamic, state }) => {

    if (body.toLowerCase().includes('si')) return gotoFlow(identifyByFhoneFlow)

    //await flowDynamic('¿Alguna otra fecha y hora?')
    await state.update({ desiredDate: null })
    return gotoFlow(flowSeller)

})

export { flowSchedule }