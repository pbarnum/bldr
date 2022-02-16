export default {
  html: `<html>
    <body>
        <h1>Your account has been locked!</h1>
        <p>Too many failed attempts to log into your account has moved it into a "locked" state.</p>
        <p>Please contact {supportEmail} to help reset your password.</p>
    </body>
</html>
`,

  text: `Too many failed attempts detected to log into your account.

Your account has now been locked.

Please contact {supportEmail} for help.
`,
};
