const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const axios = require('axios');

// Configuración de versiones de Java
const JAVA_VERSIONS = {
  8: {
    name: 'Java 8',
    url: 'https://github.com/adoptium/temurin8-binaries/releases/download/jdk8u402-b06/OpenJDK8U-jre_x64_linux_hotspot_8u402b06.tar.gz',
    dir: 'java8'
  },
  11: {
    name: 'Java 11',
    url: 'https://github.com/adoptium/temurin11-binaries/releases/download/jdk-11.0.21%2B9/OpenJDK11U-jre_x64_linux_hotspot_11.0.21_9.tar.gz',
    dir: 'java11'
  },
  17: {
    name: 'Java 17',
    url: 'https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.9%2B9/OpenJDK17U-jre_x64_linux_hotspot_17.0.9_9.tar.gz',
    dir: 'java17'
  },
  21: {
    name: 'Java 21',
    url: 'https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.1%2B12/OpenJDK21U-jre_x64_linux_hotspot_21.0.1_12.tar.gz',
    dir: 'java21'
  }
};

// Configuración de versiones de PaperMC
const PAPER_VERSIONS = {
  // Java 8 (1.8-1.12)
  '1.8.8': { java: 8, build: 445, url: 'https://api.papermc.io/v2/projects/paper/versions/1.8.8/builds/445/downloads/paper-1.8.8-445.jar' },
  '1.8.9': { java: 8, build: 1, url: 'https://api.papermc.io/v2/projects/paper/versions/1.8.9/builds/1/downloads/paper-1.8.9-1.jar' },
  '1.9.2': { java: 8, build: 924, url: 'https://api.papermc.io/v2/projects/paper/versions/1.9.2/builds/924/downloads/paper-1.9.2-924.jar' },
  '1.9.4': { java: 8, build: 775, url: 'https://api.papermc.io/v2/projects/paper/versions/1.9.4/builds/775/downloads/paper-1.9.4-775.jar' },
  '1.10.2': { java: 8, build: 918, url: 'https://api.papermc.io/v2/projects/paper/versions/1.10.2/builds/918/downloads/paper-1.10.2-918.jar' },
  '1.11.2': { java: 8, build: 1106, url: 'https://api.papermc.io/v2/projects/paper/versions/1.11.2/builds/1106/downloads/paper-1.11.2-1106.jar' },
  '1.12': { java: 8, build: 1620, url: 'https://api.papermc.io/v2/projects/paper/versions/1.12/builds/1620/downloads/paper-1.12-1620.jar' },
  '1.12.1': { java: 8, build: 1222, url: 'https://api.papermc.io/v2/projects/paper/versions/1.12.1/builds/1222/downloads/paper-1.12.1-1222.jar' },
  '1.12.2': { java: 8, build: 1618, url: 'https://api.papermc.io/v2/projects/paper/versions/1.12.2/builds/1618/downloads/paper-1.12.2-1618.jar' },

  // Java 11 (1.13-1.16)
  '1.13': { java: 11, build: 645, url: 'https://api.papermc.io/v2/projects/paper/versions/1.13/builds/645/downloads/paper-1.13-645.jar' },
  '1.13.1': { java: 11, build: 386, url: 'https://api.papermc.io/v2/projects/paper/versions/1.13.1/builds/386/downloads/paper-1.13.1-386.jar' },
  '1.13.2': { java: 11, build: 657, url: 'https://api.papermc.io/v2/projects/paper/versions/1.13.2/builds/657/downloads/paper-1.13.2-657.jar' },
  '1.14.1': { java: 11, build: 50, url: 'https://api.papermc.io/v2/projects/paper/versions/1.14.1/builds/50/downloads/paper-1.14.1-50.jar' },
  '1.14.2': { java: 11, build: 107, url: 'https://api.papermc.io/v2/projects/paper/versions/1.14.2/builds/107/downloads/paper-1.14.2-107.jar' },
  '1.14.3': { java: 11, build: 134, url: 'https://api.papermc.io/v2/projects/paper/versions/1.14.3/builds/134/downloads/paper-1.14.3-134.jar' },
  '1.14.4': { java: 11, build: 245, url: 'https://api.papermc.io/v2/projects/paper/versions/1.14.4/builds/245/downloads/paper-1.14.4-245.jar' },
  '1.15': { java: 11, build: 37, url: 'https://api.papermc.io/v2/projects/paper/versions/1.15/builds/37/downloads/paper-1.15-37.jar' },
  '1.15.1': { java: 11, build: 37, url: 'https://api.papermc.io/v2/projects/paper/versions/1.15.1/builds/37/downloads/paper-1.15.1-37.jar' },
  '1.15.2': { java: 11, build: 393, url: 'https://api.papermc.io/v2/projects/paper/versions/1.15.2/builds/393/downloads/paper-1.15.2-393.jar' },
  '1.16.1': { java: 11, build: 138, url: 'https://api.papermc.io/v2/projects/paper/versions/1.16.1/builds/138/downloads/paper-1.16.1-138.jar' },
  '1.16.2': { java: 11, build: 189, url: 'https://api.papermc.io/v2/projects/paper/versions/1.16.2/builds/189/downloads/paper-1.16.2-189.jar' },
  '1.16.3': { java: 11, build: 253, url: 'https://api.papermc.io/v2/projects/paper/versions/1.16.3/builds/253/downloads/paper-1.16.3-253.jar' },
  '1.16.4': { java: 11, build: 794, url: 'https://api.papermc.io/v2/projects/paper/versions/1.16.4/builds/794/downloads/paper-1.16.4-794.jar' },
  '1.16.5': { java: 11, build: 794, url: 'https://api.papermc.io/v2/projects/paper/versions/1.16.5/builds/794/downloads/paper-1.16.5-794.jar' },

  // Java 17 (1.17-1.20.4)
  '1.17': { java: 17, build: 411, url: 'https://api.papermc.io/v2/projects/paper/versions/1.17/builds/411/downloads/paper-1.17-411.jar' },
  '1.17.1': { java: 17, build: 411, url: 'https://api.papermc.io/v2/projects/paper/versions/1.17.1/builds/411/downloads/paper-1.17.1-411.jar' },
  '1.18': { java: 17, build: 66, url: 'https://api.papermc.io/v2/projects/paper/versions/1.18/builds/66/downloads/paper-1.18-66.jar' },
  '1.18.1': { java: 17, build: 216, url: 'https://api.papermc.io/v2/projects/paper/versions/1.18.1/builds/216/downloads/paper-1.18.1-216.jar' },
  '1.18.2': { java: 17, build: 388, url: 'https://api.papermc.io/v2/projects/paper/versions/1.18.2/builds/388/downloads/paper-1.18.2-388.jar' },
  '1.19': { java: 17, build: 81, url: 'https://api.papermc.io/v2/projects/paper/versions/1.19/builds/81/downloads/paper-1.19-81.jar' },
  '1.19.1': { java: 17, build: 111, url: 'https://api.papermc.io/v2/projects/paper/versions/1.19.1/builds/111/downloads/paper-1.19.1-111.jar' },
  '1.19.2': { java: 17, build: 307, url: 'https://api.papermc.io/v2/projects/paper/versions/1.19.2/builds/307/downloads/paper-1.19.2-307.jar' },
  '1.19.3': { java: 17, build: 448, url: 'https://api.papermc.io/v2/projects/paper/versions/1.19.3/builds/448/downloads/paper-1.19.3-448.jar' },
  '1.19.4': { java: 17, build: 550, url: 'https://api.papermc.io/v2/projects/paper/versions/1.19.4/builds/550/downloads/paper-1.19.4-550.jar' },
  '1.20': { java: 17, build: 17, url: 'https://api.papermc.io/v2/projects/paper/versions/1.20/builds/17/downloads/paper-1.20-17.jar' },
  '1.20.1': { java: 17, build: 196, url: 'https://api.papermc.io/v2/projects/paper/versions/1.20.1/builds/196/downloads/paper-1.20.1-196.jar' },
  '1.20.2': { java: 17, build: 318, url: 'https://api.papermc.io/v2/projects/paper/versions/1.20.2/builds/318/downloads/paper-1.20.2-318.jar' },
  '1.20.3': { java: 17, build: 448, url: 'https://api.papermc.io/v2/projects/paper/versions/1.20.3/builds/448/downloads/paper-1.20.3-448.jar' },
  '1.20.4': { java: 17, build: 497, url: 'https://api.papermc.io/v2/projects/paper/versions/1.20.4/builds/497/downloads/paper-1.20.4-497.jar' },

  // Java 21 (1.20.5+)
  '1.20.5': { java: 21, build: 96, url: 'https://api.papermc.io/v2/projects/paper/versions/1.20.5/builds/96/downloads/paper-1.20.5-96.jar' },
  '1.20.6': { java: 21, build: 148, url: 'https://api.papermc.io/v2/projects/paper/versions/1.20.6/builds/148/downloads/paper-1.20.6-148.jar' },
  '1.21': { java: 21, build: 121, url: 'https://api.papermc.io/v2/projects/paper/versions/1.21/builds/121/downloads/paper-1.21-121.jar' },
  '1.21.1': { java: 21, build: 133, url: 'https://api.papermc.io/v2/projects/paper/versions/1.21.1/builds/133/downloads/paper-1.21.1-133.jar' },
  '1.21.2': { java: 21, build: 54, url: 'https://api.papermc.io/v2/projects/paper/versions/1.21.2/builds/54/downloads/paper-1.21.2-54.jar' },
  '1.21.3': { java: 21, build: 103, url: 'https://api.papermc.io/v2/projects/paper/versions/1.21.3/builds/103/downloads/paper-1.21.3-103.jar' }
};

