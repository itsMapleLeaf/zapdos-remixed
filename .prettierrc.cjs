module.exports = {
  ...require("@itsmapleleaf/configs/prettier"),
  plugins: [require("prettier-plugin-tailwindcss")],
  tailwindConfig: "./tailwind.config.cjs",
}
