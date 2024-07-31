import { N8N_ADD_TO_CALENDAR, N8N_GET_FROM_CALENDAR } from 'src/config'
import Usuario from '../user'

/**
 * get calendar
 * @returns 
 */
const URL_FIREBASE_API = process.env.URL_FIREBASE_API
const EMPRESA_ID = process.env.EMPRESA_ID

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

async function getGoogleCalendarEvents(fecha, empresaId) {
  try {
    const url = `${URL_FIREBASE_API}/calendar/get-day-events`;
    
    const body = {
      empresaId,
      fecha
    };

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    };

    const response = await fetch(url, options);

    if (!response.ok) {
      // Intentar leer el cuerpo de la respuesta como texto
      const errorText = await response.text();
      throw new Error(`Something went wrong: ${response.status} ${response.statusText}. Server message: ${errorText}`);
    }
    const data = await response.json();
    
    console.log("The server responded with:", data);
    if (data.items.length === 0) {
      return []
    }

    return data.items.map((it) => ({
      start: it.start?.dateTime,
      end: it.end?.dateTime
    }));

  } catch (error) {
    console.error("The request failed with:", error);
    throw new Error('Error al recuperar eventos de Google Calendar: ' + error.message);
  }
}

async function insertEventToGoogleCalendar(payload: { name: string, email: string, startDate: Date, endDate: Date, phone: string }) {
  try {
      const url = `${URL_FIREBASE_API}/calendar/insert-event`
         
      // Using the fetch API to send a POST request to a server
// The data to be sent is stored in a variable called body
// The options object contains the method, headers, and body of the request
const  options = {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({empresaId: EMPRESA_ID, event: payload})
};
// The url of the server endpoint that handles the POST request
// Calling the fetch function with the url and options as arguments
// The fetch function returns a promise that resolves to a response object
const data = await fetch(url, options)
  
      return data
      
  } catch (error) {
      console.error('Error al procesar la solicitud:', error);
      throw new Error('Error al procesar la solicitud');
  }
}


// async function getGoogleCalendarEventsDirect(accessToken:string, startDate:Date, endDate:Date, calendarId: string) {
//     try {
        
//         const response = await fetch(
//             `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?timeMin=${startDate.toISOString()}&timeMax=${endDate.toISOString()}`,
//             {
//                 headers: {
//                     Authorization: `Bearer ${accessToken}`,
//                 },
//             }
//         );

//         if (response.ok) {
//             const data = await response.json();
//             console.log("Eventos de Google Calendar:", data);
//             const todayEvents = data.items.filter((event) => event.start.dateTime);
//             return todayEvents;
//         } else {
//             console.error('Error al recuperar eventos:', response.statusText);

            
//             throw new Error('Error al recuperar eventos de Google Calendar');
//         }
//     } catch (error) {
//         console.error('Error al procesar la solicitud:', error);
//         throw new Error('Error al procesar la solicitud');
//     }
// }

/**
 * add to calendar
 * @param body 
 * @returns 
 */
const getPatientByPhone= async ( telefono:string, empresaId: string) => {
  try {
   const options = {
      method: 'POST',
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify({telefono, empresaId})
  }
    const url = `${URL_FIREBASE_API}/pacientes/get-paciente-by-phone`
      const response = await fetch(url, options)
      if (response.ok){

        const paciente = await response.json()
        console.log('paciente', paciente)
        return paciente
      }
      else {
        throw new Error("error la traer paciente"+ response)
      }
  } catch (err) {
      console.log(`error: `, err)
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


/**
 * add to calendar
 * @param body 
 * @returns 
 */
const addPatientTemp = async (usuario: Usuario) => {
  try {
    const url = `${URL_FIREBASE_API}/pacientes/guardarPacienteTemporal`
      const dataApi = await fetch(url, {
          method: 'POST',
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify(usuario)
      })
      return dataApi
  } catch (err) {
      console.log(`error: `, err)
  }
}

export { getCurrentCalendar, appToCalendar, getGoogleCalendarEvents,insertEventToGoogleCalendar,addPatientTemp,getPatientByPhone }