<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Verificar Estudiante</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding-top">
      <ion-list>
        <ion-item class="ion-padding-bottom">
          <ion-input v-model="alumno.codigo" label="Codigo" label-placement="floating" placeholder="Ingrese Codigo" @keyup.enter="buscarEquiposAlumno"></ion-input>
          <ion-button slot="end" @click="abrirCamara">
            <ion-icon
              slot="icon-only"
              :icon="cameraOutline"
            ></ion-icon>
          </ion-button>
          <ion-button slot="end" @click="closeCamara">
            <ion-icon
              slot="icon-only"
              :icon="closeOutline"
            ></ion-icon>
          </ion-button>
          <ion-button slot="end">
            <ion-icon
              slot="icon-only"
              :icon="addOutline"
            ></ion-icon>
          </ion-button>
        </ion-item>
        <ion-item v-if="isCameraOpen">
          <ion-row class="ion-align-items-center ion-justify-content-center">
            <ion-col size="12">
              <video ref="cameraRef" autoplay style="width: 100%;"></video>
            </ion-col>
          </ion-row>
        </ion-item>
        <ion-title class="ion-padding-bottom"> Equipos Disponibles </ion-title>
        <ion-item lines="none">
          <ion-label>
            <ion-row class="ion-align-items-center ion-justify-content-center">
              <ion-col size="3">Tipo</ion-col>
              <ion-col size="3">Marca</ion-col>
              <ion-col size="2">Color</ion-col>
              <ion-col size="2">Lector</ion-col>
              <ion-col size="2">Ing</ion-col>
            </ion-row>
          </ion-label>
        </ion-item>
        <ion-item v-for="item in equipos" :key="item.id">
          <ion-label>
            <ion-row class="ion-align-items-center ion-justify-content-center">
              <ion-col size="3">{{ item.idTipo.descripcion }}</ion-col>
              <ion-col size="3">{{ item.marca }}</ion-col>
              <ion-col size="2">{{ item.color }}</ion-col>
              <ion-col size="2">
                <ion-button fill="clear" @click="agregarEquipo(item.id)">
                  <ion-icon
                    slot="icon-only"
                    :icon="layersOutline"
                  ></ion-icon>
                </ion-button>
              </ion-col>
              <ion-col size="2">
                <ion-icon v-if="item.ingresoEquipo"
                  :icon="checkmarkOutline"
                ></ion-icon>
                <ion-icon v-if="!item.ingresoEquipo"
                  :icon="closeOutline"
                ></ion-icon>
              </ion-col>
            </ion-row>
          </ion-label>
        </ion-item>
      </ion-list>
      <ion-item class="ion-padding-bottom">
        <ion-button slot="end" @click="guardarVisita">
          <ion-icon
            slot="icon-only"
            :icon="saveOutline"
          ></ion-icon>
        </ion-button>
      </ion-item>
    </ion-content>
    <!-- <ion-content>
      <input type="file" @change="handleImageUpload" accept="image/*">
        <div v-if="faceDetected">Cara detectada</div>
        <canvas ref="canvasRef"></canvas>
        <div v-if="comparisonResult">
          <p>Resultado de la comparación: {{ comparisonResult }}</p>
        </div>
    </ion-content> -->
  </ion-page>
</template>
<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonList, 
  IonButton, IonIcon, IonLabel, IonRow, IonCol, loadingController } from '@ionic/vue';
