/* 
  Este código exporta uma função que lê recursivamente o conteúdo de um diretório base e 
  retorna um objeto com os arquivos organizados por propriedades correspondentes aos nomes dos diretórios.
 */

// Import the fs and path modules
const fs = require('fs');
const path = require('path');

// Export a function that takes a basePath as a parameter
module.exports = (basePath) => {
  // Define regular expressions to match the directory and folder name patterns
  const directoryPattern = new RegExp(`${basePath}/?`);
  const folderNamePattern = new RegExp('.*/([^/]+)/?$');
  // Create an object to store the result
  const result = {};

  // Define a recursive function to read the contents of a directory
  function recursive(dir = basePath) {
    // Read the contents of the directory
    fs.readdirSync(dir).forEach((file) => {
      // Join the directory and file name to get the full path
      const fullDir = path.join(dir, file);
      // Get the stats object for the file or directory
      const statsObj = fs.statSync(fullDir);
      // If the item is a directory, call the recursive function with the full path
      if (statsObj.isDirectory()) return recursive(fullDir);
      // Get the property name by replacing the directory pattern or folder name pattern in the directory path
      const propName =
        basePath !== dir ? dir.replace(directoryPattern, '') : dir.replace(folderNamePattern, '$1');
      // Add the file to the result object under the appropriate property name
      result[propName] = {
        ...result[propName],
        ...{
          [file.replace(/(.*)(\..*)/, '$1')]: require(fullDir),
        },
      };

      return null;
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
