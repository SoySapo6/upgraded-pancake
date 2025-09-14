const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const axios = require('axios');

const MC_VERSION = process.env.version; // ← variable de entorno
if (!MC_VERSION) {
  console.error('❌ Debes definir la variable de entorno "version", ej: export version=1.20.6');
  process.exit(1);
}

const JAVA_DIR = path.join(__dirname, 'java');
const JAVA_BIN = path.join(JAVA_DIR, 'bin', 'java');
const PAPER_API = 'https://api.papermc.io/v2/projects/paper';
const JAR = 'paper.jar';
const PORT = 12005;

// ─────────────────────────────────────────────────────────────
// 1️⃣ Tabla simple: versión de Minecraft → Java recomendado
// (basada en la documentación oficial de Paper/Spigot/Mojang)
// ─────────────────────────────────────────────────────────────
function javaFor(mc) {
  const v = mc.split('.').slice(0,2).join('.'); // ej "1.20"
  const [maj, min] = v.split('.').map(Number);
  if (maj === 1 && min <= 8)  return { name: '8',  url: 'https://github.com/adoptium/temurin8-binaries/releases/download/jdk8u402-b06/OpenJDK8U-jre_x64_linux_hotspot_8u402b06.tar.gz' };
  if (maj === 1 && min <= 16) return { name: '11', url: 'https://github.com/adoptium/temurin11-binaries/releases/download/jdk-11.0.24+8/OpenJDK11U-jre_x64_linux_hotspot_11.0.24_8.tar.gz' };
  if (maj === 1 && min <= 17) return { name: '16', url: 'https://github.com/adoptium/temurin16-binaries/releases/download/jdk-16.0.2+7/OpenJDK16U-jre_x64_linux_hotspot_16.0.2_7.tar.gz' };
  if (maj === 1 && min <= 18) return { name: '17', url: 'https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.12+7/OpenJDK17U-jre_x64_linux_hotspot_17.0.12_7.tar.gz' };
  // 1.19+ se recomienda Java 17 o superior
  return { name: '17', url: 'https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.12+7/OpenJDK17U-jre_x64_linux_hotspot_17.0.12_7.tar.gz' };
}

// ─────────────────────────────────────────────────────────────
// 2️⃣ Instalación de Java si no existe
// ─────────────────────────────────────────────────────────────
async function installJava() {
  if (fs.existsSync(JAVA_BIN)) {
    console.log(`✅ Java ya está instalado.`);
    return;
  }
  const { name, url } = javaFor(MC_VERSION);
  console.log(`📦 Descargando Java ${name} para Minecraft ${MC_VERSION}...`);
  fs.ensureDirSync(JAVA_DIR);
  execSync(`curl -L ${url} | tar -xz -C ${JAVA_DIR} --strip-components=1`, { stdio: 'inherit' });
  console.log(`✅ Java ${name} instalado sin root.`);
}

// ─────────────────────────────────────────────────────────────
// 3️⃣ Descargar el último build de Paper para la versión elegida
// ─────────────────────────────────────────────────────────────
async function installPaper() {
  if (fs.existsSync(JAR)) {
    console.log('✅ Paper ya descargado.');
    return;
  }
  console.log(`🌐 Buscando build más reciente para Paper ${MC_VERSION}...`);
  const { data: builds } = await axios.get(`${PAPER_API}/versions/${MC_VERSION}`);
  const lastBuild = builds.builds[builds.builds.length - 1];
  const fileName = `paper-${MC_VERSION}-${lastBuild}.jar`;
  const downloadUrl = `${PAPER_API}/versions/${MC_VERSION}/builds/${lastBuild}/downloads/${fileName}`;
  console.log(`📥 Descargando Paper build ${lastBuild}...`);
  const writer = fs.createWriteStream(JAR);
  const res = await axios.get(downloadUrl, { responseType: 'stream' });
  res.data.pipe(writer);
  await new Promise(r => writer.on('finish', r));
  console.log(`✅ Paper ${MC_VERSION} (build ${lastBuild}) descargado.`);
}

// ─────────────────────────────────────────────────────────────
// 4️⃣ Archivos básicos
// ─────────────────────────────────────────────────────────────
function setupFiles() {
  if (!fs.existsSync('eula.txt')) {
    fs.writeFileSync('eula.txt', 'eula=true\n');
  }
  if (!fs.existsSync('server.properties')) {
    fs.writeFileSync('server.properties', `server-port=${PORT}\nmotd=Servidor ${MC_VERSION}\n`);
  }
  // ❗ No tocamos start.sh ni ejecutamos el servidor
}

// ─────────────────────────────────────────────────────────────
// 5️⃣ Proceso principal
// ─────────────────────────────────────────────────────────────
(async () => {
  try {
    await installJava();
    await installPaper();
    setupFiles();
    console.log(`🎉 Instalación completa para Minecraft ${MC_VERSION}`);
    console.log('➡️  Ahora puedes iniciar tu servidor manualmente con tu propio start.sh');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
})();