const PORT = 25565;
const RAM_LIMIT = '2G';

async function installJava(version) {
  const javaConfig = JAVA_VERSIONS[version];
  const javaDir = path.join(__dirname, javaConfig.dir);
  const javaBin = path.join(javaDir, 'bin', 'java');

  if (fs.existsSync(javaBin)) {
    console.log(`✅ ${javaConfig.name} ya está instalado.`);
    return javaBin;
  }

  console.log(`📦 Descargando ${javaConfig.name}...`);
  fs.ensureDirSync(javaDir);
  
  try {
    execSync(`curl -L ${javaConfig.url} | tar -xz -C ${javaDir} --strip-components=1`, { 
      stdio: 'inherit',
      timeout: 300000 // 5 minutos timeout
    });
    console.log(`✅ ${javaConfig.name} instalado correctamente.`);
    return javaBin;
  } catch (error) {
    console.error(`❌ Error instalando ${javaConfig.name}:`, error.message);
    throw error;
  }
}

async function downloadPaper(version) {
  const paperConfig = PAPER_VERSIONS[version];
  if (!paperConfig) {
    throw new Error(`❌ Versión ${version} no soportada. Versiones disponibles: ${Object.keys(PAPER_VERSIONS).join(', ')}`);
  }

  const jarName = `paper-${version}.jar`;
  
  if (fs.existsSync(jarName)) {
    console.log(`✅ Paper ${version} ya descargado.`);
    return jarName;
  }

  console.log(`🌐 Descargando Paper ${version} (build ${paperConfig.build})...`);
  
  try {
    const writer = fs.createWriteStream(jarName);
    const response = await axios.get(paperConfig.url, { 
      responseType: 'stream',
      timeout: 300000 // 5 minutos timeout
    });
    
    response.data.pipe(writer);
    
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
    
    console.log(`✅ Paper ${version} (build ${paperConfig.build}) descargado.`);
    return jarName;
  } catch (error) {
    console.error(`❌ Error descargando Paper ${version}:`, error.message);
    throw error;
  }
}

