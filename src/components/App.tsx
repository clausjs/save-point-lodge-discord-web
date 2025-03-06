import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router";
import { Provider } from 'react-redux';
import { store } from '../state/store';

//Views
import Header from './shared/Header/Header';
import Home from "./Home/Home";
import Bots from './Bots/Bots';
import Commands from './Bots/Commands/Commands';
import Members from "./Members/Members";
import Giphy from './Bots/Commands/Giphy';
import Soundboard from './Soundboard/Soundboard';
import { ThemeProvider, createTheme, StyledEngineProvider } from '@mui/material/styles';
import { Container } from '@mui/material';

const theme = createTheme({
    components: {
        MuiAppBar: {
            styleOverrides: {
                colorDefault: {
                    display: 'flex',
                    flexGrow: 1
                },
                colorPrimary: {
                    // backgroundColor: '#1C364A',
                    // color: '#FFFFFF',
                    display: 'flex',
                    flexGrow: 1
                }
            }
        },
    }
});

const App: React.FC = () => (
    <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
            <Provider store={store}>
                <Router>
                    <Header />
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/our-bots" element={<Bots />} />
                        <Route path="/members" element={<Members />} />
                        <Route path="/commands" element={<Commands />} />
                        <Route path='/soundboard' element={<Soundboard />} />
                        <Route path='/giphy-examples' element={<Giphy />} />
                    </Routes>
                </Router>
                <Container className='copyright-info' maxWidth={false}>
                    <Container className='c-content' maxWidth='md'>
                        <img src='/img/logo.png'></img>
                        <span>© Copyright Save Point Lodge 2016-2025</span>
                    </Container>
                </Container>
            </Provider>
        </ThemeProvider>
    </StyledEngineProvider>
);

export default App;