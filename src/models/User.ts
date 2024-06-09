import axios from "axios"
import { PrismaClient } from "@prisma/client"
import type {} from "@prisma/client"
import { google } from "googleapis"

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
  refreshToken: string

  constructor({ googleEmail, googleName, googlePicture, role, group, name, refreshToken }: { googleEmail?: string | undefined; googleName?: string | undefined; googlePicture?: string | undefined; role?: string | undefined; group?: string | undefined; name?: string | undefined; refreshToken?: string } = {}) {
    this.googleEmail = googleEmail || ""
    this.googleName = googleName || ""
    this.googlePicture = googlePicture || ""
    this.role = role || ""
    this.group = group || ""
    this.name = name || ""
    this.refreshToken = refreshToken || ""
  }

  async create() {
    const prisma = new PrismaClient()
    try {
      // check if user exists
      const user = await prisma.user.findUnique({
        where: {
          googleEmail: this.googleEmail
        }
      })

      // if user exists, throw error
      if (user) {
        throw new Error("❌ User already exists")
      }

      // create user
      await prisma.user.create({
        data: {
          googleEmail: this.googleEmail,
          googleName: this.googleName,
          googlePicture: this.googlePicture,
          refreshToken: this.refreshToken,
          role: this.role,
          groupRef: this.group === "" ? null : this.group,
          lecturerRef: this.name === "" ? null : this.name
        }
      })
    } catch (error: any) {
      console.error(error, "❌ Failed to create user")
      throw new Error("❌ Failed to create user")
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

  getAccessToken(): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        // Getting user from database
        const prisma = new PrismaClient()
        const user = await prisma.user.findUnique({
          where: {
            googleEmail: this.googleEmail
          }
        })
        await prisma.$disconnect()

        // If user not found, throw error
        if (!user) {
          throw new Error("❌ User not found")
        }

        // Get refresh token
        const { refreshToken: refresh_token } = user

        // Create OAuth2 client
        const oauth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URL)
        oauth2Client.setCredentials({ refresh_token })

        // Get access token
        const { token } = await oauth2Client.getAccessToken()

        resolve(token as string)
      } catch (error: any) {
        console.error(error, "❌ Failed to get access token")
        reject(new Error("❌ Failed to get access token"))
      }
    })
  }

  getUserByEmail(email: string): Promise<User | null> {
    return new Promise(async (resolve, reject) => {
      const prisma = new PrismaClient()
      try {
        const user = await prisma.user.findUnique({
          where: {
            googleEmail: email
          }
        })
        await prisma.$disconnect()

        resolve({
          googleEmail: user?.googleEmail,
          googleName: user?.googleName,
          googlePicture: user?.googlePicture,
          role: user?.role,
          group: user?.groupRef || "",
          name: user?.lecturerRef || "",
          refreshToken: user?.refreshToken
        } as User | null)
      } catch (error: any) {
        console.error(error, "❌ Failed to get user by email")
        reject(new Error("❌ Failed to get user by email"))
      }
    })
  }

  async getStudents() {
    return new Promise(async (resolve, reject) => {
      const prisma = new PrismaClient()
      prisma.user
        .findMany({
          where: {
            role: "student"
          },
          select: {
            googleName: true
          }
        })
        .then(students => {
          resolve(students.map(student => student.googleName))
        })
        .catch(err => {
          reject(err)
        })
        .finally(() => {
          prisma.$disconnect()
        })
    })
  }

  async getLecturers() {
    return new Promise(async (resolve, reject) => {
      const prisma = new PrismaClient()
      prisma.user
        .findMany({
          where: {
            role: "lecturer"
          },
          select: {
            googleName: true
          }
        })
        .then(lecturers => {
          resolve(lecturers.map(lecturer => lecturer.googleName))
        })
        .catch(err => {
          reject(err)
        })
        .finally(() => {
          prisma.$disconnect()
        })
    })
  }
}

export default User
