const fs = require('fs');
const path = require('path');

const express= require('express');
const bodyParser = require('body-parser');
const placesRoutes= require('./routes/places-route');
const usersRoutes= require('./routes/users-route');
//import {router as usersRoutes} from './routes/users-route';
const HttpError = require('./models/http-error');
const mongoose = require('mongoose');

 
const app= express();

app.use(bodyParser.json());

app.use('/uploads/images', express.static(path.join('uploads', 'images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    next()
})

app.use('/api/places',placesRoutes);
app.use('/api/users', usersRoutes);

app.use((req,res,next)=>{
    console.log('could not find the route');
    const error = new HttpError('could not find the route', 404);
    throw error;
});

app.use((error, req, res, next)=>{

    if (req.file) {
        fs.unlink(req.file.path, err => {
          console.log(err);
        });
      }
      
    if(res.headerSent){
        return next(error);
    }
    res.status(error.code || 500);
    res.json({message:error.message || 'an unknown error'});
});

const url=
`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.mv129bp.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
mongoose
    .connect(url)
    .then(()=>{
        console.log("mongDB connection successfull by mongoose");
        console.log("Starting server and listening at port 5001");
        app.listen(5001);
    })
    .catch(err=>{
        console.log(err);
    });
