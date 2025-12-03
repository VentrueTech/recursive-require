/* 
  Este código exporta uma função que lê recursivamente o conteúdo de um diretório base e 
  retorna um objeto com os arquivos organizados por propriedades correspondentes aos nomes dos diretórios.
 */

// Import the fs and path modules
const fs = require('fs');
const path = require('path');

// Exporta função principal, agora aceita basePath e options
module.exports = (basePath, options = {}) => {
  // Define modo de operação
  const mode = options.mode || 'none';
  // Define regular expressions to match the directory and folder name patterns
  const directoryPattern = new RegExp(`${basePath}/?`);
  const folderNamePattern = new RegExp('.*/([^/]+)/?$');
  // Create an object to store the result
  const result = {};

  // Define a recursive function to read the contents of a directory
  function recursive(dir = basePath) {
    // Read the contents of the directory
    fs.readdirSync(dir).forEach((file) => {
      const fullDir = path.join(dir, file);
      const statsObj = fs.statSync(fullDir);
      if (statsObj.isDirectory()) return recursive(fullDir);
      const propName =
        basePath !== dir ? dir.replace(directoryPattern, '') : dir.replace(folderNamePattern, '$1');

      // --- Modos de validação ---
      if (mode === 'none') {
        // Legacy: importa sem validação
        result[propName] = {
          ...result[propName],
          ...{
            [file.replace(/(.*)(\..*)/, '$1')]: require(fullDir),
          },
        };
        return null;
      }
      if (mode === 'manifest-checksum' || mode === 'signed-manifest') {
        // Valida manifest e checksums
        const manifest = options.manifest;
        if (!manifest || !manifest.files) {
          throw new Error('Manifest inválido ou ausente para modo manifest-checksum/signed-manifest');
        }
        // Se modo signed-manifest, valida assinatura do manifest
        if (mode === 'signed-manifest') {
          const signature = options.signature;
          const publicKey = options.publicKey;
          if (!signature || !publicKey) {
            throw new Error('Assinatura ou chave pública ausente para modo signed-manifest');
          }
          // Valida assinatura Ed25519 do manifest
          const crypto = require('crypto');
          const manifestBuffer = Buffer.from(JSON.stringify(manifest));
          const isValid = crypto.verify(
            null,
            manifestBuffer,
            {
              key: publicKey,
              format: 'pem',
            },
            signature
          );
          if (!isValid) {
            throw new Error('Assinatura do manifest inválida');
          }
        }
        // Valida checksum do arquivo
        const rel = path.relative(basePath, fullDir).split(path.sep).join('/');
        const expectedHash = manifest.files[rel];
        if (!expectedHash) {
          throw new Error(`Checksum ausente no manifest para ${rel}`);
        }
        const data = fs.readFileSync(fullDir);
        const actualHash = require('crypto').createHash('sha256').update(data).digest('hex');
        if (actualHash !== expectedHash) {
          throw new Error(`Checksum inválido para ${rel}`);
        }
        result[propName] = {
          ...result[propName],
          ...{
            [file.replace(/(.*)(\..*)/, '$1')]: require(fullDir),
          },
        };
        return null;
      }
      // Outros modos: lógica de validação será implementada depois
      throw new Error(`Modo de validação '${mode}' não implementado ainda.`);
    });
  }
  // Call the recursive function with the basePath
  recursive(basePath);
   
  const rootName = basePath.replace(folderNamePattern, '$1');
  // Merge root directory files into the top-level object
  const rootObj =  {...result.hasOwnProperty(rootName) ? result[rootName] : {}};
  // Remove the root directory property from the result
  delete result[rootName];
  // Return the final result object
  const xpto = { ...rootObj, ...result };
  return { ...rootObj, ...result };
 };
