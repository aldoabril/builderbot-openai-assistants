import "dotenv/config"

import { createBot, createProvider, createFlow, addKeyword, EVENTS } from '@builderbot/bot'
import { MemoryDB as Database } from '@builderbot/bot'
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'
import { toAsk, httpInject, run  } from "@builderbot-plugins/openai-assistants"
import { typing } from "./utils/presence"
import AIClass from './services/ai';
import flow from './flows';
import { google } from 'googleapis';

const PORT = process.env?.PORT ?? 3008
const ai = new AIClass(process.env.OPENAI_API_KEY, 'gpt-3.5-turbo-0125')
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

const main = async () => {
    const adapterProvider = createProvider(Provider)
    const adapterDB = new Database()

    const { httpServer, handleCtx } = await createBot({
        flow: flow,
        provider: adapterProvider,
        database: adapterDB,
    }, { extensions: { ai } })

    
    adapterProvider.server.post('/v1/mensajes', handleCtx(async (bot, req, res) => {
        const { number, message } = req.body
        await bot.sendMessage(number, message, {})
        return res.end('send')
    }))
    adapterProvider.server.post('/v1/renueva-token',handleCtx(async(bot, req, res)=>{
        const oauth2Client = new google.auth.OAuth2(
            GOOGLE_CLIENT_ID,
            GOOGLE_CLIENT_SECRET,
            GOOGLE_REDIRECT_URI
        );
        const {refreshToken} = req.body
        try{
            oauth2Client.setCredentials({ refresh_token: refreshToken });
            const newTokens = await oauth2Client.refreshAccessToken();

            console.log('newtoken',newTokens)
            //res.sendFile('index.html');
            return res.end('oki')
        }catch(ex){
            console.log(ex)
        }
    }))
    adapterProvider.server.post('/v1/auth-google-calendar',  handleCtx(async (bot, req, res ) => {
        console.log('entro a auth google calendar ', GOOGLE_REDIRECT_URI)
        const oauth2Client = new google.auth.OAuth2(
            GOOGLE_CLIENT_ID,
            GOOGLE_CLIENT_SECRET,
            GOOGLE_REDIRECT_URI
        );
        const {code} = req.body
        console.log(code)
        try{

            const { tokens } = await oauth2Client.getToken(code);
            const {access_token, refresh_token} = tokens
            
            bot.globalState().update(state => ({ ...state, access_token, refresh_token }))
            //const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${startDate.toISOString()}&timeMax=${endDate.toISOString()}`
            const url = `https://www.googleapis.com/calendar/v3/calendars/e67a7e50ccc11c8f4cd21f071c5f200a71b30c0ee0f9510a44266bd7ae504f96@group.calendar.google.com/events`
            const response = await fetch(
                url,
                {
                    headers: {
                        Authorization: `Bearer ${access_token}`,
                    },
                }
            );
         
        oauth2Client.setCredentials(tokens);

        oauth2Client.on('tokens', (tokens) => {
            if (tokens.refresh_token) {
              // store the refresh_token in my database!
              console.log(tokens.refresh_token);
            }
            console.log(tokens.access_token);
          });


        //console.log(await response.json())

        
        }catch(ex){
            console.log('ex',ex)


        }

        
        return res.end("todo bien")
    }))
    httpInject(adapterProvider.server)
   
    httpServer(+PORT)

}

main()
