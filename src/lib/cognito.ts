// /**
//  * src/lib/cognito.ts
//  * --------------------
//  * Single source of truth for talking to AWS Cognito. Every Cognito call in
//  * the app (sign up, email-OTP verification, resend OTP, login, forgot
//  * password) goes through this file instead of pages touching
//  * `amazon-cognito-identity-js` directly — same pattern as `apiClient.ts` /
//  * `tokenStore.ts` already used for the REST backend.
//  *
//  * ENV VARS REQUIRED (see src/lib/env.ts style — add a `.env`):
//  *   VITE_COGNITO_USER_POOL_ID=ap-south-1_a4xkMF
//  *   VITE_COGNITO_CLIENT_ID=2ethppqdbdp5a0391avdqo0
//  *   VITE_AWS_REGION=ap-south-1
//  *
//  * NOTE ON PASSWORDS: Cognito user pools enforce a password policy
//  * (by default: minimum 8 characters). If your pool's policy is stricter
//  * than the app's 4-digit PIN, sign up / login will fail with
//  * `InvalidPasswordException`. Relax the pool's password policy (Cognito
//  * console → User pool → Sign-in policies → Password policy) if you want to
//  * keep using a 4-digit PIN as the Cognito password, or the calling page
//  * should switch to collecting a full password instead of a PIN.
//  */

// import {
//   CognitoUserPool,
//   CognitoUser,
//   CognitoUserAttribute,
//   AuthenticationDetails,
// } from "amazon-cognito-identity-js";
// import type {
//   ISignUpResult,
//   CognitoUserSession,
// } from "amazon-cognito-identity-js";
// import { COGNITO_USER_POOL_ID, COGNITO_CLIENT_ID } from "./env";

// export const userPool = new CognitoUserPool({
//   UserPoolId: COGNITO_USER_POOL_ID,
//   ClientId: COGNITO_CLIENT_ID,
// });

// export interface CognitoAuthError {
//   name?: string;
//   code?: string;
//   message: string;
// }

// export interface CognitoSessionTokens {
//   accessToken: string;
//   idToken: string;
//   refreshToken: string;
// }

// function getCognitoUser(email: string): CognitoUser {
//   return new CognitoUser({ Username: email.trim().toLowerCase(), Pool: userPool });
// }

// function sessionToTokens(session: CognitoUserSession): CognitoSessionTokens {
//   return {
//     accessToken: session.getAccessToken().getJwtToken(),
//     idToken: session.getIdToken().getJwtToken(),
//     refreshToken: session.getRefreshToken().getToken(),
//   };
// }

// export const cognitoAuth = {
//   /**
//    * Registers a new user in the Cognito user pool with `email` as the
//    * username. Cognito automatically emails a 6-digit verification code
//    * (the "email OTP") to the address, which is confirmed via
//    * `confirmSignUp`.
//    */
//   signUp(
//     email: string,
//     password: string,
//     attributes: Record<string, string> = {}
//   ): Promise<ISignUpResult> {
//     const cleanEmail = email.trim().toLowerCase();
//     return new Promise((resolve, reject) => {
//       const attributeList: CognitoUserAttribute[] = [
//         new CognitoUserAttribute({ Name: "email", Value: cleanEmail }),
//         ...Object.entries(attributes)
//           .filter(([, value]) => !!value)
//           .map(([Name, Value]) => new CognitoUserAttribute({ Name, Value })),
//       ];

//       userPool.signUp(cleanEmail, password, attributeList, [], (err, result) => {
//         if (err || !result) {
//           reject(err);
//           return;
//         }
//         resolve(result);
//       });
//     });
//   },

//   /** Confirms signup using the 6-digit OTP code emailed to the user. */
//   confirmSignUp(email: string, code: string): Promise<void> {
//     return new Promise((resolve, reject) => {
//       getCognitoUser(email).confirmRegistration(code, true, (err) => {
//         if (err) {
//           reject(err);
//           return;
//         }
//         resolve();
//       });
//     });
//   },

//   /**
//    * Re-sends the email OTP code. Used both for the visible "Resend OTP"
//    * button and internally by `isUnverifiedExistingUser` below.
//    */
//   resendConfirmationCode(email: string): Promise<void> {
//     return new Promise((resolve, reject) => {
//       getCognitoUser(email).resendConfirmationCode((err) => {
//         if (err) {
//           reject(err);
//           return;
//         }
//         resolve();
//       });
//     });
//   },

//   /**
//    * Cognito's `signUp()` rejects with the *same* `UsernameExistsException`
//    * whether the email is already registered AND verified, or registered but
//    * still sitting unverified from an abandoned signup. The API gives no way
//    * to tell the two apart directly — the trick is that
//    * `resendConfirmationCode` only succeeds for an *unconfirmed* user (it
//    * fails with `InvalidParameterException` — "already confirmed" — for a
//    * confirmed one). So on `UsernameExistsException` we probe with a resend:
//    * success means "unverified, safe to drop them into the OTP modal",
//    * failure means "already a real account, tell them to log in instead".
//    */
//   async isUnverifiedExistingUser(email: string): Promise<boolean> {
//     try {
//       await cognitoAuth.resendConfirmationCode(email);
//       return true;
//     } catch {
//       return false;
//     }
//   },

