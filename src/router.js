import { createBrowserRouter } from "react-router";
import DefaultLayout from "./layouts/DefaultLayout";
import Homepage from "./pages/Homepage";
import AuthLayout from "./layouts/AuthLayout";
import Login from "./pages/Login";
import WorkspaceSelector from "./pages/WorkspaceSelector";

const router = createBrowserRouter([
  {
    path: "/",
    Component: DefaultLayout,
    children: [
      {
        index: true,
        Component: Homepage
      },
      {
        path: '/:workspace',
        Component: Homepage
      },
      {
        path: 'login',
        Component: Login
      },
      {
        path: 'workspaces',
        Component: WorkspaceSelector
      }
    ]
  },
  {
    path: "/inventory",
    Component: AuthLayout,
    loader: async ({ params }) => {
      return { isLogin: false };
    },
    children: [
      {
        index: true,
        Component: Homepage
      }
    ]
  },
]);


export default router;