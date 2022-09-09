const { guessProductionMode } = require("@ngneat/tailwind");
const colors = require('tailwindcss/colors');

module.exports = {
    prefix: '',
    purge: {
        enabled: guessProductionMode(),
        content: [
            './src/**/*.{html,ts}',
        ]
    },
    darkMode: 'class', // or 'media' or 'class'
    theme: {
        extend: {
            colors: {
                primaryColor: "#27272A",
                secondaryColor: "#005780",
                thirdColor: '#fbb984',
                background: colors.gray,
                primary: colors.gray,
                orange: colors.orange,
                secondary: colors.blue,
            },
            animation: {
                'pulse-fast': 'pulse 0.5s linear infinite',
            }
        },
        fontFamily: {
            display: ["Nunito", "sans-serif"],
        }
    },
    variants: {
        extend: {},
    },
    plugins: [],
};