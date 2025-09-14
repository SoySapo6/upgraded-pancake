const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const axios = require('axios');

const JAVA_DIR = path.join(__dirname, 'java8');
const JAVA_BIN = path.join(JAVA_DIR, 'bin', 'java');
const PAPER_URL = 'https://api.papermc.io/v2/projects/paper/versions/1.8.8/builds/445/downloads/paper-1.8.8-445.jar';
const PORT = 12005;
const JAR = 'paper.jar';
const RAM_LIMIT = '528M';

async function installJava8() {
  if (fs.existsSync(JAVA_BIN)) {
    console.log('✅ Java 8 ya está instalado.');
    return;
  }

  console.log('📦 Descargando Java 8 sin root...');
  const url = 'https://github.com/adoptium/temurin8-binaries/releases/download/jdk8u402-b06/OpenJDK8U-jre_x64_linux_hotspot_8u402b06.tar.gz';

  fs.ensureDirSync(JAVA_DIR);
  execSync(`curl -L ${url} | tar -xz -C ${JAVA_DIR} --strip-components=1`, { stdio: 'inherit' });
  console.log('✅ Java 8 instalado sin root.');
}

async function installPaper188() {
  if (fs.existsSync(JAR)) {
    console.log('✅ Paper 1.8.8 ya descargado.');
    return;
  }

  console.log('🌐 Descargando Paper 1.8.8 build 445...');
  const writer = fs.createWriteStream(JAR);
  const res = await axios.get(PAPER_URL, { responseType: 'stream' });
  res.data.pipe(writer);
  await new Promise(r => writer.on('finish', r));
  console.log('✅ Paper 1.8.8 (build 445) descargado.');
}

function setupFiles() {
  if (!fs.existsSync('eula.txt')) {
    fs.writeFileSync('eula.txt', 'eula=true\n');
  }

  if (!fs.existsSync('server.properties')) {
    fs.writeFileSync('server.properties', `server-port=${PORT}\nmotd=Servidor 1.8.8\n`);
  }

  // ❌ Eliminado: creación de start.sh
}

(async () => {
  try {
    await installJava8();
    await installPaper188();
    setupFiles();
    console.log('✅ Instalación completa. No se ha ejecutado el servidor ni modificado start.sh.');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
})();
