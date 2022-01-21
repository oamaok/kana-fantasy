type Config = {
  discordOauth2Url: string
}

const developmentConfig: Config = {
  discordOauth2Url:
    'https://discord.com/api/oauth2/authorize?client_id=932976471318884352&redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Foauth&response_type=code&scope=identify',
}

const productionConfig: Config = {
  discordOauth2Url: 'TODO',
}

export default __ENVIRONMENT__ === 'development'
  ? developmentConfig
  : productionConfig
