import { collection, query, where, getDocs, setDoc, addDoc, doc } from "firebase/firestore";
import db from "../../lib/firebase";

class Usuario {
    nombres: string
    apellidos: string
    numDoc: string
    telefono: string
    email: string
    empresaId: string
    id: string


getUsuario = async (dni: string, empresaId: string)=>{
    console.log('getUsuario ', dni, empresaId)
    const q = query(collection(db, "pacientes"), where("numDoc", "==", dni), where("empresaId", "==", empresaId))

    const querySnapshot = await getDocs(q);
    
    querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    this.nombres = doc.data().nombres
    this.apellidos = doc.data().apellidos   
    this.numDoc = doc.data().numDoc
    this.telefono = doc.data().telefono
    this.email = doc.data().email
    this.empresaId = doc.data().empresaId
    this.id = doc.id
    console.log(doc.id, " => ", doc.data());
    });
    return this 
}


 getUsuarioByPhone = async (telefono: string, empresaId: string)=>{
    const q = query(collection(db, "pacientes"), where("telefono", "==", telefono), where("empresaId", "==", empresaId))

    const querySnapshot = await getDocs(q);
    console.log('getUsuarioByPhone ', telefono, empresaId)
    querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
        this.nombres = doc.data().nombres
        this.apellidos = doc.data().apellidos   
        this.numDoc = doc.data().numDoc
        this.telefono = doc.data().telefono
        this.email = doc.data().email
        this.empresaId = doc.data().empresaId
        this.id = doc.id
    });
    return this 
}

addUsuario = async (usuario: Usuario)=> {

    const docRef = doc(collection(db, "pacientes"))
    this.id = docRef.id
    console.log('addUsuario ', usuario)
    await setDoc(docRef, usuario)
}
}


export default Usuario ;