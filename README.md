# Nossa Air

Portal de companhia aerea brasileira com reserva, emissao simulada, area do
cliente, check-in online, stopover, hoteis, milhas, cargas e curadoria de
destinos.

## Como rodar

```bash
npm install
npm run dev
```

## Firebase

O app usa Firebase Auth e Firestore quando as variaveis abaixo existem em
`.env.local`. Copie `.env.example` e preencha com as credenciais do seu projeto:

```bash
cp .env.example .env.local
```

Variaveis esperadas:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Sem `.env.local`, o portal entra em modo local e salva dados no navegador para
testes, sem tela branca.

No console do Firebase, habilite o provedor "Email/senha" em Authentication e
crie um banco Firestore. Se as regras bloquearem escrita/leitura durante o
desenvolvimento, o app usa o modo local como contingencia e registra o aviso no
console do navegador.

Para usar o botao `Entrar com Google` na area do cliente, ative tambem o
provedor `Google` em Authentication e adicione `localhost`/`127.0.0.1` em
`Authorized domains` para testes locais.

## Colecoes Firestore

O dominio esta modelado para estas colecoes:

- `users`
- `airports`
- `flights`
- `fares`
- `reservations`
- `checkIns`
- `cargoQuotes`
- `stopoverRequests`
- `hotelRequests`
- `destinationLeads`

Os dados iniciais de aeroportos, voos e tarifas ficam em `src/data.js`. A funcao
`seedCatalogToFirestore()` em `src/services/nossaAirService.js` pode ser usada
para sincronizar esse catalogo com Firestore quando o projeto Firebase estiver
configurado.

## Scripts

- `npm run dev`: inicia o ambiente de desenvolvimento
- `npm run build`: gera a versao de producao
- `npm run preview`: abre a build localmente
