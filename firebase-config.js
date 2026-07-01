// ============================================================
// CONFIGURAÇÃO DO FIREBASE
// ============================================================
// 1. Acesse https://console.firebase.google.com
// 2. Crie um projeto novo (ex: "ponto-facil-lojas")
// 3. Ative no menu lateral: Firestore Database + Authentication (método Email/Senha)
// 4. Em "Configurações do projeto" > "Seus apps" > crie um app Web (</>)
// 5. Copie o objeto firebaseConfig que aparece e cole substituindo abaixo
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyAjiYIkencjTuQ3axyXbMhytAgVNyLXcyY",
  authDomain: "ponto-eletronico-c3f73.firebaseapp.com",
  projectId: "ponto-eletronico-c3f73",
  storageBucket: "ponto-eletronico-c3f73.firebasestorage.app",
  messagingSenderId: "633055918343",
  appId: "1:633055918343:web:311bc8ae80acf806d46da2"
};

// Inicializa (usando SDK compat, carregado via <script> nas páginas html)
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
