import React, { useState, useContext } from 'react';

import Card from '../../shared/componets/UIElements/Card';
import Input from '../../shared/componets/FormElements/Input';
import Button from '../../shared/componets/FormElements/Button';
import {  
  VALIDATOR_EMAIL,
  VALIDATOR_MINLENGTH,
  VALIDATOR_REQUIRE
} from '../../shared/util/validators';
import { useForm } from '../../shared/hooks/form-hook';
import { AuthContext } from '../../shared/context/auth-context'; 
import './Auth.css';
import ErrorModal from '../../shared/componets/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/componets/UIElements/LoadingSpinner'; 
import { useHttpClient } from '../../shared/hooks/http-hook';
import ImageUpload from '../../shared/componets/FormElements/ImageUpload';


const Auth = () => {
  const auth = useContext(AuthContext);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isLoading1, setIsLoading1] = useState(false);
  const [error1, setError1] = useState();
  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  const [formState, inputHandler, setFormData] = useForm(
    {
      email: {
        value: '',
        isValid: false
      },
      password: {
        value: '',
        isValid: false
      }
    },
    false
  );
  
  
  const switchModeHandler = () => {
    if (!isLoginMode) {
      setFormData(
        {
          ...formState.inputs,
          name: undefined,
          image: undefined
        },
        formState.inputs.email.isValid && formState.inputs.password.isValid
      );
    } else {
      setFormData(
        {
          ...formState.inputs,
          name: {
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
    }
    setIsLoginMode(prevMode => !prevMode);
  };

  const authSubmitHandler = async event => {
    event.preventDefault();
    console.log("posting creds=");
    console.log(formState.inputs);
    if (isLoginMode) {
      try {
        const responseData = await sendRequest(
          'http://localhost:5001/api/users/login',
          'POST',
          JSON.stringify({
            email: formState.inputs.email.value,
            password: formState.inputs.password.value
          }),
          {
            'Content-Type': 'application/json'
          }
        );
        console.log(responseData);
        auth.login(responseData.userId, responseData.token);
        //auth.login(responseData.user.id);
        //auth.userId= responseData.user.id; // not required as it is set by useState var in App.js
        //console.log(formState.inputs.email.value+" was logged in successfully")
        console.log(responseData.email+" was logged in successfully")
        //console.log(responseData.user.email+" was logged in successfully")
        console.log("returned user id: "+responseData.userId);
      } catch (err) {
        console.log("some error");
        console.log(err.message);
      }
    } 
    else {
      try {
        setIsLoading1(true);
        const formData = new FormData();
        formData.append('email', formState.inputs.email.value);
        formData.append('name', formState.inputs.name.value);
        formData.append('password', formState.inputs.password.value);
        formData.append('image', formState.inputs.image.value);
        const responseData = await sendRequest(
          'http://localhost:5001/api/users/signup',
          'POST',
          formData
        );
        // const response = await fetch('http://localhost:5001/api/users/signup', {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json'
        //   },
        //   body: JSON.stringify({
        //     name: formState.inputs.name.value,
        //     email: formState.inputs.email.value,
        //     password: formState.inputs.password.value
        //   })
        // });

        // const responseData = await response.json();
        
        // if (!response.ok) {
        //   console.log("response NOT OK- error in data posting- Signup");
        //   throw new Error(responseData.message);
        // }
        // console.log(responseData);
        setIsLoading1(false);
        //auth.login(responseData.user.id);
        auth.login(responseData.userId, responseData.token);
      } catch (err) {
        setIsLoading1(false);
        console.log( 'Something went wrong, please try again.');
        console.log(err.message || 'Something went wrong, please try again.');
        setError1(err.message || 'Something went wrong, please try again.');
      }
    }
    console.log("authSubmitHandler successfull");
    //auth.login();
  };

  const errorHandler1 = () => {
    setError1(null);
  };

  return (
    <React.Fragment>
      <ErrorModal error={error1} onClear={errorHandler1} />
      <ErrorModal error={error} onClear={clearError} />
      <Card className="authentication">
      {isLoading && <LoadingSpinner asOverlay />}
        <h2>Login Required</h2>
        <hr />
        <form onSubmit={authSubmitHandler}>
          {!isLoginMode && (
            <ImageUpload
              center
              id="image"
              onInput={inputHandler}
              errorText="Please provide an image."
            />
          )}

          {!isLoginMode && (
            <Input
              element="input"
              id="name"
              type="text"
              label="Your Name"
              validators={[VALIDATOR_REQUIRE()]}
              errorText="Please enter a name."
              onInput={inputHandler}
            />
            
          )}
          <Input
            element="input"
            id="email"
            type="email"
            label="E-Mail"
            validators={[VALIDATOR_EMAIL()]}
            errorText="Please enter a valid email address."
            onInput={inputHandler}
          />
          <Input
            element="input"
            id="password"
            type="password"
            label="Password"
            validators={[VALIDATOR_MINLENGTH(5)]}
            errorText="Please enter a valid password, at least 5 characters."
            onInput={inputHandler}
          />
          <Button type="submit" disabled={!formState.isValid}>
            {isLoginMode ? 'LOGIN' : 'SIGNUP'}
          </Button>
        </form>
        <Button inverse onClick={switchModeHandler}>
          SWITCH TO {isLoginMode ? 'SIGNUP' : 'LOGIN'}
        </Button>
      </Card>
    </React.Fragment>
  );
};

export default Auth;
