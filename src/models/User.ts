import axios from "axios"
import { PrismaClient } from "@prisma/client"
import type {} from "@prisma/client"

interface GoogleTokensResult {
  access_token: string
  expiries_in: number
  refresh_token: string
  scope: string
  id_token: string
}

interface GoogleUserResult {
  sub: string
  name: string
  given_name: string
  picture: string
  email: string
  email_verified: boolean
  locale: string
}

class User {
  googleEmail: string
  googleName: string
  googlePicture: string
  role: string
  group: string
  name: string

  constructor({ googleEmail, googleName, googlePicture, role, group, name }: { googleEmail?: string | undefined; googleName?: string | undefined; googlePicture?: string | undefined; role?: string | undefined; group?: string | undefined; name?: string | undefined } = {}) {
    this.googleEmail = googleEmail || ""
    this.googleName = googleName || ""
    this.googlePicture = googlePicture || ""
    this.role = role || ""
    this.group = group || ""
    this.name = name || ""
  }

  async save() {
    const prisma = new PrismaClient()
    try {
      await prisma.user.upsert({
        where: { googleEmail: this.googleEmail },
        update: {
          googleName: this.googleName,
          googlePicture: this.googlePicture,
          role: this.role,
          groupRef: this.group === "" ? null : this.group,
          lecturerRef: this.name === "" ? null : this.name
        },
        create: {
          googleEmail: this.googleEmail,
          googleName: this.googleName,
          googlePicture: this.googlePicture,
          role: this.role,
          groupRef: this.group === "" ? null : this.group,
          lecturerRef: this.name === "" ? null : this.name
        }
      })
    } catch (error: any) {
      console.error(error, "❌ Failed to upsert user")
      throw new Error("❌ Failed to upsert user")
    } finally {
      await prisma.$disconnect()
    }
  }

  async getUserOAuthTokens({ code }: { code: string }): Promise<GoogleTokensResult> {
    const url = "https://oauth2.googleapis.com/token"
    const values = {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID as string,
      client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
      redirect_uri: process.env.GOOGLE_REDIRECT_URL as string,
      grant_type: "authorization_code"
    }

    const qs = new URLSearchParams(values)

    try {
      const res = await axios.post<GoogleTokensResult>(url, qs.toString(), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      })
      return res.data
    } catch (error: any) {
      console.error(error, "❌ Failed to fetch Google OAuth tokens")
      throw new Error("❌ Failed to fetch Google OAuth tokens")
    }
  }
  async getGoogleUserV1({ id_token, access_token }: { id_token: string; access_token: string }): Promise<GoogleUserResult> {
    try {
      const res = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`, {
        headers: {
          Authorization: `Bearer ${id_token}`
        }
      })
      return res.data
    } catch (error: any) {
      console.error(error, "❌ Failed to fetch Google user")
      throw new Error("❌ Failed to fetch Google user")
    }
  }
  async getGoogleUser(access_token: string): Promise<GoogleUserResult> {
    try {
      const res = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`)
      return res.data
    } catch (error: any) {
      console.error(error, "❌ Failed to fetch Google user")
      throw new Error("❌ Failed to fetch Google user")
    }
  }
}

export default User
