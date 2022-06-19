import React from 'react';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Provider } from 'react-redux';
import { SnackbarProvider } from 'notistack';
import store from '../store/configureStore';

//Views
import Header from './shared/Header/Header';
import Home from "./Home/Home";
import Bots from './Bots/Bots';
import Commands from './Bots/Commands/Commands';
import Members from "./Members/Members";
import Movies from './Movies/Movies';
import Giphy from './Bots/Commands/Giphy';

const App: React.FC = () => (
    <SnackbarProvider>
        <Provider store={store}>
            <Router>
                <Header />
                <Switch>
                    <Route path="/" exact component={Home} />
                    <Route path="/our-bots" component={Bots} />
                    <Route path="/members" component={Members} />
                    <Route path="/movies" component={Movies} />
                    <Route path="/commands" component={Commands} />
                    <Route path='/giphy-examples' component={Giphy} />
                </Switch>
            </Router>
        </Provider>
    </SnackbarProvider>
);

export default App;