import User from "../models/User"
import { Request, Response } from "express"
import { google } from "googleapis"

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
    console.log("🔑 Starting Registration Process")
    try {
      //security: add Cross-Site Request Forgery (CSRF) attack protection (state)
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

      // get user info from Google
      console.log("🔑 Fetching Google User")
      const googleUser = await new User().getGoogleUser(access_token as string)
      console.log("🔑", { googleUser })

      // check if email is verified
      console.log("🔑 Checking if email is verified")
      if (!googleUser.email_verified) {
        console.log("❌ Email is not verified")
        return res.redirect(`${process.env.CLIENT_URL}/login/error`)
      }

      // upsert user
      console.log("🔑 Upserting User")
      const user = new User({
        googleEmail: googleUser.email as string,
        googleName: googleUser.name as string,
        googlePicture: googleUser.picture as string,
        role: state.role,
        group: state.group,
        name: state.name
      })
      await user.save()

      const userData = {
        googleEmail: googleUser.email,
        googleName: googleUser.name,
        googlePicture: googleUser.picture,
        role: state.role,
        group: state.group,
        name: state.name
      }

      // redirect to client with token
      console.log("🔑 Redirecting to Client")
      res.redirect(`${process.env.CLIENT_URL}/login/success?userData=${JSON.stringify(userData)}&access_token=${access_token}&refresh_token=${refresh_token}`)
    } catch (error: any) {
      console.log(error, "❌ Failed to fetch Google OAuth tokens")
      return res.redirect(`${process.env.CLIENT_URL}/login/error`)
    }
  }
}

export default new UserController()
