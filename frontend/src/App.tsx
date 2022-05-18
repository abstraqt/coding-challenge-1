import React from "react";
import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { LinkContainer } from "react-router-bootstrap";
import NavigationHeader from "./components/NavigationHeader";
import { Route, Routes } from "react-router";
import Home from "./pages/Home";
import People from "./pages/People";
import "./App.scss";
import PersonDetail from "./pages/PersonDetail";
import EditPersonDetail from "./pages/EditPersonDetail";

function App() {
    return (
        <>
            <NavigationHeader />
            <Routes>
                <Route index element={<Home />} />
                <Route path="people" element={<People />} />
                <Route path="people/detail/:id" element={<PersonDetail />} />
                <Route path="people/detail/:id/edit" element={<EditPersonDetail />} />
            </Routes>
        </>
    );
}

export default App;