//   /** Logs in with email + password. Returns the raw Cognito session tokens. */
//   login(email: string, password: string): Promise<CognitoSessionTokens> {
//     return new Promise((resolve, reject) => {
//       const user = getCognitoUser(email);
//       const authDetails = new AuthenticationDetails({
//         Username: email.trim().toLowerCase(),
//         Password: password,
//       });

//       user.authenticateUser(authDetails, {
//         onSuccess: (session) => resolve(sessionToTokens(session)),
//         onFailure: (err) => reject(err),
//       });
//     });
//   },

//   /** Step 1 of "Forgot Password" — emails an OTP code to reset with. */
//   forgotPassword(email: string): Promise<void> {
//     return new Promise((resolve, reject) => {
//       getCognitoUser(email).forgotPassword({
//         onSuccess: () => resolve(),
//         onFailure: (err) => reject(err),
//       });
//     });
//   },

//   /** Step 2 of "Forgot Password" — OTP code + new password. */
//   confirmPassword(email: string, code: string, newPassword: string): Promise<void> {
//     return new Promise((resolve, reject) => {
//       getCognitoUser(email).confirmPassword(code, newPassword, {
//         onSuccess: () => resolve(),
//         onFailure: (err) => reject(err),
//       });
//     });
//   },

//   /** Friendly, human-readable text for any error Cognito throws. */
//   getErrorMessage(error: unknown): string {
//     const err = error as CognitoAuthError;
//     switch (err?.code || err?.name) {
//       case "UsernameExistsException":
//         return "This email is already registered.";
//       case "CodeMismatchException":
//         return "Invalid OTP. Please check the code and try again.";
//       case "ExpiredCodeException":
//         return "This OTP has expired. Please request a new one.";
//       case "UserNotConfirmedException":
//         return "Please verify your email before continuing.";
//       case "NotAuthorizedException":
//         return err.message || "Incorrect email or password.";
//       case "UserNotFoundException":
//         return "No account found with this email.";
//       case "LimitExceededException":
//       case "TooManyRequestsException":
//         return "Too many attempts. Please wait a moment and try again.";
//       case "InvalidPasswordException":
//         return err.message || "Password does not meet the required policy.";
//       case "InvalidParameterException":
//         return err.message || "Invalid request. Please check your details.";
//       default:
//         return err?.message || "Something went wrong. Please try again.";
//     }
//   },
// };

// export default cognitoAuth;


/**
 * src/lib/cognito.ts
 * --------------------
 * Single source of truth for talking to AWS Cognito. Every Cognito call in
 * the app (sign up, email-OTP verification, resend OTP, login, forgot
 * password) goes through this file instead of pages touching
 * `amazon-cognito-identity-js` directly — same pattern as `apiClient.ts` /
 * `tokenStore.ts` already used for the REST backend.
 *
 * ENV VARS REQUIRED (see src/lib/env.ts style — add a `.env`):
 *   VITE_COGNITO_USER_POOL_ID=ap-south-1_a4xkMF
 *   VITE_COGNITO_CLIENT_ID=2ethppqdbdp5a0391avdqo0
 *   VITE_AWS_REGION=ap-south-1
 */

import {
  CognitoUserPool,
  CognitoUser,
  CognitoUserAttribute,
  AuthenticationDetails,
  CognitoRefreshToken,
} from "amazon-cognito-identity-js";
import type {
  ISignUpResult,
  CognitoUserSession,
} from "amazon-cognito-identity-js";
import { COGNITO_USER_POOL_ID, COGNITO_CLIENT_ID } from "./env";

export const userPool = new CognitoUserPool({
  UserPoolId: COGNITO_USER_POOL_ID,
  ClientId: COGNITO_CLIENT_ID,
});

export interface CognitoAuthError {
  name?: string;
  code?: string;
  message: string;
}

export interface CognitoSessionTokens {
  accessToken: string;
  idToken: string;
  refreshToken: string;
}

function getCognitoUser(email: string): CognitoUser {
  return new CognitoUser({ Username: email.trim().toLowerCase(), Pool: userPool });
}

function sessionToTokens(session: CognitoUserSession): CognitoSessionTokens {
  return {
    accessToken: session.getAccessToken().getJwtToken(),
    idToken: session.getIdToken().getJwtToken(),
    refreshToken: session.getRefreshToken().getToken(),
  };
}

