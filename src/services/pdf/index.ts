import { CHATPDF_API, CHATPDF_KEY, CHATPDF_SRC } from "src/config"
import axios from "axios"
/**
 * 
 * @returns 
 */
export const pdfQuery = async (query:string): Promise<string> => {
    try {
        console.log('CHATPDF_API', CHATPDF_API,'CHATPDF_KEY', CHATPDF_KEY, 'CHATPDF_SRC', CHATPDF_SRC);

        const config = {
            headers: {
              "x-api-key": CHATPDF_KEY,
              "Content-Type": "application/json",
            },
          };

          
        const data = {
            sourceId: CHATPDF_SRC,
            messages: [
              {
                role: "user",
                content: " ¿Cuáles son los servicios que ofrece Clarus Dent?",
              },
            ],
          };
        //   const response = await axios.post(CHATPDF_API, data, config)
        //   console.log('response', response.data.content)
        //   return response.data.content

        const dataApi = await fetch(CHATPDF_API, {
            method: 'POST',
            headers: {
                'x-api-key': CHATPDF_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "sourceId": CHATPDF_SRC,
                "messages": [
                    {
                        "role": "user",
                        "content": query
                    }
                ]
            })
        })
        const response = await dataApi.json()
        return response.content
    } catch (e) {
        console.log(e)
        return 'ERROR'
    }
}
