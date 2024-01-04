
const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');
const express = require('express');


const app = express();
const http = require('http').Server(app);


const SCOPES = [  
  'https://www.googleapis.com/auth/forms',
  'https://www.googleapis.com/auth/drive'
];

const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');


// async function loadSavedCredentialsIfExist() {
//     try {
//       const content = await fs.readFile(TOKEN_PATH);
//       const credentials = JSON.parse(content);
//       return google.auth.fromJSON(credentials);
//     } catch (err) {
//       return null;
//     }
//   }
  

  // async function saveCredentials(client) {
  //   const content = await fs.readFile(CREDENTIALS_PATH);
  //   const keys = JSON.parse(content);
  //   const key = keys.installed || keys.web;
  //   const payload = JSON.stringify({
  //     type: 'authorized_user',
  //     client_id: key.client_id,
  //     client_secret: key.client_secret,
  //     refresh_token: client.credentials.refresh_token,
  //   });
  //   await fs.writeFile(TOKEN_PATH, payload);
  // }
  

  async function authorize() {
    client = await authenticate({
      scopes: SCOPES,
      keyfilePath: CREDENTIALS_PATH,
    });
    // if (client.credentials) {
    //   await saveCredentials(client);
    // }
    return client;
  }

http.listen(5500, (err) => {
    if (err) {
        console.log(err);
    }
    console.log('Listening to http://localhost:' + 5500);
})

app.get('/', (request, response) => {
    response.status(200).send('Server is working');
})

app.get('/fetch/:form_id', (request, response) => {
    const formId = request.params.form_id; 
    console.log(formId)
    authorize().then((auth) => {
      getFormData(auth, formId).then((data) => {
            response.status(200).json(data);
        })
    }).catch((err) => {
        console.log(err)
        response.status(500).json(err);
    })
  })
  
  async function getFormData(auth, formId) {

    const formsService = google.forms({
        version: 'v1',
        auth: auth,
    });
    const response = await formsService.forms.get({
        formId : formId,
    });
    console.log(response.data);
    return response.data
}



