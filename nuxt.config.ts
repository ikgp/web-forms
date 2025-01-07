// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  runtimeConfig: {
    ncUser: process.env.NEXTCLOUD_USER,
    ncPassword: process.env.NEXTCLOUD_PW,
    public: {
      ncUrl: process.env.NEXTCLOUD_SERVER,
    },
  },

  compatibilityDate: "2025-01-07",
});