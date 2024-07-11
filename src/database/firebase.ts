import { MemoryDB } from '@builderbot/bot'
import firebase from "firebase-admin"
import { Database } from 'firebase-admin/lib/database/database'
import type { FirebaseAdapterCredentials } from './types'

class FirebaseAdapter extends MemoryDB {
    db: Database
    private table = 'history'
    listHistory = []

    /**
     * Constructs a new FirebaseAdapter instance.
     * @param {FirebaseAdapterCredentials} credentials
     */
    constructor(private credentials: FirebaseAdapterCredentials) {
        super()
        this.init().then().catch((e) => {throw new Error(e?.message)})
    }

    /**
     * Initializes the Firebase connection and checks for the existence of the specified table.
     * @returns {Promise<void>} - A Promise that resolves when the initialization is complete.
     */
    async init(): Promise<void> {
        const cert = await import(this.credentials.pathPrivateKeyJson)
        firebase.initializeApp({
            credential: firebase.credential.cert(cert),
            databaseURL: this.credentials.databaseURL
          
        });
          
        this.db = firebase.database()
        await this.checkTableExists()
    }

    /**
     * Retrieves the previous entry based on the provided key.
     * @param {any} from - The key to start the search from.
     * @returns {Promise<any>} - A Promise that resolves with the previous entry.
     */
    getPrevByNumber = async (from: any): Promise<any> => {
        return await new Promise((resolve, reject) => {
            this.db.ref(this.table).endBefore(from).limitToLast(1).once('value', (snapshot) => {
                if (snapshot.exists()) {
                    resolve(Object.values(snapshot.val())[0]);
                } else {
                    reject('No se encontraron datos previos.');
                }
            }, (error) => {
                reject(error);
            });
        })
    }

    /**
     * Saves data to the Firebase database.
     * @param {Object} ctx - The data to be saved.
     * @returns {Promise<void>} - A Promise that resolves when the data is successfully saved.
     */
    save = async (ctx: {
        ref: string
        keyword: string
        answer: any
        refSerialize: string
        from: string
        options: any
    }): Promise<void> => {
        console.log('Saving data to Firebase:', ctx)
        ctx.options = {
            media: "",
            buttons: [],
            capture: false,
            delay: 0,
            idle: "",
            ref: "",
            nested: [],
            keyword: {},
            callback: true
          }
        
        this.db.ref(this.table).push(ctx, (error) => {

            if (error) {
                throw new Error(error.message)
            }
        })
    }

    /**
     * Creates the specified table in the Firebase database.
     * @returns {Promise<boolean>} - A Promise that resolves.
     */
    createTable = (): Promise<boolean> =>
        new Promise( (resolve, reject) => {
            try {
                this.db.ref(this.table).push({
                        ref: '',
                        keyword: '',
                        answer: '',
                        refSerialize: '',
                        from: '',
                        options: null
                    }, (error) => {
                        reject(error?.message)
                    })
                resolve(true)
            } catch (error) {
                reject(error?.message)
            }
            
        })

    /**
     * Checks if the specified table exists in the Firebase database, and creates it if not.
     * @returns {Promise<any>} - A Promise that resolves
     */
    async checkTableExists(): Promise<any> {
        const ref = await this.db.ref(this.table).get()
        if (!ref.exists()) this.createTable()
        return true
    }
}

export { FirebaseAdapter }
