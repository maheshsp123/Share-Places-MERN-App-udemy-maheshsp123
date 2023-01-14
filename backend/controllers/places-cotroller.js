const fs = require('fs');

const express= require('express');
const mongoose = require('mongoose');
const HttpError = require('../models/http-error');
const {v4: uuidv4}= require('uuid');
const { validationResult } = require('express-validator');
const getCoordsForAddress = require('../util/location');
const Place =require('../models/place');
const User = require('../models/user');


let DUMMY_PLACES = [
    {
      id: 'p1',
      title: 'Empire State Building',
      description: 'One of the most famous sky scrapers in the world!',
      location: {
        lat: 40.7484474,
        lng: -73.9871516
      },
      address: '20 W 34th St, New York, NY 10001',
      creator: 'u1'
    }
  ];

// url- /api/places/p1
const getPlaceByPlaceId = async (req,res,next)=>{
    console.log('GET place by place ID');
    const pid = req.params.pid;
    console.log('GET  place ID='+pid);
    // const place= DUMMY_PLACES.find(p=>{
    //     return pid === p.id;
    // });
    let place;
    try{
      place = await Place.findById(pid);
    }catch(err){
      const error = new HttpError('place not found, or some error',500);
      return next(error);
    }
    if(!place){
      const error = new HttpError('place not found in db',500);
      return next(error);
    }
    res.json({place:place.toObject({getters:true})});
};

const getPlacesByUserId = async (req,res,next)=>{
    console.log('GET place by User ID');
    const uid = req.params.uid;
    console.log('GET  user ID='+uid);
    //const places= DUMMY_PLACES.filter(p=> uid === p.creator);
    let places;
    try{
      places= await Place.find({creator:uid});
    }catch(err){
      const error = new HttpError('users places not found, or some error',500);
      return next(error);
    }

    if(!places || places.length === 0){
      
      const error = new HttpError('users places not found in DB',404);
      return next(error);
    }
    
    res.json({ places:places.map(  place =>place.toObject({getters:true})  ) });
      
  };

const createPlace= async (req,res,next)=>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError('Invalid inputs passed, please check your data.', 422);
  }
  const { title, description,  address, creator }=  req.body;
  let coordinates= getCoordsForAddress(address);

  // const newPlace = {
  //   id: uuidv4(),
  //   title,
  //   description,
  //   location: coordinates,
  //   address,
  //   creator
  // };
  console.log("adding following new place to db");
  
  const newPlace =new Place( {
    title,
    description,
    address,
    location: coordinates,
    image: req.file.path,
    creator: req.userData.userId
  });
  //console.log(newPlace);
  console.log("new place created but yet to be saved");
  
  // try{
  //   newPlace.save();
  // }catch(err){
  //   const error = new HttpError('place coulc not be created',500);
  //   return next(error);
  // }

  let user;
  try {
    user = await User.findById(creator);
    console.log(user);
  } catch(err) {
    console.log(err.stack, 'stack');
    const error = new HttpError('could not find the user linked to place to be created', 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError('Could not find user for provided id', 404);
    return next(error);
  }

  //console.log(user);

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await newPlace.save({ session: sess });
    user.places.push(newPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Creating place failed, please try again.',
      500
    );
    return next(error);
  }

  try{
    newPlace.save();
  }catch(err){
    const error = new HttpError('place coulc not be created',500);
    return next(error);
  }

  //DUMMY_PLACES.push(newPlace);
  res.status(201).json({place: newPlace});
};

const updateByPlaceId= async (req,res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError('Invalid inputs passed, please check your data.', 422);
  }
  const { title, description }=  req.body;
  const pid = req.params.pid;
  //place= {...DUMMY_PLACES.find(p=> p.id=== pid) };
  let place;
  try {
    place = await Place.findById(pid);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update place.',
      500
    );
    return next(error);
  }

  if (place.creator.toString() !== req.userData.userId) {
    const error = new HttpError('You are not allowed to edit this place.', 401);
    return next(error);
  }



  place.title =  title;
  place.description =  description;

  // placeIndex= DUMMY_PLACES.findIndex(p=> p.id=== pid);
  // DUMMY_PLACES[placeIndex] = place;
  try {
    await place.save();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update place.',
      500
    );
    return next(error);
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deleteByPlaceId = async (req,res,next) => {
  console.log("DELETE pid");
  const pid = req.params.pid;
  console.log("deleting pid= "+pid);
  //deletePlace= DUMMY_PLACES.find(p => p.id === pid);

  let deletePlace;
  try {
    deletePlace = await Place.findById(pid).populate('creator');
  } catch (err) {
    console.log(err.message);
    const error = new HttpError(
      'Something went wrong, could not delete place.',
      500
    );
    return next(error);
  }

  if (!deletePlace) {
    const error = new HttpError('Could not find place for this id.', 404);
    return next(error);
  }

  if (deletePlace.creator.id !== req.userData.userId) {
    const error = new HttpError(
      'You are not allowed to delete this place.',
      401
    );
    return next(error);
  }

  const imagePath = deletePlace.image;

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await deletePlace.remove({ session: sess });
    deletePlace.creator.places.pull(deletePlace);
    await deletePlace.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete place.',
      500
    );
    return next(error);
  }

  fs.unlink(imagePath, err => {
    console.log(err);
    console.log("after deleting place db, could delete its image in server spcae");
  });

  res.status(200).json({ message: 'Deleted place.' });
  
  // if(deletePlace){
  //   DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id !== pid);
    
  //   res.status(200).json({message:"deleted a place", place:deletePlace});
  // }
  // else{
  //   res.status(200).json({message:"place not found"});
  // }

};

exports.getPlaceByPlaceId = getPlaceByPlaceId;
exports.getPlacesByUserId  = getPlacesByUserId;
exports.createPlace= createPlace;
exports.updateByPlaceId = updateByPlaceId;
exports.deleteByPlaceId = deleteByPlaceId;