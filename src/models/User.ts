import axios from "axios"
import { PrismaClient } from "@prisma/client"
import { google } from "googleapis"
import { TRole, IFullUserData } from "../types"

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

abstract class User {
  googleEmail: string
  googleName: string
  googlePicture: string
  role: TRole
  refreshToken: string

  constructor({ googleEmail, googleName, googlePicture, role, refreshToken }: { googleEmail: string; googleName: string; googlePicture: string; role: TRole; refreshToken: string }) {
    this.googleEmail = googleEmail
    this.googleName = googleName
    this.googlePicture = googlePicture
    this.role = role
    this.refreshToken = refreshToken
  }

  static async getUserOAuthTokens({ code }: { code: string }): Promise<GoogleTokensResult> {
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

  static async getGoogleUser(access_token: string): Promise<GoogleUserResult> {
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

  abstract saveInDB(): Promise<void>

  static removeUserByEmail(email: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const prisma = new PrismaClient()
      try {
        await prisma.user.delete({
          where: {
            googleEmail: email
          }
        })
        resolve()
      } catch (error: any) {
        console.error(error, "❌ Failed to remove user by email")
        reject(new Error("❌ Failed to remove user by email"))
      } finally {
        prisma.$disconnect()
      }
    })
  }

  static updateUserByEmail(email: string, data: { role: string; name: string; group: string }): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const prisma = new PrismaClient()
      try {
        const { role, name, group } = data
        if (!role) throw new Error("❌ Role is required")
        if (!group && !name) throw new Error("❌ Group or name is required")
        if (role !== "student" && role !== "lecturer") throw new Error("❌ Invalid role")
        if (role === "student") {
          console.log("Update student ", { email, group })
          await prisma.user.update({
            where: {
              googleEmail: email
            },
            data: {
              role,
              groupRef: group,
              lecturerRef: null
            }
          })
          resolve()
        } else {
          console.log("Update teacher ", { email, name })
          await prisma.user.update({
            where: {
              googleEmail: email
            },
            data: {
              role,
              groupRef: null,
              lecturerRef: name
            }
          })
          resolve()
        }
      } catch (error: any) {
        console.error(error, "❌ Failed to update user by email")
        reject(new Error("❌ Failed to update user by email"))
      } finally {
        prisma.$disconnect()
      }
    })
  }

  static getUserByEmail(email: string): Promise<IFullUserData> {
    return new Promise(async (resolve, reject) => {
      const prisma = new PrismaClient()
      try {
        const user = await prisma.user.findUnique({
          where: {
            googleEmail: email
          }
        })

        if (!user) {
          throw new Error("❌ User not found")
        }

        resolve({
          googleEmail: user.googleEmail,
          googleName: user.googleName,
          googlePicture: user.googlePicture,
          role: user.role as TRole,
          refreshToken: user.refreshToken,
          group: user.groupRef || "",
          name: user.lecturerRef || ""
        })
      } catch (error: any) {
        console.error(error, "❌ Failed to get user by email")
        reject(new Error("❌ Failed to get user by email"))
      } finally {
        prisma.$disconnect()
      }
    })
  }
}

class Student extends User {
  group: string

  constructor({ googleEmail, googleName, googlePicture, refreshToken, group }: { googleEmail: string; googleName: string; googlePicture: string; refreshToken: string; group: string }) {
    super({ googleEmail, googleName, googlePicture, role: "student", refreshToken })
    this.group = group
  }

  static async getStudents() {
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

  async saveInDB() {
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
        throw new Error(`❌ ${this.googleEmail} user already exists`)
      }

      // create user
      await prisma.user.create({
        data: {
          googleEmail: this.googleEmail,
          googleName: this.googleName,
          googlePicture: this.googlePicture,
          refreshToken: this.refreshToken,
          role: this.role,
          groupRef: this.group,
          lecturerRef: null
        }
      })
    } catch (error: any) {
      console.error(error, "❌ Failed to create user")
      throw new Error("❌ Failed to create user")
    } finally {
      await prisma.$disconnect()
    }
  }
}

class Lecturer extends User {
  name: string

  constructor({ googleEmail, googleName, googlePicture, refreshToken, name }: { googleEmail: string; googleName: string; googlePicture: string; refreshToken: string; name: string }) {
    super({ googleEmail, googleName, googlePicture, role: "lecturer", refreshToken })
    this.name = name
  }

  static async getLecturers() {
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

  async saveInDB() {
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
          groupRef: null,
          lecturerRef: this.name
        }
      })
    } catch (error: any) {
      console.error(error, "❌ Failed to create user")
      throw new Error("❌ Failed to create user")
    } finally {
      await prisma.$disconnect()
    }
  }
}

export { Student, Lecturer, User }
