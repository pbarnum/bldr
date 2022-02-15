export default {
  html: `<html>
    <body>
        <h1>Password Reset!</h1>
        <p>You have received this email because a request was made to reset your password.</p>
        <p>If this was you, please visit the link below to reset your password.</p>
        <h3><a href="{resetLink}">Click here to reset your password</a></h3>
        <p>If this was not your, please disregard this email.</p>
    </body>
</html>
`,

  text: `You have received this email because a request was made to reset your password.

If this was you, please visit {resetLink} to reset your password.

Otherwise, please disregard this email.
`,
};
