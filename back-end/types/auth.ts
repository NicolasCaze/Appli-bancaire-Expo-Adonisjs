declare module '@adonisjs/core/http' {
  interface HttpContext {
    user?: {
      userId: number
      email: string
    }
  }
}

export {}
