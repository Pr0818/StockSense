# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## StockSense frontend

The frontend connects to the StockSense Spring backend at `http://localhost:8080` by default. Set `VITE_API_URL` in a `.env` file in this folder to use another backend URL.

Install dependencies and start the Vite development server from this folder:

```sh
npm install
npm run dev
```

The backend must be running with its database and JWT secret configured. OTP password reset also requires SMTP settings on the backend. Public registration creates an employee account; administrator-only catalog and warehouse actions require an operator-provisioned administrator.

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
