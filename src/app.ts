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
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_CALLBACK_URL;

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
    adapterProvider.server.post('/v1/auth-google-calendar', handleCtx(async (bot, req, res) => {
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
            // const response = await fetch(
            //     `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${startDate.toISOString()}&timeMax=${endDate.toISOString()}`,
            //     {
            //         headers: {
            //         },
            //     }
            // );

        console.log(tokens)

        
        }catch(ex){
            console.log('ex',ex)


        }

        
        return res.end("todo bien")
    }))
    httpInject(adapterProvider.server)
   
    httpServer(+PORT)

}

main()
