import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

//Firebase

const firebaseConfig = {
  apiKey: 'AIzaSyDbvKOfCz7DUp6P9VuSlTNPZvoJ-mHm3SI',
  authDomain: 'proyecttpi.firebaseapp.com',
  projectId: 'proyecttpi',
  storageBucket: 'proyecttpi.appspot.com',
  messagingSenderId: '402297753912',
  appId: '1:402297753912:web:b6dff2a5d6b8c8d9fe31cd',
};

const firebaseApp = initializeApp(firebaseConfig)
const db = getFirestore(firebaseApp)
const storage = getStorage(firebaseApp)

export{
  db,
  storage
}

