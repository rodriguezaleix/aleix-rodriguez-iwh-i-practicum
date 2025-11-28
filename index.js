require('dotenv').config(); // Carga las variables del archivo .env
const express = require('express');
const axios = require('axios');
const app = express();

app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ***************************************************************
// TUS PROPIEDADES (Nombres internos)
// ***************************************************************
const PROP_NAME = 'dealname'; // En Negocios, el nombre es 'dealname'
const PROP_1 = 'my_custom_prop_1'; 
const PROP_2 = 'custom_prop_2'; 
// ***************************************************************

const PRIVATE_APP_TOKEN = process.env.PRIVATE_APP_TOKEN;

// RUTA 1: Página de Inicio (GET /)
// Muestra la tabla con los negocios
app.get('/', async (req, res) => {
    const dealsEndpoint = 'https://api.hubapi.com/crm/v3/objects/deals';
    
    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_TOKEN}`,
        'Content-Type': 'application/json'
    };
    
    // Pedimos a HubSpot el nombre y tus dos propiedades
    const params = {
        properties: `${PROP_NAME},${PROP_1},${PROP_2}`,
        limit: 100
    };

    try {
        const resp = await axios.get(dealsEndpoint, { headers, params });
        // Pasamos los datos a la plantilla 'homepage'
        res.render('homepage', { 
            title: 'Lista de Negocios | Practicum', 
            data: resp.data.results,
            props: { name: PROP_NAME, p1: PROP_1, p2: PROP_2 } // Pasamos los nombres para usarlos en la vista
        });
    } catch (error) {
        console.error(error);
        res.render('error', { title: 'Error de conexión' });
    }
});

// RUTA 2: Mostrar Formulario (GET /update-cobj)
app.get('/update-cobj', (req, res) => {
    res.render('updates', { 
        title: 'Update Custom Object Form | Integrating With HubSpot I Practicum',
        props: { p1: PROP_1, p2: PROP_2 }
    });
});

// RUTA 3: Crear Negocio (POST /update-cobj)
app.post('/update-cobj', async (req, res) => {
    const createDealEndpoint = 'https://api.hubapi.com/crm/v3/objects/deals';
    
    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_TOKEN}`,
        'Content-Type': 'application/json'
    };

    // Construimos el paquete de datos para enviar a HubSpot
    const data = {
        properties: {
            [PROP_NAME]: req.body.name_field, // El nombre que escribiste en el form
            [PROP_1]: req.body.prop1_field,   // Propiedad 1
            [PROP_2]: req.body.prop2_field    // Propiedad 2
        }
    };

    try {
        await axios.post(createDealEndpoint, data, { headers });
        // Si todo sale bien, volvemos a la página principal
        res.redirect('/');
    } catch (error) {
        console.error(error);
        // Si falla, volvemos al inicio también (para que no se cuelgue)
        res.redirect('/');
    }
});

// Arrancar el servidor
app.listen(3000, () => console.log('Listening on http://localhost:3000'));