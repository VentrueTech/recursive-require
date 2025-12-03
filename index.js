/*
  This module exports a function that recursively reads the contents of a base directory
  and returns an object with files organized as properties corresponding to directory names.
*/

// Import the fs and path modules
const fs = require('fs');
const path = require('path');

// Export main function, now accepts basePath and options
module.exports = (basePath, options = {}) => {
  // Set operation mode
  const mode = options.mode || 'none';
  // Define regular expressions to match the directory and folder name patterns
  const directoryPattern = new RegExp(`${basePath}/?`);
  const folderNamePattern = new RegExp('.*/([^/]+)/?$');
  // Create an object to store the result
  const result = {};

  // Define a recursive function to read the contents of a directory
  function recursive(dir) {
    if (typeof dir === 'undefined') dir = basePath;
    // Read the contents of the directory
    fs.readdirSync(dir).forEach((file) => {
      const fullDir = path.join(dir, file);
      const statsObj = fs.statSync(fullDir);
      if (statsObj.isDirectory()) return recursive(fullDir);
      const propName =
        basePath !== dir ? dir.replace(directoryPattern, '') : dir.replace(folderNamePattern, '$1');

      // --- Validation modes ---
      if (mode === 'none') {
        // Legacy: import without validation
        result[propName] = {
          ...result[propName],
          ...{
            [file.replace(/(.*)(\..*)/, '$1')]: require(fullDir),
          },
        };
        return null;
      }
      if (mode === 'manifest-checksum' || mode === 'signed-manifest') {
        // Validate manifest and checksums
        const manifest = options.manifest;
        if (!manifest || !manifest.files) {
          throw new Error('Manifest inválido ou ausente para modo manifest-checksum/signed-manifest');
        }
        // If mode is 'signed-manifest', validate manifest signature
        if (mode === 'signed-manifest') {
          const signature = options.signature;
          const publicKey = options.publicKey;
          if (!signature || !publicKey) {
            throw new Error('Assinatura ou chave pública ausente para modo signed-manifest');
          }
          // Validate manifest Ed25519 signature
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
        // Validate file checksum
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
      // Other modes: validation logic to be implemented later
      throw new Error(`Modo de validação '${mode}' não implementado ainda.`);
    });
  }
  // Call the recursive function with no argument so the function's internal defaulting runs
  recursive();
   
    const rootName = basePath.replace(folderNamePattern, '$1');
    // Merge root directory files into the top-level object
    let rootObj;
    if (result.hasOwnProperty(rootName)) {
      rootObj = { ...result[rootName] };
    } else {
      rootObj = {};
    }
  // Remove the root directory property from the result
  delete result[rootName];
  // Return the final result object
  return { ...rootObj, ...result };
 };
