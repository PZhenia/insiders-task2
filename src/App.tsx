import { createBrowserRouter, RouterProvider } from "react-router";

import Login from "./pages/login";
import Register from "./pages/register";
import Home from "./pages/home";

import Layout from "./components/Layout";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                path: "/",
                element: <Home />
            },
            {
                path: "*",
                element: <Home />
            }
        ]
    },
    {
        path: "register",
        element: <Register />
    },
    {
        path: "login",
        element: <Login />
    },
]);

function App() {
    return (<RouterProvider router={router} />)
}

export default App
