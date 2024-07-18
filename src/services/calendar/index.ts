import { N8N_ADD_TO_CALENDAR, N8N_GET_FROM_CALENDAR } from 'src/config'

/**
 * get calendar
 * @returns 
 */
const getCurrentCalendar = async (): Promise<{ start: string, end: string }[]> => {
    console.log('getCurrentCalendar', N8N_GET_FROM_CALENDAR)
    const dataCalendarApi = await fetch(N8N_GET_FROM_CALENDAR)
    const datos = await dataCalendarApi.json()
    console.log('datos', datos)
    const json: { start: { dateTime: string }, end: { dateTime: string } }[] = datos
    const list = json.reduce((prev, current) => {
        prev.push({ start: current.start.dateTime, end: current.end.dateTime })
        return prev
    }, [])
    return list
}

async function getGoogleCalendarEvents(accessToken:string, startDate:Date, endDate:Date, calendarId: string) {
    try {
        
        const response = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?timeMin=${startDate.toISOString()}&timeMax=${endDate.toISOString()}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        if (response.ok) {
            const data = await response.json();
            console.log("Eventos de Google Calendar:", data);
            const todayEvents = data.items.filter((event) => event.start.dateTime);
            return todayEvents;
        } else {
            console.error('Error al recuperar eventos:', response.statusText);

            
            throw new Error('Error al recuperar eventos de Google Calendar');
        }
    } catch (error) {
        console.error('Error al procesar la solicitud:', error);
        throw new Error('Error al procesar la solicitud');
    }
}


/**
 * add to calendar
 * @param body 
 * @returns 
 */
const appToCalendar = async (payload: { name: string, email: string, startDate: Date, endData: Date, phone: string }) => {
    try {
        const dataApi = await fetch(N8N_ADD_TO_CALENDAR, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload)
        })
        return dataApi
    } catch (err) {
        console.log(`error: `, err)
    }
}

export { getCurrentCalendar, appToCalendar, getGoogleCalendarEvents }