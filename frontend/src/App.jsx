import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RootLayout } from './layouts/RootLayout';

import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { MovieDetails } from './pages/MovieDetails';
import { Search } from './pages/Search';
import { Profile } from './pages/Profile';
import { Watchlist } from './pages/Watchlist';
import { Lists } from './pages/Lists';
import { ListDetails } from './pages/ListDetails';
import { NewList } from './pages/NewList';
import { Feed } from './pages/Feed';
import { NotFound } from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<RootLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/movie/:id" element={<MovieDetails />} />
            <Route path="/search" element={<Search />} />
            <Route path="/profile/:username" element={<Profile />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/lists" element={<Lists />} />
            <Route path="/lists/new" element={<NewList />} />
            <Route path="/lists/:id" element={<ListDetails />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
