# recursive-require

Este pacote lê recursivamente uma estrutura de diretórios e importa arquivos `.js`, montando um objeto dinâmico. Agora suporta modos opcionais de validação para maior segurança.

## Modos de uso

### 1. Sem validação (padrão)
```js
const loadTree = require('recursive-require');
const tree = loadTree('/caminho/base');
```

### 2. Com manifest de checksums
Gere o manifest:
```bash
node scripts/generate-manifest.js /caminho/base manifest.json
```
Use:
```js
const manifest = require('./manifest.json');
const tree = loadTree('/caminho/base', { mode: 'manifest-checksum', manifest });
```

### 3. Com manifest assinado digitalmente (Ed25519)
Gere par de chaves:
```bash
openssl genpkey -algorithm ed25519 -out ed25519.key
openssl pkey -in ed25519.key -pubout -out ed25519.pub
```
Assine o manifest:
```bash
openssl pkeyutl -sign -inkey ed25519.key -in manifest.json -out manifest.sig
```
Use:
```js
const manifest = require('./manifest.json');
const signature = fs.readFileSync('./manifest.sig');
const publicKey = fs.readFileSync('./ed25519.pub');
const tree = loadTree('/caminho/base', {
  mode: 'signed-manifest',
  manifest,
  signature,
  publicKey
});
```

## Scripts npm com argumentos dinâmicos

Os scripts padrões delegam para os arquivos em `scripts/` e aceitam argumentos passados após `--`.

- Gerar manifest (dinâmico):
```bash
npm run stripc:create-manifest -- ./tests/fixtures ./manifest.json
```

- Assinar manifest (dinâmico):
```bash
npm run stripc:sign-manifest -- ./ed25519.key ./manifest.json ./manifest.sig
```

- Helper que gera e assina (script auxiliar):
```bash
npm run stripc:generate-and-sign -- ./tests/fixtures ./manifest.json ./ed25519.key ./manifest.sig
```

O script `generate-and-sign` executa a geração do manifest e, em seguida, chama o wrapper de assinatura.

## Testes
Execute:
```bash
npm test
```

## Observações
- O modo padrão não faz validação de integridade.
- O modo `manifest-checksum` depende da integridade do manifest.
- O modo `signed-manifest` garante que o manifest não foi alterado, desde que a chave pública seja confiável.
- Scripts para geração de manifest e exemplos incluídos em `scripts/`.
