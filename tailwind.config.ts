import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./public/index.html"
    ],
    theme: {
        extend: {
            fontFamily: {
                nunito: ['Nunito', 'sans-serif'],
            },
        },
    },
    plugins: [],
};

export default config;