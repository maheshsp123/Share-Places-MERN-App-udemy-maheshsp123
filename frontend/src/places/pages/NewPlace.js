import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import Input from '../../shared/componets/FormElements/Input';
import Button from '../../shared/componets/FormElements/Button';

import {
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH
} from '../../shared/util/validators';
import './PlaceForm.css';
import { useForm } from '../../shared/hooks/form-hook';
import { useHttpClient } from '../../shared/hooks/http-hook';
import ErrorModal from '../../shared/componets/UIElements/ErrorModal';
import { AuthContext } from '../../shared/context/auth-context';
import LoadingSpinner from '../../shared/componets/UIElements/LoadingSpinner';
import ImageUpload from '../../shared/componets/FormElements/ImageUpload';



const NewPlace = () => {
  const auth = useContext(AuthContext);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [formState, inputHandler] = useForm(
    {
      title: {
        value: '',
        isValid: false
      },
      description: {
        value: '',
        isValid: false
      },
      address: {
        value: '',
        isValid: false
      },
      image: {
        value: null,
        isValid: false
      }
    },
    false
  );

  //const history = useHistory();
  const navigate = useNavigate();

  //console.log("NewPlace.js - auth.userId - "+auth.userId);
 
  const placeSubmitHandler = async event => {
    event.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', formState.inputs.title.value);
      formData.append('description', formState.inputs.description.value);
      formData.append('address', formState.inputs.address.value);
      formData.append('creator', auth.userId);
      formData.append('image', formState.inputs.image.value);
      await sendRequest('http://localhost:5001/api/places', 'POST', formData,{
        Authorization: 'Bearer ' + auth.token
      });
      //history.push('/');
      navigate('/');
    } catch (err) {
      console.log("could not create new place- some error");
      if(err.message) console.log(err.message);
    }
  };

  // const placeSubmitHandler =async event => {
  //   event.preventDefault();
  //   console.log("posting new place for user id: "+auth.userId);
  //   console.log("form data as follows"); // send this to the backend!
  //   console.log(formState.inputs);
  //   try {
  //     await sendRequest(
  //       'http://localhost:5001/api/places',
  //       'POST',
  //       JSON.stringify({
  //         title: formState.inputs.title.value,
  //         description: formState.inputs.description.value,
  //         address: formState.inputs.address.value,
  //         creator: auth.userId
  //       }),
  //       { 'Content-Type': 'application/json' }
  //     );
  //     //history.push('/');
  //     navigate('/');
  //   } catch (err) {
  //     console.log("could not create new place- some error");
  //   }

  // };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      <form className="place-form" onSubmit={placeSubmitHandler}>
        {isLoading && <LoadingSpinner asOverlay />}
        <Input
          id="title"
          element="input"
          type="text"
          label="Title"
          validators={[VALIDATOR_REQUIRE()]}
          errorText="Please enter a valid title."
          onInput={inputHandler}
        />
        <Input
          id="description"
          element="textarea"
          label="Description"
          validators={[VALIDATOR_MINLENGTH(5)]}
          errorText="Please enter a valid description (at least 5 characters)."
          onInput={inputHandler}
        />
        <Input
          id="address"
          element="input"
          label="Address"
          validators={[VALIDATOR_REQUIRE()]}
          errorText="Please enter a valid address."
          onInput={inputHandler}
        />
        <ImageUpload
          id="image"
          onInput={inputHandler}
          errorText="Please provide an image."
          align="center"
        />
        <Button type="submit" disabled={!formState.isValid}>
          ADD PLACE
        </Button>
      </form>
    </React.Fragment>
  );
};

export default NewPlace;
