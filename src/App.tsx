import { createBrowserRouter, RouterProvider } from "react-router";

import Login from "./pages/login";
import Register from "./pages/register";
import Home from "./pages/home";
import CreateTodoList from "./pages/create-todo-list";
import EditTodoList from "./pages/edit-todo-list";

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
                path: "/create-todo-list",
                element: <CreateTodoList />
            },
            {
                path: "/edit-todo-list/:id",
                element: <EditTodoList />
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
