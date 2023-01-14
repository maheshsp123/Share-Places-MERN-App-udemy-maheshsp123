import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import NewPlace from './places/pages/NewPlace';
import UpdatePlace from './places/pages/UpdatePlace';
import UserPlaces from './places/pages/UserPlaces';
//import ErrorPage from './shared/componets/errorpage';
import MainNavigation from './shared/componets/Navigation/MainNavigation';
import { AuthContext } from './shared/context/auth-context';
import { useAuth } from './shared/hooks/auth-hook';
import Auth from './user/pages/Auth';
import Users from './user/pages/Users';

const App= () => {
  // const [isLoggedIn, setIsLoggedIn] = useState(false);
  // const [userId, setUserId] = useState(false);

  // const login = useCallback(uid => {
  //   setIsLoggedIn(true);
  //   setUserId(uid);
  // }, []);

  // const logout = useCallback(() => {
  //   setIsLoggedIn(false);
  //   setUserId(null);
  // }, []);

  const { token, login, logout, userId } = useAuth();

  let routes;

  //if (isLoggedIn) {
  if (token) {
    routes = (
      <Routes>
        <Route path="/" element={<Users />}/>
        <Route path="/:uid/places" element={<UserPlaces />}/>
        <Route path="/places/new" element={<NewPlace />}/>
        <Route path="/places/:placeId" element={<UpdatePlace />}/>
        <Route path="*" element={<Navigate replace to="/" />} /> 
        
      </Routes>
    );
  }
  else {
    routes = ( 
      <Routes>
        <Route path="/" element={<Users />}/>
        <Route path="/:uid/places" element={<UserPlaces />}/>
        <Route path="/auth" element={<Auth />}/>
        <Route path="*" element={<Auth />} />
      </Routes>
    );
  }    
  // return (
  //   <Router>
  //     <MainNavigation/>
  //     <main>
  //       <Routes>
  //         <Route path="/" element={<Users />}/>
  //         <Route path="/:uid/places" element={<UserPlaces />}/>
  //         <Route path="/places/new" element={<NewPlace />}/>
  //         <Route path="/places/:placeId" element={<UpdatePlace />}/>
  //         <Route path="*" element={<ErrorPage/>} />
  //       </Routes>
  //     </main>
  //   </Router>
  
  // );
  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!token,
        token: token,
        userId: userId,
        login: login,
        logout: logout
      }}
    >
      <Router>
        <MainNavigation />
        <main>{routes}</main>
      </Router>
    </AuthContext.Provider>
  );

 
}

export default App;