import { cameraOutline, addOutline, layersOutline, checkmarkOutline,closeOutline, saveOutline } from 'ionicons/icons';
import { getFirestore, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { ref as storageRef, getDownloadURL } from 'firebase/storage';
import { ref, onMounted } from 'vue';
import { db } from '../firebase'
import { storage } from '../firebase';
import * as faceapi from 'face-api.js';

// const db = getFirestore(firebaseApp)

const capturedPhoto:any = ref('');
const photoFirebase:any = ref('');
const isCameraOpen = ref(false);
const cameraRef = ref(null);
const comparisonResult = ref('');
const equipos: any = ref(null);
window.addEventListener('keydown', handleKeyDown);

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    takePhoto();
  }
}
const agregarEquipo = async(id:any) => {
  for (let i = 0; i < equipos.value.length; i++) {
    if (equipos.value[i].id == id) {
      equipos.value[i].ingresoEquipo = true
      return
    }
  }
}
const comparacionRostro = async() => {
  // const imageRef = storageRef(storage, `fotos/${alumno.value.codigo}.jpg`);
  // const imageUrl = await getDownloadURL(imageRef);
  const imgElement = new Image();
  if (alumno.value.codigo == '185055b') imgElement.src = '../../public/Foto.jpg';
  if (alumno.value.codigo == '171695d') imgElement.src = '../../public/Foto_Padilla.jpeg';
  if (alumno.value.codigo == '171682j') imgElement.src = '../../public/Foto_Cristina.jpeg';
  // if (alumno.value.codigo == '185055b') imgElement.src = '../../public/Foto.jpg';
  imgElement.onload = async () => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = imgElement.width;
    canvas.height = imgElement.height;
    context.drawImage(imgElement, 0, 0, canvas.width, canvas.height);
    const faceDetections = await faceapi.detectSingleFace(canvas);
    if (faceDetections) {
      const faceDescriptor = await faceapi.computeFaceDescriptor(canvas, [faceDetections]);
      photoFirebase.value = faceDescriptor
      const faceMatcher = new faceapi.FaceMatcher([photoFirebase.value]); // Crea un FaceMatcher con la descripción de la cara a comparar
      const capturedDescriptor = new Float32Array(capturedPhoto.value.descriptor); // Convierte la descripción capturada a un formato comparable
      const match = faceMatcher.findBestMatch(capturedDescriptor); // Encuentra la mejor coincidencia
      if (match.distance > 0.4) {
        //cambiar
        if (imgElement.src == 'http://localhost:8100/public/Foto.jpg') {
          console.log(match.distance);
          await buscarEquiposAlumno('185055b')
        }
        if (imgElement.src == 'http://localhost:8100/public/Foto_Padilla.jpeg') {
          console.log(match.distance);
          await buscarEquiposAlumno('171695d')
        }
        if (imgElement.src == 'http://localhost:8100/public/Foto_Cristina.jpeg') {
          console.log(match.distance);
          await buscarEquiposAlumno('171682j')
        }
      } else {
        console.log("No se encontro la coincidencia esperada");
      }
      comparisonResult.value = match.toString(); // Almacena el resultado de la comparación en la variable
    } else {
      console.log('No se detecto ningun rostro en la imagen de storage');
    }
  };
  
}
const guardarVisita = async() => {
  const loading = await loadingController.create({
    message: "Procesando...",
    spinner: "circles",
  });
  await loading.present();
  const fechaActual = new Date();
  const dia = fechaActual.getDate();
  const mes = fechaActual.getMonth() + 1;
  const año = fechaActual.getFullYear();
  const fechaFormateada = `${dia}/${mes}/${año}`;
  const nuevoDocVisita= {
    estado: 1,
    fechaVisita: fechaFormateada,
    motivo: 'Ingreso de Alumno',
    nroDocumento: '',
    codigo: alumno.value.codigo
  }
  const visitaCollection = collection(db, 'Visita');
  const docRef = await addDoc(visitaCollection, nuevoDocVisita)
  const idVisita = docRef.id
  const horaActual = new Date();
  const hora = horaActual.getHours();
  const minutos = horaActual.getMinutes();
  const segundos = horaActual.getSeconds();
  const horaFormateada = `${hora}:${minutos}:${segundos}`;
  const equiposIngresar = equipos.value.filter((equipo:any)=>equipo.ingresoEquipo == true)
  const nuevoDocDetalleVisita= {
    estado: 1,
    horaIngreso: horaFormateada,
    horaSalida: '',
    idVisita: idVisita,
    lugar: 'Ingreso de Alumno',
    idInsitucion: 'BMQlnDxUwBfUFbmMH2rM',
    equipos: equiposIngresar
  }
  const detalleVisiataCollection = collection(db, 'DetalleVisita');
  await addDoc(detalleVisiataCollection, nuevoDocDetalleVisita);
  await loading.dismiss();
}
const takePhoto = async () => {
  if (isCameraOpen.value && cameraRef.value) {
    const canvas = document.createElement('canvas');
    canvas.width = cameraRef.value.videoWidth;
    canvas.height = cameraRef.value.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(cameraRef.value, 0, 0, canvas.width, canvas.height);
    const photoDataUrl = canvas.toDataURL('image/jpeg');
    const faceDetection:any = await faceapi.detectSingleFace(canvas);
    if (faceDetection) {
      const faceDescriptor = await faceapi.computeFaceDescriptor(canvas, [faceDetection]);
      capturedPhoto.value = {
        photo: photoDataUrl,
        descriptor: faceDescriptor
      };
      await comparacionRostro()
      closeCamara();
    } else {
      console.log('No se detecto ningun rostro');
    }
  }
};

const alumno: any = ref({
  codigo: ''
})

const buscarEquiposAlumno = async(codigo='') => {
  let q = null;
  if (codigo =='') {
    q = query(collection(db, 'Equipo'), where('codigo', '==', alumno.value.codigo), where('estado','==',1));
  } else {
    q = query(collection(db, 'Equipo'), where('codigo', '==', codigo), where('estado','==',1));
  }
  try {
    const loading = await loadingController.create({
      message: 'Cargando Información',
    });

    await loading.present();
    const querySnapshot = await getDocs(q);
    const arrayEquipos = [];
    if (!querySnapshot.empty) {
      for (let i = 0; i < querySnapshot.docs.length; i++) {
        const element = querySnapshot.docs[i].data();
        arrayEquipos.push({
          id: querySnapshot.docs[i].id,
          ingresoEquipo: false,
          ...element
        })
      }
      equipos.value = arrayEquipos;
      await loading.dismiss();
    } else {
      equipos.value = null;
      console.log('Estudiante no encontrado.');
    }
  } catch (error) {
    console.error('Error al buscar estudiante:', error);
  }
}

const abrirCamara = async () => {
  try {
    isCameraOpen.value = true
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    cameraRef.value.srcObject = stream;
  } catch (error) {
    console.error('Error al acceder a la cámara: ', error);
  }
};

const closeCamara = () => {
  if (cameraRef.value && cameraRef.value.srcObject) {
    const tracks = cameraRef.value.srcObject.getTracks();
    tracks.forEach(track => track.stop());
  }
  isCameraOpen.value = false
};

onMounted(() => {
  faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
  faceapi.nets.faceLandmark68Net.loadFromUri('/models');
  faceapi.nets.faceRecognitionNet.loadFromUri('/models');
});
</script>

<style>
.centerItem {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