export const cognitoAuth = {
  /**
   * Registers a new user in the Cognito user pool with `email` as the
   * username. Cognito automatically emails a 6-digit verification code
   * (the "email OTP") to the address, which is confirmed via
   * `confirmSignUp`.
   */
  signUp(
    email: string,
    password: string,
    attributes: Record<string, string> = {}
  ): Promise<ISignUpResult> {
    const cleanEmail = email.trim().toLowerCase();
    return new Promise((resolve, reject) => {
      const attributeList: CognitoUserAttribute[] = [
        new CognitoUserAttribute({ Name: "email", Value: cleanEmail }),
        ...Object.entries(attributes)
          .filter(([, value]) => Boolean(value))
          .map(([Name, Value]) => new CognitoUserAttribute({ Name, Value })),
      ];

      userPool.signUp(cleanEmail, password, attributeList, [], (err, result) => {
        if (err || !result) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  },

  /** Confirms signup using the 6-digit OTP code emailed to the user. */
  confirmSignUp(email: string, code: string): Promise<void> {
    return new Promise((resolve, reject) => {
      getCognitoUser(email).confirmRegistration(code, true, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  },

  /**
   * Re-sends the email OTP code. Used both for the visible "Resend OTP"
   * button and internally by `isUnverifiedExistingUser` below.
   */
  resendConfirmationCode(email: string): Promise<void> {
    return new Promise((resolve, reject) => {
      getCognitoUser(email).resendConfirmationCode((err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  },

  /**
   * Cognito's `signUp()` rejects with the *same* `UsernameExistsException`
   * whether the email is already registered AND verified, or registered but
   * still sitting unverified from an abandoned signup. The API gives no way
   * to tell the two apart directly — the trick is that
   * `resendConfirmationCode` only succeeds for an *unconfirmed* user (it
   * fails with `InvalidParameterException` — "already confirmed" — for a
   * confirmed one). So on `UsernameExistsException` we probe with a resend:
   * success means "unverified, safe to drop them into the OTP modal",
   * failure means "already a real account, tell them to log in instead".
   */
  async isUnverifiedExistingUser(email: string): Promise<boolean> {
    try {
      await cognitoAuth.resendConfirmationCode(email);
      return true;
    } catch {
      return false;
    }
  },

  /** Logs in with email + password. Returns the raw Cognito session tokens. */
  login(email: string, password: string): Promise<CognitoSessionTokens> {
    return new Promise((resolve, reject) => {
      const user = getCognitoUser(email);
      const authDetails = new AuthenticationDetails({
        Username: email.trim().toLowerCase(),
        Password: password,
      });

      user.authenticateUser(authDetails, {
        onSuccess: (session) => resolve(sessionToTokens(session)),
        onFailure: (err) => reject(err),
      });
    });
  },

  /**
   * Exchanges the AWS Cognito refresh token for a fresh access/id token pair
   * (and, if AWS rotates it, a new refresh token) directly against Cognito —
   * no call to our own backend. This is what apiClient's silent-refresh-on-401
   * flow calls instead of a custom `/auth/refresh-token` REST endpoint.
   *
   * `username` must be the same Cognito username the tokens were originally
   * issued for (the email address used at sign up / login) — the SDK needs a
   * `CognitoUser` instance to attach the refreshed session to.
   */
  refreshSession(username: string, refreshTokenValue: string): Promise<CognitoSessionTokens> {
    return new Promise((resolve, reject) => {
      const user = getCognitoUser(username);
      const cognitoRefreshToken = new CognitoRefreshToken({ RefreshToken: refreshTokenValue });

      user.refreshSession(cognitoRefreshToken, (err, session: CognitoUserSession) => {
        if (err || !session) {
          reject(err);
          return;
        }
        resolve(sessionToTokens(session));
      });
    });
  },

  /** Step 1 of "Forgot Password" — emails an OTP code to reset with. */
  forgotPassword(email: string): Promise<void> {
    return new Promise((resolve, reject) => {
      getCognitoUser(email).forgotPassword({
        onSuccess: () => resolve(),
        onFailure: (err) => reject(err),
      });
    });
  },

  /** Step 2 of "Forgot Password" — OTP code + new password. */
  confirmPassword(email: string, code: string, newPassword: string): Promise<void> {
    return new Promise((resolve, reject) => {
      getCognitoUser(email).confirmPassword(code, newPassword, {
        onSuccess: () => resolve(),
        onFailure: (err) => reject(err),
      });
    });
  },

  /** Friendly, human-readable text for any error Cognito throws. */
  getErrorMessage(error: unknown): string {
    const err = error as CognitoAuthError;
    switch (err?.code || err?.name) {
      case "UsernameExistsException":
        return "This email is already registered.";
      case "CodeMismatchException":
        return "Invalid OTP. Please check the code and try again.";
      case "ExpiredCodeException":
        return "This OTP has expired. Please request a new one.";
      case "UserNotConfirmedException":
        return "Please verify your email before continuing.";
      case "NotAuthorizedException":
        return err.message || "Incorrect email or password.";
      case "UserNotFoundException":
        return "No account found with this email.";
      case "LimitExceededException":
      case "TooManyRequestsException":
        return "Too many attempts. Please wait a moment and try again.";
      case "InvalidPasswordException":
        return err.message || "Password does not meet the required policy.";
      case "InvalidParameterException":
        return err.message || "Invalid request. Please check your details.";
      default:
        return err?.message || "Something went wrong. Please try again.";
    }
  },
};

export default cognitoAuth;