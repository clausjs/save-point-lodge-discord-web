import React, { useState, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { CookiesProvider } from 'react-cookie';

import { Provider } from 'react-redux';
import store from './store/configureStore';

import Header from './components/shared/Header/Header';

import { makeStyles } from '@material-ui/core/styles';

import { SnackbarProvider } from 'notistack';

import './sass/_globals.scss';

const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 0,
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
      maxWidth: '33%'
    }
  }));

//Views
import Home from "./components/Home/Home.jsx";
import Bots from './components/Bots/Bots';
import Commands from './components/Bots/Commands';
import Members from "./components/Members/Members.jsx";
import Movies from './components/Movies/Movies.jsx';

const App = () => {
    return (
        <Provider store={store}>
            <Router>
                <Header />
                <Switch>
                    <Route path="/" exact>
                        <Home />
                    </Route>
                    <Route path="/our-bots">
                        <Bots />
                    </Route>
                    <Route path="/members">
                        <Members />
                    </Route>
                    <Route path="/movies">
                        <Movies />
                    </Route>
                    <Route path="/commands">
                        <Commands />
                    </Route>
                </Switch>
            </Router>
        </Provider>
    );
}

ReactDOM.render(
  <SnackbarProvider>
      <CookiesProvider>
        <App />
      </CookiesProvider>
  </SnackbarProvider>,
  document.getElementById('root')
);