function setupServerFiles(version, jarName) {
  // EULA
  if (!fs.existsSync('eula.txt')) {
    fs.writeFileSync('eula.txt', 'eula=true\n');
    console.log('📄 eula.txt creado.');
  }

  // Server properties
  if (!fs.existsSync('server.properties')) {
    const properties = [
      `server-port=${PORT}`,
      `motd=Servidor Minecraft ${version}`,
      'online-mode=false',
      'difficulty=normal',
      'gamemode=survival',
      'max-players=20',
      'view-distance=10',
      'spawn-protection=16'
    ].join('\n') + '\n';
    
    fs.writeFileSync('server.properties', properties);
    console.log('⚙️ server.properties creado.');
  }

  console.log('✅ Archivos de configuración listos.');
}

async function main() {
  try {
    // Obtener versión de variable de entorno
    const version = process.env.version || process.env.VERSION;
    
    if (!version) {
      console.error('❌ Error: Debes especificar la versión usando la variable de entorno "version"');
      console.log('📋 Ejemplo: VERSION=1.21.3 node installer.js');
      console.log(`📋 Versiones disponibles: ${Object.keys(PAPER_VERSIONS).join(', ')}`);
      process.exit(1);
    }

    const paperConfig = PAPER_VERSIONS[version];
    if (!paperConfig) {
      console.error(`❌ Versión ${version} no soportada.`);
      console.log(`📋 Versiones disponibles: ${Object.keys(PAPER_VERSIONS).join(', ')}`);
      process.exit(1);
    }

    console.log(`🎯 Instalando servidor Minecraft ${version}...`);
    console.log(`☕ Requiere Java ${paperConfig.java}`);

    // Instalar Java requerido
    const javaBin = await installJava(paperConfig.java);
    
    // Descargar Paper
    const jarName = await downloadPaper(version);
    
    // Configurar archivos
    setupServerFiles(version, jarName);
    
    console.log('\n🎉 ¡Instalación completada!');
    console.log(`📦 Servidor: ${jarName}`);
    console.log(`☕ Java: ${javaBin}`);
    console.log(`🎮 Versión: ${version}`);
    console.log(`🔌 Puerto: ${PORT}`);
    
    if (fs.existsSync('start.sh')) {
      console.log('🚀 Usa ./start.sh para iniciar el servidor');
    } else {
      console.log(`🚀 Comando para iniciar: ${javaBin} -Xmx${RAM_LIMIT} -Xms${RAM_LIMIT} -jar ${jarName} --port ${PORT} nogui`);
    }

  } catch (error) {
    console.error('💥 Error durante la instalación:', error.message);
    process.exit(1);
  }
}

// Ejecutar instalador
main();
