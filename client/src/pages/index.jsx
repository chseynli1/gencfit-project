import { Urls } from '../shared/constants/Urls'
import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './Home'
import About from './About'
import Services from './Services'
import Contact from './Contact'
import Detail from './Detail'
import Blog from './Blog'
import Partners from './Partners'
import Gyms from './Gyms'
import Register from './Register'
import Login from './Login'
import GoogleLoginCallback from '@/shared/components/GoogleLoginCallback/GoogleLoginCallback'
import Profile from './Profile'
import VenuesList from './VenuesList'

const Router = ({ searchResults }) => {
    return (
        <Routes>
            <Route path={Urls.HOME} element={<Home searchResults={searchResults} />} />
            <Route path={Urls.ABOUT} element={<About />} />
            <Route path={Urls.SERVICES} element={<Services />} />
            <Route path={Urls.CONTACT} element={<Contact />} />
            <Route path={Urls.DETAIL} element={<Detail />} />
            <Route path={Urls.BLOG} element={<Blog />} />
            <Route path={Urls.PARTNERS} element={<Partners />} />
            <Route path={Urls.GYMS} element={<Gyms />} />
            <Route path={Urls.REGISTER} element={<Register />} />
            <Route path={Urls.LOGIN} element={<Login />} />
            <Route path="/google/callback" element={<GoogleLoginCallback />} />
            <Route path={Urls.PROFILE} element={<Profile />} />
            <Route path={Urls.VENUES_LIST} element={<VenuesList />} />
        </Routes>
    )
}

export default Router
