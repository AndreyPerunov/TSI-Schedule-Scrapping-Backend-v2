import User from "../models/User"
import { Request, Response } from "express"
import { google } from "googleapis"
import jwt from "jsonwebtoken"

class UserController {
  scopes = ["https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/calendar"]

  async authorizationUrl(req: Request, res: Response) {
    const oAuth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID as string, process.env.GOOGLE_CLIENT_SECRET as string, process.env.GOOGLE_REDIRECT_URL as string)
    const authUrl = oAuth2Client.generateAuthUrl({
      // 'online' (default) or 'offline' (gets refresh_token)
      access_type: "offline",
      scope: this.scopes,
      // Enable incremental authorization. Recommended as a best practice.
      include_granted_scopes: true
    })
    res.json(authUrl)
  }

  async googleOAuthHandler(req: Request, res: Response) {
    try {
      // get the code from query string
      console.log("🔑 Getting code from query string")
      const code = req.query.code as string

      // get state from query string
      console.log("🔑 Getting state from query string")
      const state = JSON.parse(decodeURIComponent(req.query.state as string))
      console.log("🔑", { state })

      // get access token from Google
      console.log("🔑 Fetching Google OAuth Tokens")
      const oAuth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID as string, process.env.GOOGLE_CLIENT_SECRET as string, process.env.GOOGLE_REDIRECT_URL as string)
      const { tokens } = await oAuth2Client.getToken(code)

      // set the credentials of the OAuth2 client
      console.log("🔑 Setting Google OAuth Tokens")
      await oAuth2Client.setCredentials(tokens)
      const { access_token, refresh_token } = oAuth2Client.credentials

      const access_token_expires_in = oAuth2Client.credentials.expiry_date! - Date.now()
      console.log(`🔑 Access Token Expires in: ${access_token_expires_in}ms`)
      const access_token_exists = access_token !== undefined || access_token !== null
      const refresh_token_exists = refresh_token !== undefined || refresh_token !== null

      console.log(`🔑 access_token: ${access_token_exists}, refresh_token: ${refresh_token_exists}`)

      // get user info from Google
      console.log("🔑 Fetching Google User")
      const googleUser = await new User().getGoogleUser(access_token as string)
      console.log("🔑", { googleUser })

      // check if email is verified
      console.log("🔑 Checking if email is verified")
      if (!googleUser.email_verified) {
        console.log("❌ Email is not verified")
        return res.redirect(`${process.env.CLIENT_URL}/login/error?error_message=Email is not verified. Please verify your email.`)
      }

      let user: User | null = null

      if (state.from == "login") {
        console.log("🔑 LOGIN")
        console.log("🔑 Checking if User Exists")
        user = await new User().getUserByEmail(googleUser.email as string)
        if (user?.googleEmail && user?.googleName && user?.googlePicture && user?.refreshToken && user?.role && (user?.group || user?.name)) {
          console.log("🔑 User Exists")
        } else {
          console.log("❌ User Does Not Exist")
          return res.redirect(`${process.env.CLIENT_URL}/login/error?error_message=You are not registered. Please sign up.`)
        }
      } else {
        console.log("🔑 SIGNUP")
        // create user
        console.log("🔑 Creating User")
        user = new User({
          googleEmail: googleUser.email as string,
          googleName: googleUser.name as string,
          googlePicture: googleUser.picture as string,
          refreshToken: refresh_token as string,
          role: state.role,
          group: state.group,
          name: state.name
        })
        await user.create()
      }

      const userData = {
        googleEmail: user.googleEmail,
        googleName: user.googleName,
        googlePicture: user.googlePicture,
        role: user.role,
        group: user.group,
        name: user.name
      }

      // session cookie
      console.log("🔑 Setting Session Cookie")
      const expires = new Date(Date.now() + 90 * 60 * 1000) // 90 minutes
      const session = jwt.sign(userData, process.env.JWT_SECRET as string, { expiresIn: "90min" })
      res.cookie("session", session, {
        expires,
        httpOnly: true
      })

      // redirect to client with token
      console.log("🔑 Redirecting to Client")
      res.redirect(`${process.env.CLIENT_URL}/login/success`)
    } catch (error: any) {
      console.log(error, "❌ Failed to fetch Google OAuth tokens")
      return res.redirect(`${process.env.CLIENT_URL}/login/error`)
    }
  }

  mustBeLoggedIn(req: any, res: Response, next: any) {
    console.log("🔑 Checking if User is Logged In")
    try {
      const token = req.cookies.session
      const user = jwt.verify(token, process.env.JWT_SECRET as string)

      req.user = user
      next()
    } catch (error) {
      console.log("❌ User is not logged in")
      res.clearCookie("session")
      return res.status(401).json("Unauthorized")
    }
  }

  getUser(req: any, res: Response) {
    // req.user is set in mustBeLoggedIn middleware
    console.log("🔑 Getting User")
    return res.json(req.user)
  }

  logout(req: any, res: Response) {
    console.log("🔑 Logging Out User")
    res.clearCookie("session")
    return res.json("Logged out")
  }

  getStudents(req: any, res: Response) {
    const user = new User()
    user
      .getStudents()
      .then(students => {
        res.json(students)
      })
      .catch(err => {
        res.status(500).json(err)
      })
  }

  getLecturers(req: any, res: Response) {
    const user = new User()
    user
      .getLecturers()
      .then(lecturers => {
        res.json(lecturers)
      })
      .catch(err => {
        res.status(500).json(err)
      })
  }
}

export default new UserController()
